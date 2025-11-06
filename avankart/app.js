import express from "express";
import expressLayouts from "express-ejs-layouts";
import i18n from "i18n";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import config from "../config.js";
import csrf from "csurf";
import dotenv from "dotenv";
const useShared = config.useSharedDB["avankart"];
dotenv.config();

const connectDB = useShared
  ? (await import("../shared/utils/db.js")).default
  : (await import("./utils/db.js")).default;

await connectDB();

// (Removed verbose SMTP diagnostics)

import { createClient } from "redis";
import session from "express-session";
import { RedisStore } from "connect-redis";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import http from "http";
import initSocket from "./socket/index.js";
import fileUploadRoutes from "./routes/fileUploadRoutes.js";

import mainRoute from "./routes/mainRouter.js";
import authRoute from "./routes/authRouter.js";
import otpRouter from "./routes/otpRouter.js";
import dashboardChartsRouter from "./routes/dashboardChartsRouter.js";
import settingsRoutes from "./routes/settingRouter.js";
import eqaimePageRouter from "./routes/emeliyyatlar/sirket/eqaime.js";
import hesablasmaRouter from "./routes/emeliyyatlar/muessise/hesablasma.js";
import avankartazRouter from "./routes/avankartazRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const port = config.ports.avankart || process.env.PORT || 3000;

// Redis client setup
const redisClient = createClient({
  // Redis configuration (opsiyonel)
  // host: 'localhost',
  // port: 6379,
  // password: process.env.REDIS_PASSWORD
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});

await redisClient.connect();

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// Socket.io setup
const io = new Server(server, {
  withCredentials: true,
  cors: { origin: "*" },
});

initSocket(io);

// 1. Basic middleware'ler
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 2. HTTPS redirect (production)
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

// 3. Trust proxy setting
app.set("trust proxy", 1);

// 4. Security middleware - Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'", "*.avankart.com", "avankart.com"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
          "*.avankart.com",
          "avankart.com",
        ],
        "script-src-attr": ["'self'", "'unsafe-inline'"],
        "img-src": [
          "'self'",
          "data:",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
          "*.avankart.com",
          "avankart.com",
          "http://localhost:*",   // ekleme
          "http://127.0.0.1:*",   // ekleme
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "*.avankart.com",
          "avankart.com",
          "http://localhost:*",
          "http://127.0.0.1:*",
        ],
        "font-src": [
          "'self'",
          "https://fonts.gstatic.com",
          "*.avankart.com",
          "avankart.com",
          "http://localhost:*",
          "http://127.0.0.1:*",
        ],
        "connect-src": [
          "'self'",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
          "*.avankart.com",
          "avankart.com",
          "http://localhost:*",
          "http://127.0.0.1:*",
        ],
      },
    },
  })
);

// 5. CORS
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

// 6. Rate limiting (static dosyalar hariç)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,
  message: "Too many requests.",
  headers: true,
});

app.use((req, res, next) => {
  const isMedia = req.path.match(
    /\.(jpg|jpeg|png|gif|webp|mp4|mp3|wav|ogg|svg|css|js|ico|woff|woff2|ttf|eot)$/i
  );
  if (isMedia) return next(); // medya/static dosyalar için rate limit yok
  return limiter(req, res, next); // diğer isteklerde uygula
});

// 7. Session middleware with Redis store
app.use(
  session({
    store:
      process.env.NODE_ENV === "production"
        ? new RedisStore({ client: redisClient })
        : "",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // GDPR uyumluluğu için false
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 saat
    },
  })
);

// 8. i18n configuration
i18n.configure({
  locales: ["en", "ru", "tr", "az"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  cookie: "lang",
  updateFiles: false,
  objectNotation: true,
});

app.use(i18n.init);

// 9. Locale ve locals setup
app.use((req, res, next) => {
  if (!req.cookies.lang) {
    req.setLocale("en");
  }
  res.locals.currentLocale = req.getLocale();
  res.locals.locales = i18n.getLocales();
  res.locals.clientIp = req.ip || req.connection.remoteAddress || "";
  res.locals.user = req.session.user || null;
  next();
});

// 10. View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("layout", "./layouts/main");
app.use(expressLayouts);

// 11. URL helper functions
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    res.locals.getCurrentUrl = function () {
      return req.protocol + "s://" + req.get("host") + req.originalUrl;
    };
    res.locals.getCurrentDom = function () {
      return req.protocol + "s://" + req.get("host");
    };
  } else {
    res.locals.getCurrentUrl = function () {
      return req.protocol + "://" + req.get("host") + req.originalUrl;
    };
    res.locals.getCurrentDom = function () {
      return req.protocol + "://" + req.get("host");
    };
  }
  const compare = req.session.compare || [];
  res.locals.compareCountum = compare.length;
  res.locals.languages = [
    "en:united-kingdom:english",
    "ru:russia:russian",
    "tr:turkey:turkish",
    "az:azerbaijan:azerbaijan",
  ];
  res.locals.currentPath = req.path;

  res.locals.getInitials = (name, surname) => {
    name = (name || "").trim();
    surname = (surname || "").trim();

    const firstLetter = name.charAt(0);
    const secondLetter = surname ? surname.charAt(0) : name.charAt(1) || "";

    return (firstLetter + secondLetter).toUpperCase();
  };
  next();
});

// 12. ⭐ STATIC DOSYALAR - Route'lardan ÖNCE!
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules")));

// 13. Language switcher route (CSRF gerektirmez)
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

// 14. CSRF token endpoint
app.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 15. Application routes (CSRF koruması ile)
// Custom CSRF exclusion for contract upload
app.use((req, res, next) => {
  // Exclude contract upload POST route from CSRF protection
  if (
    req.method === "POST" &&
    /^\/muessiseler\/[\w-]+\/contracts$/.test(req.path)
  ) {
    return next();
  }
  return csrfProtection(req, res, next);
});

app.use("/", mainRoute);
app.use("/auth", authRoute);
app.use("/otp", otpRouter);
app.use("/settings", settingsRoutes);
app.use("/api", fileUploadRoutes); // File upload CSRF gerektirmeyebilir
app.use("/emeliyyatlar/sirket/eqaime", eqaimePageRouter);
app.use("/emeliyyatlar/muessise/hesablasma", hesablasmaRouter);
app.use("/avankartaz", avankartazRouter);

// 16. CSRF Error Handler
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res
      .status(403)
      .json({ message: "CSRF token invalid", error: "CSRF_INVALID" });
  } else {
    next(err);
  }
});

// 17. General Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// 18. ⭐ 404 Handler - EN SON!
app.use((req, res) => res.status(404).render("pages/404"));

app.use((req, res) => {
  console.log(`404 - Not found: ${req.method} ${req.url}`);
  res.status(404).render("pages/404");
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
