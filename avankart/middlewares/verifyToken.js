import { createClient } from "redis";
import {
  decrypt,
  generateFingerprint,
  extractDeviceInfo,
  compareFingerprints,
} from "../utils/crypto.js";
import AdminSession from "../../shared/models/adminSessionModel.js";

const redisClient = createClient();
redisClient.connect();

function cleanQuotes(str = "") {
  if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1);
  return str;
}

// --- VERIFY TOKEN ---
export const verifyToken = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) return res.redirect("/auth/logout");

    const encryptedSession = await redisClient.get(`session:${sessionId}`);
    if (!encryptedSession) return res.redirect("/auth/logout");

    const sessionData = decrypt(encryptedSession);
    const { user } = sessionData;

    // ✅ MongoDB session kontrolü
    const mongoSession = await AdminSession.findOne({
      user_id: user.id,
      device_name: cleanQuotes(req.headers["user-agent"]),
    });

    if (!mongoSession) return res.redirect("/auth/logout");
    if (!mongoSession.otp_verified) return res.redirect("/auth/otpVerify");

    // ✅ Son aktiviteyi güncelle
    await AdminSession.updateOne(
      { _id: mongoSession._id },
      { last_activity: new Date() }
    );

    // ✅ User bilgilerini req'e ekle
    req.user = {
      id: user.id,
      email: user.email,
      ...user,
    };

    next();
  } catch (err) {
    console.error("Verify token error:", err);
    return res.redirect("/auth/logout");
  }
};

// --- VERIFY OTP ---
export const verifyOtp = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) return res.redirect("/auth/logout");

  let encryptedSession;
  try {
    encryptedSession = await redisClient.get(`session:${sessionId}`);
    if (!encryptedSession) return res.redirect("/auth/logout");
  } catch (err) {
    console.log("Redis retrieval error:", err);
    return res.redirect("/auth/logout");
  }

  try {
    const sessionData = decrypt(encryptedSession);
    const { user } = sessionData;

    // ✅ MongoDB session kontrolü
    const mongoSession = await AdminSession.findOne({
      user_id: user.id,
      device_name: cleanQuotes(req.headers["user-agent"]),
      device_os: cleanQuotes(req.headers["sec-ch-ua-platform"]),
    });

    if (!mongoSession) return res.redirect("/auth/logout");
    if (mongoSession.otp_verified === true) return res.redirect("/");

    // ✅ User bilgilerini req'e ekle
    req.user = {
      id: user.id,
      email: user.email,
      ...user,
    };

    next();
  } catch (err) {
    await redisClient.del(`session:${sessionId}`).catch(() => {});
    return res.redirect("/auth/logout");
  }
};

// --- VERIFY FORGET ---
export const verifyForget = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) return res.redirect("/auth/logout");

  let encryptedSession;
  try {
    encryptedSession = await redisClient.get(`session:${sessionId}`);
    if (!encryptedSession) return res.redirect("/auth/logout");
  } catch (err) {
    return res.redirect("/auth/logout");
  }

  try {
    const sessionData = decrypt(encryptedSession);
    const { user } = sessionData;

    // ✅ MongoDB session kontrolü
    const mongoSession = await AdminSession.findOne({
      user_id: user.id,
      device_name: cleanQuotes(req.headers["user-agent"]),
      device_os: cleanQuotes(req.headers["sec-ch-ua-platform"]),
    });

    if (!mongoSession) return res.redirect("/auth/logout");
    if (!mongoSession.otp_verified) return res.redirect("/forgot-password-otp");

    // ✅ User bilgilerini req'e ekle
    req.user = {
      id: user.id,
      email: user.email,
      ...user,
    };

    next();
  } catch (err) {
    await redisClient.del(`session:${sessionId}`).catch(() => {});
    return res.redirect("/auth/logout");
  }
};

// --- ALREADY LOGGED IN ---
export const alreadyLoggedIn = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    console.log("🔍 ALREADY LOGGED IN - No sessionId, proceeding");
    return next();
  }

  try {
    const encryptedSession = await redisClient.get(`session:${sessionId}`);
    if (!encryptedSession) {
      console.log("🔍 ALREADY LOGGED IN - No encrypted session, proceeding");
      return next();
    }

    const sessionData = decrypt(encryptedSession);
    const { user } = sessionData;

    const mongoSession = await AdminSession.findOne({
      user_id: user.id,
      device_name: cleanQuotes(req.headers["user-agent"]),
    });

    if (mongoSession && mongoSession.otp_verified) {
      const redirectUrl = req.get("Referrer") || "/";
      console.log(
        "🟡 ALREADY LOGGED IN - User already authenticated, redirecting to:",
        redirectUrl
      );
      return res.redirect(redirectUrl);
    } else if (mongoSession && !mongoSession.otp_verified) {
      req.user = {
        id: user.id,
        email: user.email,
        ...user,
      };
      console.log(
        "🟡 ALREADY LOGGED IN - OTP not verified, redirecting to otpVerify"
      );
      return res.redirect("/auth/otpVerify");
    }
  } catch (err) {
    console.log(
      "🔍 ALREADY LOGGED IN - Error occurred, ignoring:",
      err.message
    );
    // ignore and continue
  }

  console.log("🔍 ALREADY LOGGED IN - Proceeding to next middleware");
  next();
};
