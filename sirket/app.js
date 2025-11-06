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
const useShared = config.useSharedDB["sirket"];
dotenv.config();

console.log(
  "SESSION_SECRET loaded:",
  process.env.SESSION_SECRET ? "Yes" : "No"
);
console.log("NODE_ENV:", process.env.NODE_ENV);

const connectDB = useShared
  ? (await import("../shared/utils/db.js")).default
  : (await import("./utils/db.js")).default;

await connectDB();

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
import sorgularRouter from "./routes/sorgularRouter.js";
import muessiseInfoRoutes from "./routes/muessiseInfo.js";
import hesablasmalarRoutes from "./routes/hesablashmalar.js";
import qaimeRoutes from "./routes/qaimeRouter.js";
import iscilerRoutes from "./routes/ishcilerRoutes.js";
import invoiceRoutes from "./routes/invoice.js";
import balanceRoutes from "./routes/balance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const port = config.ports.sirket || process.env.PORT || 3000;

const redisClient = createClient({});
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});
redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});
await redisClient.connect();

const csrfProtection = csrf({ cookie: true });

const io = new Server(server, {
  withCredentials: true,
  cors: { origin: "*" },
});
initSocket(io);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  console.log("🔧 Trust proxy set to 1 for production");
} else {
  app.set("trust proxy", true);
  console.log("🔧 Trust proxy set to true for development");
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
        ],
        "script-src-attr": ["'self'", "'unsafe-inline'"],
        "img-src": [
          "'self'",
          "data:",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "connect-src": [
          "'self'",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
        ],
      },
    },
  })
);

app.use(
  cors({
    origin: `http://127.0.0.1:${port}`,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: "Too many requests.",
  headers: true,
});

app.use((req, res, next) => {
  const isMedia = req.path.match(
    /\.(jpg|jpeg|png|gif|webp|mp4|mp3|wav|ogg|svg|css|js|ico|woff|woff2|ttf|eot)$/i
  );
  if (isMedia) return next();
  return limiter(req, res, next);
});

app.use(
  session({
    store:
      process.env.NODE_ENV === "production"
        ? new RedisStore({ client: redisClient })
        : undefined,
    secret:
      process.env.SESSION_SECRET || "fallback-secret-key-for-development-only",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

i18n.configure({
  locales: ["en", "ru", "tr", "az"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  cookie: "lang",
  updateFiles: false,
  objectNotation: true,
});
app.use(i18n.init);

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

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("layout", "./layouts/main");
app.use(expressLayouts);

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

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules")));

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

app.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/sorgular", sorgularRouter);
app.use("/", csrfProtection, mainRoute);
app.use("/auth", authRoute);
app.use("/otp", csrfProtection, otpRouter);
app.use("/settings", csrfProtection, settingsRoutes);
app.use("/muessise-info", csrfProtection, muessiseInfoRoutes);
app.use("/api", fileUploadRoutes);
app.use("/api/invoice", csrfProtection, invoiceRoutes);
app.use("/api/balance", csrfProtection, balanceRoutes);
app.use("/qaime", csrfProtection, qaimeRoutes);
app.use("/isci", csrfProtection, iscilerRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.log("CSRF Token Error:", err);
    return res
      .status(403)
      .json({ message: "CSRF token invalid", error: "CSRF_INVALID" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error("=== Server Error Details ===");
  console.error("URL:", req.method, req.url);
  console.error("Error:", err);
  console.error("Error Stack:", err.stack);
  console.error("Error Code:", err.code);
  console.error("=============================");
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : null,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

app.use((req, res) => {
  console.log(`404 - Not found: ${req.method} ${req.url}`);
  res.status(404).render("pages/404");
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
