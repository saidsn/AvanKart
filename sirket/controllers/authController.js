import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import argon2 from "argon2";
import { validationResult } from "express-validator";
import i18n from "i18n";
import { createSessionId, encrypt, decrypt } from "../utils/crypto.js";
import { createClient } from "redis";
// import PartnerUser from "../../shared/models/partnyorUserModel.js";
// import Session from "../../shared/model/partner/sessionModel.js";

import PeopleUser from "../../shared/models/peopleUserModel.js";
import PeopleSession from "../../shared/model/people/peopleSessionModel.js";

import {
  sendMail,
  sendSms,
  generateOtp,
  verifyAuthenticator,
} from "../../shared/utils/otpHandler.js";
import OtpModel from "../../shared/models/otp.js";
import {
  extractDeviceInfo,
  normalizeIP,
  generateFingerprint,
} from "../utils/fingerprint.js";
import { normalizeIp, getRawIp } from "../utils/crypto.js";
import speakeasy from "speakeasy";
const redisClient = createClient();
redisClient.connect();

const debug = process.env.NODE_ENV !== "production";

/**
 * Enhanced cookie configuration
 */

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "Strict" : "Lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
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
  let userId;

  if (sessionId) {
    try {
      const encryptedSession = await redisClient.get(`session:${sessionId}`);
      if (encryptedSession) {
        const sessionData = decrypt(encryptedSession);
        userId = sessionData.user?.id?.toString()?.trim();
        console.log("UserId from session:", userId);
      }

      await redisClient.del(`session:${sessionId}`).catch(() => { });
    } catch (err) {
      console.error("Redis logout error:", err);
    }

    try {
      if (userId) {
        const sessions = await PeopleSession.find({});
        console.log(`Total sessions in collection: ${sessions.length}`);

        let deletedCount = 0;
        for (const session of sessions) {
          if (session.user_id.toString() === userId) {
            await PeopleSession.deleteOne({ _id: session._id });
            deletedCount++;
          }
        }

        console.log(`✅ Total sessions deleted for user ${userId}: ${deletedCount}`);
      } else {
        console.warn("⚠️ No userId found, MongoDB sessions not deleted");
      }
    } catch (err) {
      console.error("Mongo session delete error:", err);
    }
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
    const user = await PeopleUser.findOne({ email });
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

    // ✅ Device info al
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
    const sessionPayload = {
      user: { id: user._id, email: user.email },
      fingerprint: generateFingerprint(req),
      createdAt: new Date(),
      deviceInfo
    };
    const sessionData = encrypt(sessionPayload);
    await redisClient.set(`session:${sessionId}`, sessionData, "EX", 86400);
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

      if (user.otp_email_status === 1) await sendMail(user.email, user, otpCode, process.env.NODE_ENV !== "production");
      if (user.otp_sms_status === 1 && user.phone && user.phone_suffix) await sendSms(user.phone_suffix, user.phone, otpCode, process.env.NODE_ENV !== "production");
    }

    // === Track login in PeopleSession ===
    const mongoResult = await PeopleSession.findOneAndUpdate(
      {
        user_id: user._id,
        device_name: deviceInfo.userAgent,
        location: normalizeIp(deviceInfo.ip)
      },
      {
        device_os: deviceInfo.deviceOs,
        last_login_date: new Date(),
        otp_verified: !otpSended,
        last_activity: new Date()
      },
      { upsert: true, new: true }
    );

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

    const testQuery = await PeopleSession.findOne({
      user_id: user._id,
      device_name: deviceInfo.userAgent,
      location: normalizeIp(deviceInfo.ip)
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


// ✅ Bu import'ları loginPost dosyanızın başına ekleyin:
// import {
//   decrypt,
//   encrypt,
//   createSessionId,
//   generateFingerprint,
//   extractDeviceInfo
// } from '../utils/crypto.js';

// export const loginPost = async (req, res) => {
//   console.log("🚀 === LOGIN POST STARTED ===");
//   console.log("⏰ Timestamp:", new Date().toISOString());
//   console.log("📝 Request headers:", JSON.stringify(req.headers, null, 2));
//   console.log("📝 Request body:", JSON.stringify(req.body, null, 2));
//   console.log("📝 Request IP:", req.ip);
//   console.log("📝 Request cookies:", JSON.stringify(req.cookies, null, 2));

//   const currentLang = req.getLocale();
//   const langFilter = `lang.${currentLang}`;
//   console.log("🌐 Current language:", currentLang);
//   console.log("🌐 Language filter:", langFilter);

//   // Validation check
//   console.log("✅ === VALIDATION CHECK ===");
//   const errors = validationResult(req);
//   console.log("📋 Validation errors empty?", errors.isEmpty());

//   if (!errors.isEmpty()) {
//     console.log("❌ Validation errors found:", JSON.stringify(errors.array(), null, 2));
//     const formattedErrors = {};
//     errors.array().forEach((err) => {
//       const key = err.path || err.param;
//       if (key) formattedErrors[key] = err.msg;
//       console.log(`❌ Error for field "${key}":`, err.msg);
//     });

//     console.log("❌ Formatted validation errors:", JSON.stringify(formattedErrors, null, 2));
//     console.log("📤 Sending 422 response with validation errors");
//     return res.status(422).json({
//       errors: formattedErrors,
//       csrfToken: req.csrfToken(),
//     });
//   }
//   console.log("✅ Validation passed successfully");

//   const { email, password } = req.body;
//   console.log("📧 Login attempt for email:", email);
//   console.log("🔐 Password provided:", password ? "YES" : "NO");
//   console.log("🔐 Password length:", password ? password.length : 0);

//   // Check if email and password exist
//   if (!email || !password) {
//     console.log("❌ === CREDENTIALS MISSING ===");
//     console.log("❌ Email missing:", !email);
//     console.log("❌ Password missing:", !password);
//     console.log("📤 Sending error response: credentials_required");
//     return res.json({
//       error: i18n.__("errors.auth.credentials_required"),
//       csrfToken: req.csrfToken(),
//     });
//   }

//   try {
//     console.log("🔍 === DATABASE USER SEARCH ===");
//     console.log("🔍 Searching for user with email:", email);
//     console.log("🔍 Database query: PeopleUser.findOne({ email:", email, "})");

//     const user = await PeopleUser.findOne({ email });
//     console.log("👤 User found:", user ? "YES" : "NO");

//     if (!user) {
//       console.log("❌ === USER NOT FOUND ===");
//       console.log("❌ No user found with email:", email);
//       console.log("📤 Sending error response: credentials_wrong");
//       return res.json({
//         error: i18n.__("errors.auth.credentials_wrong"),
//         csrfToken: req.csrfToken(),
//       });
//     }

//     console.log("👤 === USER DETAILS ===");
//     console.log("👤 User ID:", user._id);
//     console.log("👤 User email:", user.email);
//     console.log("👤 User status:", user.status);
//     console.log("👤 User phone:", user.phone ? "EXISTS" : "NOT SET");
//     console.log("👤 User phone suffix:", user.phone_suffix || "NOT SET");
//     console.log("👤 OTP Email Status:", user.otp_email_status);
//     console.log("👤 OTP SMS Status:", user.otp_sms_status);
//     console.log("👤 OTP Authenticator Status:", user.otp_authenticator_status);
//     console.log("👤 Last OTP send time:", user.otp_send_time || "NEVER");
//     console.log("👤 OTP verified:", user.otp_verified);

//     // Password verification
//     console.log("🔐 === PASSWORD VERIFICATION ===");
//     console.log("🔐 Starting password verification with argon2...");
//     console.log("🔐 Password hash exists:", user.password ? "YES" : "NO");
//     console.log("🔐 Password hash length:", user.password ? user.password.length : 0);

//     const isPasswordValid = await argon2.verify(user.password, password);
//     console.log("🔐 Password verification result:", isPasswordValid);

//     if (!isPasswordValid) {
//       console.log("❌ === INVALID PASSWORD ===");
//       console.log("❌ Password verification failed for user:", email);
//       console.log("📤 Sending error response: credentials_wrong");
//       return res.json({
//         error: i18n.__("errors.auth.credentials_wrong"),
//         csrfToken: req.csrfToken(),
//       });
//     }
//     console.log("✅ Password verification successful");

//     // Status check
//     console.log("👮 === USER STATUS CHECK ===");
//     const st = Number(user.status);
//     console.log("👮 User status (raw):", user.status);
//     console.log("👮 User status (converted to number):", st);
//     console.log("👮 Status is 1 (restricted)?", st === 1);
//     console.log("👮 Status is 2 (restricted)?", st === 2);

//     if (st === 1 || st === 2) {
//       console.log("❌ === USER LOGIN RESTRICTED ===");
//       console.log("❌ User status indicates login restriction:", st);
//       console.log("📤 Sending error response: login restricted");
//       return res.json({
//         error: "Your login has been restricted.",
//         csrfToken: req.csrfToken(),
//       });
//     }
//     console.log("✅ User status check passed");

//     // Session creation
//     console.log("🔑 === SESSION CREATION ===");
//     const sessionId = createSessionId();
//     console.log("🔑 Generated session ID:", sessionId);
//     console.log("🔑 Session ID length:", sessionId.length);

//     const fingerprint = req.headers["x-client-fingerprint"] || `${req.ip}-${req.headers["user-agent"]}`;
//     // const fingerprint = req.headers["x-client-fingerprint"] || `${normalizeIP(req.ip)}-${req.headers["user-agent"]}`;

//     console.log("👆 === FINGERPRINT GENERATION ===");
//     console.log("👆 X-Client-Fingerprint header:", req.headers["x-client-fingerprint"]);
//     console.log("👆 Request IP:", req.ip);
//     console.log("👆 User-Agent:", req.headers["user-agent"]);
//     console.log("👆 Final fingerprint:", fingerprint);
//     console.log("👆 Fingerprint length:", fingerprint.length);

//     const sessionPayload = {
//       user: { id: user._id, email: user.email },
//       fingerprint
//     };
//     console.log("📦 === SESSION PAYLOAD ===");
//     console.log("📦 Session payload before encryption:", JSON.stringify(sessionPayload, null, 2));
//     console.log("📦 Payload size (bytes):", JSON.stringify(sessionPayload).length);

//     console.log("🔐 === SESSION ENCRYPTION ===");
//     const sessionData = encrypt(JSON.stringify(sessionPayload));
//     console.log("🔐 Session data encrypted successfully");
//     console.log("🔐 Encrypted session data length:", sessionData.length);
//     console.log("🔐 Encrypted data preview (first 50 chars):", sessionData.substring(0, 50) + "...");

//     // Redis operations
//     console.log("💾 === REDIS OPERATIONS ===");
//     console.log("💾 Redis client ready:", redisClient.isReady);
//     console.log("💾 Redis client connected:", redisClient.isOpen);
//     console.log("💾 Setting session in Redis with key:", `session:${sessionId}`);
//     console.log("💾 Session TTL: 86400 seconds (24 hours)");
//     console.log("💾 Expire time:", new Date(Date.now() + 86400000).toISOString());

//     try {
//       console.log("💾 Executing Redis SET command...");
//       await redisClient.set(`session:${sessionId}`, sessionData, "EX", 86400);
//       console.log("✅ Session saved to Redis successfully");

//       // Verify the save
//       const verifyData = await redisClient.get(`session:${sessionId}`);
//       console.log("💾 Verification: Session exists in Redis:", verifyData ? "YES" : "NO");
//       console.log("💾 Verification: Data length matches:", verifyData?.length === sessionData.length);
//     } catch (redisError) {
//       console.log("❌ === REDIS ERROR ===");
//       console.log("❌ Redis session save error:", redisError);
//       console.log("❌ Error name:", redisError.name);
//       console.log("❌ Error message:", redisError.message);
//       console.log("❌ Error stack:", redisError.stack);
//       throw redisError;
//     }

//     // Cookie setting
//     console.log("🍪 === COOKIE SETTING ===");
//     console.log("🍪 Environment:", process.env.NODE_ENV);
//     console.log("🍪 Is production:", process.env.NODE_ENV === "production");

//     const cookieOptions = {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "Strict",
//     };
//     console.log("🍪 Cookie options:", JSON.stringify(cookieOptions, null, 2));
//     console.log("🍪 Cookie name: sessionId");
//     console.log("🍪 Cookie value:", sessionId);
//     console.log("🍪 HttpOnly:", cookieOptions.httpOnly);
//     console.log("🍪 Secure:", cookieOptions.secure);
//     console.log("🍪 SameSite:", cookieOptions.sameSite);

//     res.cookie("sessionId", sessionId, cookieOptions);
//     console.log("✅ Session cookie set successfully");

//     // OTP requirements check
//     console.log("📱 === OTP REQUIREMENTS CHECK ===");
//     let otpSended = false;

//     console.log("📱 Checking OTP configurations...");
//     console.log("📱 Email OTP status:", user.otp_email_status);
//     console.log("📱 SMS OTP status:", user.otp_sms_status);
//     console.log("📱 Authenticator OTP status:", user.otp_authenticator_status);

//     const requireOtp = user.otp_email_status === 1 || user.otp_sms_status === 1 || user.otp_authenticator_status === 1;

//     console.log("📱 === OTP REQUIREMENT ANALYSIS ===");
//     console.log("📱 Email OTP enabled:", user.otp_email_status === 1);
//     console.log("📱 SMS OTP enabled:", user.otp_sms_status === 1);
//     console.log("📱 Authenticator OTP enabled:", user.otp_authenticator_status === 1);
//     console.log("📱 Requires any OTP:", requireOtp);

//     if (requireOtp) {
//       console.log("📱 === OTP GENERATION AND SENDING ===");
//       console.log("📱 User requires OTP verification");

//       const otpCode = generateOtp(6);
//       console.log("📱 Generated OTP code:", otpCode);
//       console.log("📱 OTP code length:", otpCode.length);

//       const currentTime = new Date();
//       const expire_time = new Date(Date.now() + 5 * 60 * 1000 + 10000); // 5 dk + 10 sn
//       console.log("📱 Current time:", currentTime.toISOString());
//       console.log("📱 OTP expire time:", expire_time.toISOString());
//       console.log("📱 OTP validity duration: 5 minutes 10 seconds");

//       console.log("📱 === SAVING OTP TO DATABASE ===");
//       try {
//         console.log("📱 Creating OTP record...");
//         console.log("📱 OTP data to save:", {
//           email: user.email,
//           phone_suffix: user.phone_suffix,
//           phone_number: user.phone,
//           otp: otpCode,
//           expire_time: expire_time.toISOString()
//         });

//         const otpRecord = await OtpModel.create({
//           email: user.email,
//           phone_suffix: user.phone_suffix,
//           phone_number: user.phone,
//           otp: otpCode,
//           expire_time,
//         });
//         console.log("✅ OTP record created in database");
//         console.log("✅ OTP record ID:", otpRecord._id);
//         console.log("✅ OTP record created at:", otpRecord.createdAt);
//         otpSended = true;
//       } catch (otpDbError) {
//         console.log("❌ === OTP DATABASE ERROR ===");
//         console.log("❌ OTP database save error:", otpDbError);
//         console.log("❌ Error name:", otpDbError.name);
//         console.log("❌ Error message:", otpDbError.message);
//         console.log("❌ Error stack:", otpDbError.stack);
//         throw otpDbError;
//       }

//       console.log("📱 === UPDATING USER WITH OTP INFO ===");
//       console.log("📱 Setting user.otp_code:", otpCode);
//       console.log("📱 Setting user.otp_send_time:", new Date().toISOString());

//       user.otp_code = otpCode;
//       user.otp_send_time = new Date();

//       try {
//         console.log("📱 Saving user with OTP info...");
//         await user.save();
//         console.log("✅ User updated with OTP info successfully");
//         console.log("✅ User OTP code saved:", user.otp_code);
//         console.log("✅ User OTP send time saved:", user.otp_send_time);
//       } catch (userSaveError) {
//         console.log("❌ === USER SAVE ERROR ===");
//         console.log("❌ User OTP info save error:", userSaveError);
//         console.log("❌ Error name:", userSaveError.name);
//         console.log("❌ Error message:", userSaveError.message);
//         console.log("❌ Error stack:", userSaveError.stack);
//         throw userSaveError;
//       }

//       // Email OTP sending
//       if (user.otp_email_status === 1) {
//         console.log("📧 === SENDING EMAIL OTP ===");
//         console.log("📧 Email OTP is enabled for user");
//         console.log("📧 Sending OTP via email to:", user.email);
//         console.log("📧 OTP code to send:", otpCode);
//         console.log("📧 Debug mode:", debug);
//         console.log("📧 Environment:", process.env.NODE_ENV);

//         try {
//           console.log("📧 Calling sendMail function...");
//           await sendMail(user.email, user, otpCode, debug);
//           console.log("✅ Email OTP sent successfully");
//           console.log("✅ Email sent to:", user.email);
//           console.log("✅ Email sent at:", new Date().toISOString());
//         } catch (emailError) {
//           console.log("❌ === EMAIL SEND ERROR ===");
//           console.log("❌ Email OTP send error:", emailError);
//           console.log("❌ Error name:", emailError.name);
//           console.log("❌ Error message:", emailError.message);
//           console.log("❌ Error stack:", emailError.stack);
//           // Don't throw, continue with login
//         }
//       } else {
//         console.log("📧 Email OTP is not enabled for this user");
//       }

//       // SMS OTP sending
//       if (user.otp_sms_status === 1) {
//         console.log("📱 === SENDING SMS OTP ===");
//         console.log("📱 SMS OTP is enabled for user");
//         console.log("📱 Phone suffix:", user.phone_suffix);
//         console.log("📱 Phone number:", user.phone);
//         console.log("📱 OTP code to send:", otpCode);

//         if (user.phone && user.phone_suffix) {
//           try {
//             console.log("📱 Calling sendSms function...");
//             await sendSms(user.phone_suffix, user.phone, otpCode, debug);
//             console.log("✅ SMS OTP sent successfully");
//             console.log("✅ SMS sent to:", user.phone);
//             console.log("✅ SMS sent at:", new Date().toISOString());
//           } catch (smsError) {
//             console.log("❌ === SMS SEND ERROR ===");
//             console.log("❌ SMS OTP send error:", smsError);
//             console.log("❌ Error name:", smsError.name);
//             console.log("❌ Error message:", smsError.message);
//             console.log("❌ Error stack:", smsError.stack);
//             // Don't throw, continue with login
//           }
//         } else {
//           console.log("⚠️ SMS OTP enabled but phone number missing");
//         }
//       } else {
//         console.log("📱 SMS OTP is not enabled for this user");
//       }

//       // Authenticator OTP
//       if (user.otp_authenticator_status === 1) {
//         console.log("🔐 === AUTHENTICATOR OTP ===");
//         console.log("🔐 Authenticator OTP is enabled for user");
//         console.log("🔐 User should enter code from authenticator app");
//       } else {
//         console.log("🔐 Authenticator OTP is not enabled for this user");
//       }

//       console.log("📱 === OTP SENDING COMPLETED ===");
//       console.log("📱 OTP was sent:", otpSended);
//     } else {
//       console.log("📱 No OTP required for this user");
//       console.log("📱 User can login directly without OTP");
//     }

//     // MongoDB session operations
//     console.log("🗄️ === MONGODB SESSION OPERATIONS ===");

//     try {
//       console.log("🗄️ Starting MongoDB session update...");

//       function cleanQuotes(str = "") {
//         console.log("🗄️ Cleaning quotes from string:", str);
//         if (str.startsWith('"') && str.endsWith('"')) {
//           const cleaned = str.slice(1, -1);
//           console.log("🗄️ Cleaned string:", cleaned);
//           return cleaned;
//         }
//         console.log("🗄️ String doesn't need cleaning");
//         return str;
//       }

//       const deviceOsRaw = req.headers["sec-ch-ua-platform"] || "Unknown";
//       const deviceOs = cleanQuotes(deviceOsRaw);

//       console.log("🗄️ === DEVICE INFO EXTRACTION ===");
//       console.log("🗄️ Raw device OS header:", deviceOsRaw);
//       console.log("🗄️ Cleaned device OS:", deviceOs);
//       console.log("🗄️ User agent:", req.headers["user-agent"]);
//       console.log("🗄️ Client IP:", req.ip);
//       console.log("🗄️ OTP sent status:", otpSended);
//       console.log("🗄️ OTP verified status:", !otpSended);

//       const updateData = {
//         device_os: deviceOs,
//         last_login_date: new Date(),
//         otp_verified: !otpSended,
//       };
//       console.log("🗄️ MongoDB session update data:", JSON.stringify(updateData, null, 2));

//       const sessionQuery = {
//         user_id: user._id,
//         location: req.ip,
//         device_name: req.headers["user-agent"] || "Unknown",
//       };
//       console.log("🗄️ MongoDB session query:", JSON.stringify(sessionQuery, null, 2));

//       console.log("🗄️ Performing MongoDB findOneAndUpdate...");
//       const mongoSession = await PeopleSession.findOneAndUpdate(sessionQuery, updateData, {
//         upsert: true,
//         new: true,
//       });

//       console.log("✅ === MONGODB SESSION UPDATED ===");
//       console.log("✅ MongoDB session ID:", mongoSession._id);
//       console.log("✅ MongoDB session user_id:", mongoSession.user_id);
//       console.log("✅ MongoDB session device_os:", mongoSession.device_os);
//       console.log("✅ MongoDB session location:", mongoSession.location);
//       console.log("✅ MongoDB session last_login_date:", mongoSession.last_login_date);
//       console.log("✅ MongoDB session otp_verified:", mongoSession.otp_verified);
//       console.log("✅ MongoDB session full data:", JSON.stringify(mongoSession, null, 2));

//     } catch (err) {
//       console.log("❌ === MONGODB SESSION UPDATE ERROR ===");
//       console.error("❌ Mongo session update error:", err);
//       console.error("❌ Error name:", err.name);
//       console.error("❌ Error message:", err.message);
//       console.error("❌ Error stack:", err.stack);
//       // Don't throw, continue with login response
//     }

//     // Final response
//     console.log("🎉 === PREPARING LOGIN SUCCESS RESPONSE ===");
//     const responseData = {
//       message: i18n.__("messages.auth.login_success"),
//       success: true,
//       csrfToken: req.csrfToken(),
//       redirect: "/",
//     };
//     console.log("🎉 Response data:", JSON.stringify(responseData, null, 2));
//     console.log("🎉 Response status code: 200");
//     console.log("🎉 Response redirect URL:", responseData.redirect);
//     console.log("🎉 Response success:", responseData.success);
//     console.log("🎉 === LOGIN POST COMPLETED SUCCESSFULLY ===");
//     console.log("⏰ End timestamp:", new Date().toISOString());

//     return res.status(200).json(responseData);

//   } catch (err) {
//     console.log("💥 === LOGIN ERROR OCCURRED ===");
//     console.error("💥 Login error:", err);
//     console.error("💥 Error type:", err.constructor.name);
//     console.error("💥 Error name:", err.name);
//     console.error("💥 Error message:", err.message);
//     console.error("💥 Error code:", err.code);
//     console.error("💥 Error stack:", err.stack);
//     console.log("💥 Error occurred at:", new Date().toISOString());
//     console.log("💥 User email (if available):", req.body.email);
//     console.log("💥 Request IP:", req.ip);
//     console.log("📤 Sending 500 error response");

//     return res
//       .status(500)
//       .json({
//         error: "Login failed",
//         csrfToken: req.csrfToken(),
//         timestamp: new Date().toISOString()
//       });
//   }
// };

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
      await PeopleSession.create({
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
    const user = await PeopleUser.findOne({ email }).select(
      "email phone phone_suffix otp_email_status otp_sms_status otp_authenticator_status"
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        csrfToken: req.csrfToken(),
      });
    }

    const otp = generateOtp();
    console.log(`🔐 [Password Reset OTP] User: ${user.email}, OTP: ${otp}`);
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

      await PeopleSession.findOneAndUpdate(sessionQuery, updateData, {
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
    const user = await PeopleUser.findById(userId);

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
    (otp1 || "").trim() +
    (otp2 || "").trim() +
    (otp3 || "").trim() +
    (otp4 || "").trim() +
    (otp5 || "").trim() +
    (otp6 || "").trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.json({
      error: i18n.__("errors.otp.length_required"),
      csrfToken: req.csrfToken(),
    });
  }

  const user = await PeopleUser.findById(userId.id);
  if (!user) return res.redirect("/");

    const destination = user.otp_destination || "email";


  // 🔹 Authenticator yoxlaması
  if (destination === "authenticator") {
    if (!user.authenticator_secret) {
      return res.json({
        error: "Authenticator hələ aktivləşdirilməyib",
        csrfToken: req.csrfToken(),
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.authenticator_secret,
      encoding: "base32",
      token: cleanOtp,
      window: 1,
    });

    if (!verified) {
      return res.json({
        error: i18n.__("errors.otp.wrong"),
        csrfToken: req.csrfToken(),
      });
    }
  } else {
    // 🔹 Email və SMS yoxlaması (mövcud OTP)
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
  }
  req.session.otpVerified = true;

  function cleanQuotes(str = "") {
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1);
    }
    return str;
  }

  const deviceOsRaw = req.headers["sec-ch-ua-platform"] || "Unknown";
  const deviceOs = cleanQuotes(deviceOsRaw);

  await PeopleSession.findOneAndUpdate(
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
    const user = await PeopleUser.findOne({ email });

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

    const user = await PeopleUser.findById(userId);
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
