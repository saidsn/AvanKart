import express from "express";
import i18n from "i18n";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import config from "../config.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";

import mukafatRoutes from "../avankart/routes/emeliyyatlar/avankart/mukafat.js";

// TODO: UNCOMMENT
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

import helmet from "helmet";
import cors from "cors";
import partnerRoutes from "./routes/partnerRouter.js";
import peopleRoutes from "./routes/peopleRouter.js";
import avankartRoutes from "./routes/avankartazRouter.js";
import iconRoutes from "./routes/icon.js";

dotenv.config();
const useShared = config.useSharedDB["api"];

// ✅ DB bağlantısı
const connectDB = useShared
  ? (await import("../shared/utils/db.js")).default
  : (await import("./utils/db.js")).default;

await connectDB();

// ✅ Path ve Express ayarları
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = config.ports.api;

app.use(cookieParser());

// ✅ Redis bağlantısı (sadece production’da)
let redisClient;
if (process.env.NODE_ENV === "production") {
  redisClient = createClient({ legacyMode: true });
  await redisClient.connect().catch(console.error);
  console.log("✅ Redis session store aktif");
} else {
  console.log("⚠ Development mod: Redis devre dışı, MemoryStore kullanılacak");
}

// ✅ HTTPS redirect (sadece production’da)
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// ✅ Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "img-src": [
          "'self'",
          "data:",
          "http://localhost:*",
          "http://127.0.0.1:*",
          "*.avankart.com",
          "avankart.com",
        ],
      },
    },
  })
);

// ✅ CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // dev tools / Postman

      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      if (/^https?:\/\/([a-z0-9-]+\.)*avankart\.com$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  })
);

// ✅ Session middleware
app.use(
  session({
    store:
      process.env.NODE_ENV === "production"
        ? new RedisStore({ client: redisClient })
        : undefined, // dev'de MemoryStore
    secret: process.env.SECRET_KEY || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 gün
    },
  })
);

// ✅ i18n
i18n.configure({
  locales: config.supportedLangs,
  directory: path.join(__dirname, "locales"),
  defaultLocale: config.defaultLang,
  cookie: "lang",
  updateFiles: false,
  objectNotation: true,
});
app.use(i18n.init);

// ✅ Body-parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// ✅ Locale & user bilgisi middleware
app.use((req, res, next) => {
  if (!req.cookies.lang) req.setLocale("en");
  res.locals.currentLocale = req.getLocale();
  res.locals.locales = i18n.getLocales();
  res.locals.user = req.session.user || null;
  next();
});

// app.js'de route tanımları
app.use("/api/emeliyyatlar/avankart/mukafat", mukafatRoutes);

// ✅ Static dosyalar
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/node_modules")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ✅ URL helpers
app.use((req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  res.locals.getCurrentUrl = () =>
    req.protocol +
    (isProd ? "s" : "") +
    "://" +
    req.get("host") +
    req.originalUrl;
  res.locals.getCurrentDom = () =>
    req.protocol + (isProd ? "s" : "") + "://" + req.get("host");
  res.locals.compareCountum = (req.session.compare || []).length;
  res.locals.languages = [
    "en:united-kingdom:english",
    "ru:russia:russian",
    "tr:turkey:turkish",
    "az:azerbaijan:azerbaijan",
  ];
  res.locals.currentPath = req.path;
  next();
});

// ✅ Routes
const version = "/v1";
app.use(version + "/partner", partnerRoutes);
app.use(version + "/people", peopleRoutes);
app.use(version + "/avankartaz", avankartRoutes);
app.use(version + "/icon", iconRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use(version + "/", (req, res) => res.status(200).send({ status: "ok" }));
app.use("/", (req, res) => res.status(200).send({ status: "ok" }));

// ✅ Language switcher
app.get("/lang/:lang", (req, res) => {
  const newLang = req.params.lang;
  if (i18n.getLocales().includes(newLang)) {
    res.cookie("lang", newLang, {
      maxAge: 900000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
    });
  }
  return res.redirect(req.get("Referrer") || "/");
});

// ✅ Error handler
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(500).json({ message: "CSRF error", err });
  } else {
    next(err);
  }
});

// ✅ Socket.io
const server = createServer(app);
const io = new Server(server);

// Global io instance
global.io = io;

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
