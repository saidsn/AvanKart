import jwt from "jsonwebtoken";
import PeopleSession from "../../../shared/model/people/peopleSessionModel.js";

export const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";

export const extractToken = (req) => {
  return req.headers.authorization?.split(" ")[1] || null;
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

// Kullanıcı oturumunu doğrula (OTP doğrulanmış)
export const isAuthenticated = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = verifyToken(token);
    if (!decoded.jti || !decoded.otp_verified)
      return res.status(401).json({ message: "OTP not verified", token });

    const session = await PeopleSession.findOne({
      user_id: decoded.id,
      token_id: decoded.jti,
    });

    if (!session) {
      return res
        .status(401)
        .json({ message: "Session not found. Please log in again." });
    }

    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token", error: err });
  }
};

// OTP aşaması için middleware (henüz otp_verified false olanlar)
export const otpAuthMiddleware = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = verifyToken(token);
    if (!decoded.jti || decoded.otp_verified)
      return res.status(401).json({ message: "OTP already verified", token });

    const session = await PeopleSession.findOne({
      user_id: decoded.id,
      token_id: decoded.jti,
    });

    if (!session) {
      return res
        .status(401)
        .json({ message: "Session not found. Please log in again." });
    }

    req.user = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token", error: err });
  }
};

// Giriş yapmamış kullanıcılar için middleware
export const isGuest = (req, res, next) => {
  const token = extractToken(req);

  if (!token) return next(); // Token yoksa geç

  try {
    verifyToken(token);
    return res.status(403).json({ message: "Already authenticated" });
  } catch {
    return next(); // Token bozuksa da geç
  }
};
