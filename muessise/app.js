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
// Load environment from project root .env so DB_NAME and ports are shared
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});
const useShared = config.useSharedDB["muessise"];

const connectDB = useShared
  ? (await import("../shared/utils/db.js")).default
  : (await import("./utils/db.js")).default;

await connectDB();

import { createClient } from "redis";
import session from "express-session";
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
import avankartPartnerRoutes from "./routes/avankartPartnerRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer(app);
const port = config.ports.muessise || process.env.PORT || 3004;
app.use(cookieParser());

const redisClient = createClient();
redisClient.connect();
const csrfProtection = csrf({ cookie: true });

const io = new Server(server, {
  withCredentials: true,
  cors: { origin: "*" },
});

initSocket(io);

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});

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
        "connect-src": [
          "'self'",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
        ],
      },
    },
  })
);

app.set("trust proxy", 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: "Too many requests.",
  headers: true,
});

app.use((req, res, next) => {
  const isMedia = req.path.match(
    /\.(jpg|jpeg|png|gif|webp|mp4|mp3|wav|ogg|svg)$/i
  );
  if (isMedia) return next();
  return limiter(req, res, next); 
});

const allowedOrigins = [`http://127.0.0.1:${port}`, `http://localhost:${port}`];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: true,
    },
  })
);

i18n.configure({
  locales: ["en", "ru", "tr", "az"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "az",
  cookie: "lang",
  updateFiles: false,
  objectNotation: true,
});

app.use(i18n.init);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (!req.cookies.lang) {
    req.setLocale("az");
  }
  res.locals.__ = res.__.bind(res);
  res.locals.__n = res.__n?.bind(res);
  res.locals.currentLocale = req.getLocale();
  res.locals.locales = i18n.getLocales();
  res.locals.clientIp = req.ip || req.connection.remoteAddress || "";
  res.locals.user = req.session.user || null;
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "/node_modules")));
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

app.use("/", mainRoute);
app.use("/auth", authRoute);
app.use("/otp", otpRouter);
app.use("/dashboardChart", dashboardChartsRouter);
app.use("/settings", settingsRoutes);
app.use("/muessise-info", muessiseInfoRoutes);
app.use("/api", fileUploadRoutes);
app.use("/hesablashmalar", hesablasmalarRoutes);
app.use("/", avankartPartnerRoutes);
app.use("/files", express.static(path.join(__dirname, "public", "files")));
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

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.log(err);

    return res.status(500).json({ message: "CSRF error", err });
  } else {
    next(err);
  }
});

app.use((req, res, next) => {
  res.render("pages/404");
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
