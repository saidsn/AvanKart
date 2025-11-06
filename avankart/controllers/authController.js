  import jwt from "jsonwebtoken";
  import User from "../models/userModel.js";
  import argon2 from "argon2";
  import { validationResult } from "express-validator";
  import i18n from "i18n";
  import {
    createSessionId,
    encrypt,
    decrypt,
    getFingerprintFromRequest,
  } from "../utils/crypto.js";
  import { createClient } from "redis";
  import AdminUser from "../../shared/models/adminUsersModel.js";
  import AdminSession from "../../shared/models/adminSessionModel.js";

  import {
    sendMail,
    sendSms,
    generateOtp,
    verifyAuthenticator,
  } from "../../shared/utils/otpHandler.js";
  import OtpModel from "../../shared/models/otp.js";
import { extractDeviceInfo, normalizeIP, generateFingerprint } from "../utils/fingerprint.js";
import {normalizeIp} from "../utils/crypto.js";

  const redisClient = createClient();
  redisClient.connect();

  const debug = process.env.NODE_ENV !== "production";
  function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  }
}

  export const login = async (req, res) => {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;

    return res.render("pages/auth/login", {
      error: "",
      csrfToken: req.csrfToken(),
      layout: "./layouts/auth",
    });
  };

  export const register = async (req, res) => {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;

    return res.render("pages/auth/register", {
      error: "",
      csrfToken: req.csrfToken(),
      layout: "./layouts/auth",
    });
  };

  export const logout = async (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      await redisClient.del(`session:${sessionId}`);
    }
    await res.clearCookie("sessionId");
    return res.redirect("/auth/login");
  };

  export const forgetPassword = async (req, res) => {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;

    return res.render("pages/auth/forgetPassword", {
      error: "",
      csrfToken: req.csrfToken(),
      layout: "./layouts/auth",
    });
  };

export const loginPost = async (req, res) => {
  try {
    // === Validation ===
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach(err => formattedErrors[err.path || err.param] = err.msg);
      return res.status(422).json({ errors: formattedErrors, csrfToken: req.csrfToken?.() });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ error: i18n.__("errors.auth.credentials_required"), csrfToken: req.csrfToken?.() });
    }

    // === Find user ===
    const user = await AdminUser.findOne({ email });
    if (!user) {
      return res.json({ error: i18n.__("errors.auth.credentials_wrong"), csrfToken: req.csrfToken?.() });
    }

    // === Verify password ===
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.json({ error: i18n.__("errors.auth.credentials_wrong"), csrfToken: req.csrfToken?.() });
    }

    // === Status check ===
    if ([1, 2].includes(Number(user.status))) {
      return res.json({ error: "Your login has been restricted.", csrfToken: req.csrfToken?.() });
    }

    // ✅ Device info al - normalize edilmiş IP ile
    const deviceInfo = extractDeviceInfo(req);

    // === Clear old sessions for this user ===
    try {
      const oldSessionKeys = await redisClient.keys("session:*");
      for (const key of oldSessionKeys) {
        const encrypted = await redisClient.get(key);
        if (!encrypted) continue;

        try {
          const data = decrypt(encrypted);
          if (data.user?.id === user._id.toString()) {
            await redisClient.del(key);
          }
        } catch (e) {
          console.warn("⚠️ failed to decrypt old session:", key);
        }
      }
    } catch (e) {
      console.warn("⚠️ redis old session cleanup failed", e);
    }

    // === Create new session ===
    const sessionId = createSessionId();
    
    // ✅ Session payload - normalize edilmiş fingerprint ile
    const sessionPayload = {
      user: { id: user._id, email: user.email },
      fingerprint: generateFingerprint(req), // ✅ Her zaman normalize edilmiş fingerprint
      createdAt: new Date(),
      deviceInfo
    };

    const sessionData = encrypt(sessionPayload);
    await redisClient.set(`session:${sessionId}`, sessionData, "EX", 86400); // 1 gün

    res.cookie("sessionId", sessionId, getCookieOptions());

    // === OTP ===
    let otpSended = false;
    const requireOtp = [user.otp_email_status, user.otp_sms_status, user.otp_authenticator_status].includes(1);
    if (requireOtp) {
      const otpCode = generateOtp(6);
      otpSended = true;

      await OtpModel.create({
        email: user.email,
        phone_suffix: user.phone_suffix,
        phone_number: user.phone,
        otp: otpCode,
        expire_time: new Date(Date.now() + 5 * 60 * 1000)
      });

      user.otp_code = otpCode;
      user.otp_send_time = new Date();
      await user.save();

      if (user.otp_email_status === 1) {
        await sendMail(user.email, user, otpCode, process.env.NODE_ENV !== "production");
      }
      if (user.otp_sms_status === 1 && user.phone && user.phone_suffix) {
        await sendSms(user.phone_suffix, user.phone, otpCode, process.env.NODE_ENV !== "production");
      }
    }

    // === Track login in AdminSession ===
    // ✅ MongoDB kaydı - normalize edilmiş IP ile
    const mongoResult = await AdminSession.findOneAndUpdate(
      { 
        user_id: user._id, 
        device_name: deviceInfo.userAgent, 
        location: normalizeIp(deviceInfo.ip) // ✅ Normalize edilmiş IP (127.0.0.1)
      },
      { 
        device_os: deviceInfo.deviceOs, 
        last_login_date: new Date(), 
        otp_verified: !otpSended,
        last_activity: new Date()
      },
      { upsert: true, new: true }
    );

    // ✅ Debug log'lar
    console.log("✅ Login successful - Fingerprint:", generateFingerprint(req));
    console.log("✅ Device Info:", deviceInfo);
    console.log("✅ MongoDB upsert result:", {
      _id: mongoResult._id,
      user_id: mongoResult.user_id,
      device_name: mongoResult.device_name,
      location: mongoResult.location,
      device_os: mongoResult.device_os,
      otp_verified: mongoResult.otp_verified
    });
    
    // ✅ Hemen ardından test sorgusu yapalım - verify'da kullanılan aynı sorgu
    const testQuery = await AdminSession.findOne({
      user_id: user._id,
      device_name: deviceInfo.userAgent,
      location: deviceInfo.ip
    });
    
    console.log("🔍 Test query result right after upsert:", testQuery ? "FOUND" : "NOT FOUND");
    if (testQuery) {
      console.log("🔍 Test query session:", {
        _id: testQuery._id,
        location: testQuery.location,
        otp_verified: testQuery.otp_verified
      });
    }

    return res.status(200).json({
      message: i18n.__("messages.auth.login_success"),
      success: true,
      csrfToken: req.csrfToken?.(),
      redirect: otpSended ? "/auth/otpVerify" : "/"
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Login failed",
      csrfToken: req.csrfToken?.(),
      timestamp: new Date().toISOString()
    });
  }
};
 

  export const registerPost = async (req, res) => {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;
    let referrer;
    // const socials = await Social.find({ [langFilter]: true });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => i18n.__(error.msg));
      return res.render("register", {
        error: formattedErrors[0],
        csrfToken: req.csrfToken(),
      });
    }

    const { username, password, email, phone, referal } = req.body;
    const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";

    try {
      const userExists = await User.findOne({
        $or: [
          { email: { $regex: new RegExp("^" + username + "$", "i") } },
          { phone: phone.startsWith("+") ? phone : `+${phone}` },
        ],
      });

      if (userExists) {
        return res.render("register", {
          error: i18n.__("errors.auth.user_already_registered"),
          csrfToken: req.csrfToken(),
        });
      }

      const refExists = await User.findOne({ referal });

      if (refExists) {
        referrer = refExists;
      }

      const hashedPassword = await argon2.hash(password);

      const newUser = await User.create({
        username,
        email,
        phone,
        password: hashedPassword,
        referrer: referrer,
      });

      const sessionId = createSessionId();
      const fingerprint =
        req.headers["x-client-fingerprint"] ||
        `${req.ip}-${req.headers["user-agent"]}`;

      const sessionData = encrypt(
        JSON.stringify({
          user: { id: newUser._id, email: newUser.email },
          fingerprint,
        })
      );

      await redisClient.set(`session:${sessionId}`, sessionData, "EX", 86400);

      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      // ----- Create Mongo Session for new user (otp_verified false) -----
      try {
        await AdminSession.create({
          device_name: req.headers["user-agent"] || "Unknown",
          device_os: req.headers["sec-ch-ua-platform"] || "Unknown",
          last_login_date: new Date(),
          location: req.ip,
          otp_verified: false,
          user_id: newUser._id,
        });
      } catch (err) {
        console.error("Mongo session create error (register):", err);
      }

      return res.redirect("/auth/otpVerify");
    } catch (err) {
      console.log(err);
      return res.render("register", {
        error: i18n.__("errors.auth.registration_failed"),
        csrfToken: req.csrfToken(),
      });
    }
  };

  export const forgetPasswordPost = async (req, res) => {
    const currentLang = req.getLocale();
    const langFilter = `lang.${currentLang}`;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach((err) => {
        const key = err.path || err.param;
        if (key) formattedErrors[key] = err.msg;
      });

      return res.status(422).json({
        errors: formattedErrors,
        csrfToken: req.csrfToken(),
      });
    }

    console.log("req.csrfToken()", req.csrfToken());

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
        csrfToken: req.csrfToken(),
      });
    }

    try {
      const user = await AdminUser.findOne({ email }).select(
        "email phone phone_suffix otp_email_status otp_sms_status otp_authenticator_status"
      );

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          csrfToken: req.csrfToken(),
        });
      }

      const otp = generateOtp();
      const expire_time = new Date(Date.now() + 5 * 60 * 1000 + 10000); // 5 min + 10 sec

      let otpSent = false;

      if (user.otp_email_status === 1) {
        try {
          await OtpModel.create({
            email: user.email,
            phone_suffix: user.phone_suffix,
            phone_number: user.phone,
            otp,
            expire_time,
          });

          user.otp_code = otp;
          user.otp_send_time = new Date();
          await user.save();

          await sendMail(user.email, otp, debug);
          otpSent = true;
        } catch (mailError) {
          console.error("=== Email OTP send error ===", mailError);
          return res.status(500).json({
            error: "Failed to send OTP via email",
            csrfToken: req.csrfToken(),
          });
        }
      } else if (user.otp_sms_status === 1 && user.phone && user.phone_suffix) {
        try {
          await OtpModel.create({
            email: user.email,
            phone_suffix: user.phone_suffix,
            phone_number: user.phone,
            otp,
            expire_time,
          });

          user.otp_code = otp;
          user.otp_send_time = new Date();
          await user.save();

          await sendSms(user.phone_suffix, user.phone, otp, debug);
          otpSent = true;
          console.log("=== SMS OTP sent successfully ===");
        } catch (smsError) {
          console.error("=== SMS OTP send error ===", smsError);
          return res.status(500).json({
            error: "Failed to send OTP via SMS",
            csrfToken: req.csrfToken(),
          });
        }
      } else if (user.otp_authenticator_status === 1) {
        try {
          await OtpModel.create({
            email: user.email,
            phone_suffix: user.phone_suffix,
            phone_number: user.phone,
            otp: "authenticator",
            expire_time,
          });

          user.otp_code = "authenticator";
          user.otp_send_time = new Date();
          await user.save();

          otpSent = true;
        } catch (authError) {
          console.error("=== Authenticator OTP setup error ===", authError);
          return res.status(500).json({
            error: "Failed to setup authenticator OTP",
            csrfToken: req.csrfToken(),
          });
        }
      } else {
        // No OTP methods enabled, defaulting to email
        try {
          await OtpModel.create({
            email: user.email,
            phone_suffix: user.phone_suffix,
            phone_number: user.phone,
            otp,
            expire_time,
          });

          user.otp_code = otp;
          user.otp_send_time = new Date();
          await user.save();

          await sendMail(user.email, otp, debug);
          otpSent = true;
        } catch (mailError) {
          console.error("=== Default email OTP send error ===", mailError);
          return res.status(500).json({
            error: "Failed to send OTP via email",
            csrfToken: req.csrfToken(),
          });
        }
      }

      if (!otpSent) {
        return res.status(500).json({
          error: "Failed to send OTP. Please try again later.",
          csrfToken: req.csrfToken(),
        });
      }

      const sessionId = createSessionId();
      const fingerprint =
        req.headers["x-client-fingerprint"] ||
        `${req.ip}-${req.headers["user-agent"]}`;
      const sessionData = encrypt(
        JSON.stringify({
          user: { id: user._id, email: user.email },
          fingerprint,
          isPasswordReset: true,
        })
      );

      await redisClient.set(`session:${sessionId}`, sessionData, "EX", 1800);

      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      // MongoDB session for password reset
      try {
        function cleanQuotes(str = "") {
          if (str.startsWith('"') && str.endsWith('"')) {
            return str.slice(1, -1);
          }
          return str;
        }

        const deviceOsRaw = req.headers["sec-ch-ua-platform"] || "Unknown";
        const deviceOs = cleanQuotes(deviceOsRaw);

        const sessionQuery = {
          user_id: user._id,
          location: req.ip,
          device_name: req.headers["user-agent"] || "Unknown",
        };

        const updateData = {
          device_os: deviceOs,
          last_login_date: new Date(),
          otp_verified: false,
        };

        await AdminSession.findOneAndUpdate(sessionQuery, updateData, {
          upsert: true,
          new: true,
        });
      } catch (err) {
        console.error("Mongo session create error (password reset):", err);
      }

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        csrfToken: req.csrfToken(),
        redirect: "/auth/forgot-password-otp",
      });
    } catch (err) {
      console.error("forgetPasswordPost error:", err.message);
      return res.status(500).json({
        error: "An error occurred on the server",
        csrfToken: req.csrfToken(),
      });
    }
  };

  export const otpVerifyPage = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await AdminUser.findById(userId);

      if (!user) {
        return res.redirect("/auth/logout");
      }

      // Kullanıcı hangi yöntemi seçtiyse onu destination olarak ata
      let destination = user.otp_destination || "email";
      let viewName;

      switch (destination) {
        case "sms":
          viewName = "pages/auth/otp/otpSms";
          break;
        case "authenticator":
          viewName = "pages/auth/otp/otpAuthenticator";
          break;
        case "email":
        default:
          viewName = "pages/auth/otp/otpEmail";
          break;
      }

      const sentTime = user.otp_send_time || new Date();
      const now = new Date();

      const OTP_TTL_MS = 5 * 60 * 1000; // 5 dk + 10 sn
      const expireTime = new Date(sentTime.getTime() + OTP_TTL_MS);
      const diffMs = Math.max(expireTime - now, 0);

      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      const countdown = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      console.log("Rendered view:", viewName);
      console.log("OTP Destination:", destination);

      return res.render(viewName, {
        csrfToken: req.csrfToken(),
        layout: "./layouts/auth",
        to: maskEmail(user[destination]) ?? destination,
        countdown,
        destination,
        otp_email_status: user.otp_email_status,
        otp_sms_status: user.otp_sms_status,
        otp_authenticator_status: user.otp_authenticator_status,
      });
    } catch (err) {
      console.error("OTP verify page error:", err);
      return res.status(500).render("pages/errors/500", { layout: false });
    }
  };

  export const otpVerifyPost = async (req, res) => {
    const userId = req.user;
    if (!userId)
      return res.json({
        error: i18n.__("errors.auth.login_required"),
        csrfToken: req.csrfToken(),
        redirect: "/auth/logout",
      });

    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const cleanOtp =
      otp1.trim() +
      otp2.trim() +
      otp3.trim() +
      otp4.trim() +
      otp5.trim() +
      otp6.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.json({
        error: i18n.__("errors.otp.length_required"),
        csrfToken: req.csrfToken(),
      });
    }

    const user = await AdminUser.findById(userId.id);
    if (!user) return res.redirect("/");

    let otpData = await OtpModel.findOne({ email: user.email });
    if (!otpData) {
      return res.json({
        error: i18n.__("errors.otp.not_found_or_expired"),
        csrfToken: req.csrfToken(),
      });
    }
    if (otpData.attempts >= 3) {
      return res.json({
        error: i18n.__("errors.otp.invalid"),
        csrfToken: req.csrfToken(),
      });
    }
    if (otpData.attempts >= 5) {
      user.otp_code = null;
      await OtpModel.deleteOne({ _id: otpData._id });
      await user.save();
      return res.json({
        error: i18n.__("errors.otp.too_many_attempts"),
        csrfToken: req.csrfToken(),
      });
    }
    if (user.otp_code !== cleanOtp) {
      otpData.attempts++;
      await otpData.save();
      return res.json({
        error: i18n.__("errors.otp.wrong"),
        csrfToken: req.csrfToken(),
      });
    }

    user.otp_verified = true;
    user.otp_code = null;

    await user.save();

    req.session.otpVerified = true;

    function cleanQuotes(str = "") {
      if (str.startsWith('"') && str.endsWith('"')) {
        return str.slice(1, -1);
      }
      return str;
    }

    const deviceOsRaw = req.headers["sec-ch-ua-platform"] || "Unknown";
    const deviceOs = cleanQuotes(deviceOsRaw);

    await AdminSession.findOneAndUpdate(
      { user_id: user._id },
      {
        device_name: req.headers["user-agent"] || "Unknown",
        device_os: deviceOs,
        last_login_date: new Date(),
        location: req.ip,
        otp_verified: true,
        user_id: user._id,
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: i18n.__("messages.auth.login_success"),
      csrfToken: req.csrfToken(),
      redirect: "/",
    });
  };

  const maskEmail = (email) => {
    if (!email || typeof email !== "string") return "";

    const [local, domain] = email.split("@");
    const len = local.length;

    if (len <= 1) {
      return `*@${domain}`;
    }

    if (len === 2) {
      return `${local[0]}*@${domain}`;
    }

    if (len === 3) {
      return `${local[0]}*${local[2]}@${domain}`;
    }

    const visibleStart = local.slice(0, 2);
    const visibleEnd = local.slice(-2);
    const masked = "*".repeat(len - 4);

    return `${visibleStart}${masked}${visibleEnd}@${domain}`;
  };

  export const forgotPasswordOtherPost = async (req, res) => {
    const { email, method } = req.body;

    if (!email || !method) {
      return res
        .status(400)
        .json({ error: i18n.__("errors.auth.email_method_required") });
    }

    try {
      const user = await AdminUser.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ error: i18n.__("errors.auth.user_not_found") });
      }

      const otp = generateOtp();
      let sendSuccess = false;

      if (method === "phone" && user.phone && user.phone_suffix) {
        sendSuccess = await sendSms(user.phone_suffix, user.phone, otp, debug);
      } else if (method === "authenticator" && user.email) {
        sendSuccess = await sendMail(user.email, otp);
      } else {
        return res.status(400).json({
          error: i18n.__("errors.auth.invalid_send_method_or_contact"),
        });
      }

      if (!sendSuccess) {
        return res.status(500).json({
          error: i18n.__("errors.auth.otp_send_failed"),
        });
      }

      const newOtp = new OtpModel({
        userId: user._id,
        otp,
        method,
        expireAt: Date.now() + 5 * 60 * 1000,
      });
      await newOtp.save();

      return res.json({
        success: true,
        method,
        contact: method === "phone" ? user.phone : user.email,
        redirect: "/auth/otp",
      });
    } catch (err) {
      console.error("forgotPasswordOtherPost error:", err.message);
      return res.status(500).json({ error: i18n.__("errors.auth.server_error") });
    }
  };

  export const sendOtherOtpPost = async (req, res) => {
    try {
      const { destination } = req.body;
      const debugMode = process.env.NODE_ENV === "development";
      const userId = req.user.id;

      const user = await AdminUser.findById(userId);
      if (!user) return res.redirect("/auth/logout");

      const otpStatusMap = {
        sms: user.otp_sms_status,
        email: user.otp_email_status,
        authenticator: user.otp_authenticator_status,
      };

      if (otpStatusMap[destination] !== 1) {
        return res.status(400).json({
          success: false,
          message: i18n.__("messages.otp.method_not_enabled", { destination }),
          csrfToken: req.csrfToken(),
        });
      }

      const otp = generateOtp();
      const expire_time = new Date(Date.now() + 5 * 60 * 1000 + 10000);

      // Save OTP
      await OtpModel.create({
        email: user.email,
        phone_suffix: user.phone_suffix,
        phone_number: user.phone,
        otp,
        expire_time,
        user_id: user._id,
      });

      // Send OTP
      let sendResult = false;
      if (destination === "sms") {
        sendResult = await sendSms(user.phone_suffix, user.phone, otp, debugMode);
      } else if (destination === "email") {
        sendResult = await sendMail(user.email, otp, debugMode);
      } else if (destination === "authenticator") {
        sendResult = true;
      }

      if (!sendResult) {
        return res.status(500).json({
          success: false,
          message: i18n.__("messages.otp.send_failed"),
          csrfToken: req.csrfToken(),
        });
      }

      // Update user
      user.otp_code = destination === "authenticator" ? "authenticator" : otp;
      user.otp_send_time = new Date();
      user.otp_destination = destination;
      await user.save();

      // render pages
      const viewMap = {
        email: "pages/auth/otp/otpEmail",
        authenticator: "pages/auth/otp/otpAuthenticator",
      };

      return res.status(200).json({
        success: true,
        message: i18n.__("messages.otp.sent"),
        csrfToken: req.csrfToken(),
        redirect: "/auth/otpVerify",
      });
    } catch (error) {
      console.error("sendOtherOtpPost error:", error.message);
      return res.status(500).json({
        success: false,
        message: i18n.__("messages.otp.internal_server_error"),
        csrfToken: req.csrfToken(),
      });
    }
  };
