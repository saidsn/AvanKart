import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import PeopleUser from "../../../../shared/models/peopleUserModel.js";
import { sendSms } from "../../../../shared/utils/otpHandler.js";
import OtpModel from "../../../../shared/models/otp.js";
import { generateOtp } from "../../../utils/optHandler.js";
import PeopleSession from "../../../../shared/model/people/peopleSessionModel.js";
import { sendMail } from "../../../../shared/utils/otpHandler.js";
import { createClient } from "redis";
import {
  decrypt,
  getFingerprintFromRequest,
} from "../../../../muessise/utils/crypto.js";

const redisClient = createClient();
redisClient.connect();

export const renderForgotPasswordPage = (req, res) => {
  res.render("auth/forgotPassword", {
    title: "Forgot Password",
  });
};

export const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";
const debug = process.env.NODE_ENV !== "production";

export const extractToken = (req) => {
  return req.headers.authorization?.split(" ")[1] || null;
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  const {
    email,
    password,
    remember_me,
    device_info = "Unknown, Unknown",
    firebase_token,
  } = req.body;
  //for ios users
  const specialEmail = "ios@test.com";
  const specialPassword = "StrongPassword123!";

  const [device_name, device_os] = device_info.split(", ");
  const location = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = new Date();
  try {
    const userExists = await PeopleUser.findOne({
      $or: [
        { email: { $regex: new RegExp("^" + email + "$", "i") } },
        { username: { $regex: new RegExp("^" + email + "$", "i") } },
      ],
    });

    if (!userExists) {
      return res.status(400).json({ error: "auth.username_or_password" });
    }

    const isPasswordValid = await argon2.verify(userExists.password, password);

    // Eğer iOS için özel kullanıcıysa direkt OTP verified kabul et
    if (email.toLowerCase() === specialEmail.toLowerCase() && password === specialPassword) {
      await PeopleUser.findByIdAndUpdate(userExists._id, {
        last_login_date: now,
        firebase_token,
      });
      const tokenId = uuidv4();

      await PeopleSession.findOneAndUpdate(
        { user_id: userExists._id, device_name, device_os },
        {
          device_name,
          device_os,
          last_login_date: now,
          location,
          user_id: userExists._id,
          otp_verified: true,
          token_id: tokenId,
        },
        { upsert: true, new: true }
      );

      const token = jwt.sign(
        {
          id: userExists._id,
          otp_verified: true,
          jti: tokenId,
        },
        SECRET_KEY,
        remember_me ? { expiresIn: "14d" } : {}
      );

      return res.status(200).json({
        message: "ok",
        token,
        user: userExists,
        requiresOtp: true, // verified gibi
        iosBypass: true, // opsiyonel: client tarafında anlamak için
      });
    }
    if (!isPasswordValid) {
      return res.status(400).json({ error: "auth.username_or_password" });
    }

    const st = Number(userExists.status);
    if (st === 1 || st === 2) {
      return res.status(403).json({ error: "Your login has been restricted." });
    }

    const lastLoginDate = userExists.last_login_date || new Date(0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Checking if OTP needs to be sent
    const needsOtp =
      userExists.otp_verified === false || lastLoginDate < sevenDaysAgo;

    if (needsOtp) {
      // Checking if OTP already exists
      const existingOtp = await OtpModel.findOne({
        $or: [
          { email: userExists.email },
          {
            phone_suffix: userExists.phone_suffix,
            phone_number: userExists.phone,
          },
        ],
        expire_time: { $gt: now }, //OTP is valid
        otp_to: 'sirket'
      });

      const debug = process.env.NODE_ENV !== "production";

      if (!existingOtp) {
        // If we dont have an existing OTP, generate a new one
        const otpCode = generateOtp(6);
        userExists.otp_code = otpCode;
        userExists.otp_send_time = now;
        await userExists.save();

        await OtpModel.create({
          email: userExists.email,
          phone_suffix: userExists.phone_suffix,
          phone_number: userExists.phone,
          otp: otpCode,
          // expire_time: new Date(now.getTime() + 5 * 60 * 1000),
          expire_time: new Date(Date.now() + 5 * 60 * 1000),
          otp_to: 'sirket'
        });

        await sendMail(userExists.email, otpCode, debug);
      }

      const tokenId = uuidv4(); // benzersiz token ID

      // Create or update session
      const session = await PeopleSession.findOneAndUpdate(
        { user_id: userExists._id, device_name, device_os },
        {
          user_id: userExists._id,
          device_name,
          device_os,
          last_login_date: now,
          location,
          otp_verified: false,
          token_id: tokenId,
        },
        { upsert: true, new: true }
      );

      // Token oluştur
      const token = jwt.sign(
        {
          id: userExists._id,
          otp_verified: false,
          jti: tokenId,
        },
        SECRET_KEY,
        remember_me ? { expiresIn: "14d" } : {} // expiry'siz üretmen de mümkün
      );

      return res.status(200).json({
        message: "OTP verification required",
        token,
        requiresOtp: true,
      });
    }

    // Update last login date
    await PeopleUser.findByIdAndUpdate(userExists._id, {
      last_login_date: now,
      firebase_token,
    });

    // Create or update session
    await PeopleSession.findOneAndUpdate(
      { user_id: userExists._id, device_name, device_os },
      {
        device_name,
        device_os,
        last_login_date: now,
        location,
        user_id: userExists._id,
        otp_verified: true,
      },
      { upsert: true, new: true }
    );

    const token = jwt.sign(
      {
        id: userExists._id,
        otp_verified: true,
      },
      SECRET_KEY,
      remember_me ? { expiresIn: "14d" } : {}
    );

    console.log("Login controller cavab:", {
      message: "ok",
      token,
      user: userExists,
      requiresOtp: false,
    });

    return res.status(200).json({
      message: "ok",
      token,
      user: userExists,
      requiresOtp: false,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const register = async (req, res) => {
  const errors = validationResult(req);
  const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  const {
    name,
    surname,
    birth_date,
    email,
    phone_suffix,
    phone_number,
    gender,
    password,
    device_info = "Unknown, Unknown",
  } = req.body;
  const [device_name, device_os] = device_info.split(", ");
  const location = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const existingUser = await PeopleUser.findOne({
      $or: [
        { email: { $regex: new RegExp("^" + email + "$", "i") } },
        { phone: phone_number },
      ],
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ error: "auth.email_already_exist" });
      }
      if (existingUser.phone === phone_number) {
        return res.status(400).json({ error: "auth.phone_already_exist" });
      }
    }

    const passwordHash = await argon2.hash(password);
    const otpCode = generateOtp(6);

    const newUser = await PeopleUser.create({
      name,
      surname,
      birth_date,
      email,
      phone_suffix,
      phone: phone_number,
      gender,
      password: passwordHash,
      last_password_update: new Date(),
      last_login_ip: location,
      last_user_agent: device_info,
      otp_code: otpCode,
      otp_verified: false,
    });

    // Create session with otp_verified false
    const tokenId = uuidv4();

    await PeopleSession.create({
      device_name,
      device_os,
      last_login_date: new Date(),
      location,
      user_id: newUser._id,
      otp_verified: false,
      token_id: tokenId, // **buraya ekledik**
    });

    await OtpModel.create({
      phone_suffix: newUser.phone_suffix,
      phone_number: newUser.phone,
      email: newUser.email,
      otp: otpCode,
      expire_time: new Date(Date.now() + 5 * 62 * 1000), // 5 minutes + 10 seconds
      otp_to: 'sirket'
    });

    await sendMail(newUser.email, otpCode, debug);

    const token = jwt.sign(
      { id: newUser._id, otp_verified: false, jti: tokenId },
      SECRET_KEY,
      {}
    );

    return res.status(200).json({
      message: "ok",
      token,
      data: {
        suffix: newUser.phone_suffix,
        phone: newUser.phone,
        email: newUser.email,
      },
      method: "email",
    });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

export const logout = async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(400).json({ message: "Token missing" });

    const decoded = verifyToken(token);

    await PeopleSession.findOneAndDelete({
      user_id: decoded.id,
      token_id: decoded.jti,
    });

    return res
      .status(200)
      .json({ message: "Logged out", token: null, user: null });
  } catch (err) {
    return res.status(500).json({ error: "Error during logout", detail: err });
  }
};

export const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  const { email } = req.body;
  const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";
  const otp_code = generateOtp(6);
  try {
    const userExists = await PeopleUser.findOneAndUpdate(
      { email: { $regex: new RegExp("^" + email + "$", "i") } },
      { $set: { otp_send_time: new Date(), otp_code } },
      { new: true }
    );

    if (!userExists) {
      return res.status(400).json({ error: "auth.email_or_phone_suffix" });
    }
    const expire_time = new Date(Date.now() + 5 * 62 * 1000); // 5 minutes + 10 seconds
    const tokenId = uuidv4();

    await OtpModel.create({
      email: userExists.email,
      phone_suffix: userExists.phone_suffix,
      phone_number: userExists.phone,
      otp: otp_code,
      expire_time,
      otp_to: 'sirket'
    });

    const debug = process.env.NODE_ENV !== "production";

    await sendMail(userExists.email, otp_code, debug); //bu hissə digər funksiyalarda da olmalıdır.

    const token = jwt.sign(
      { id: userExists._id, otp_verified: false, jti: tokenId },
      SECRET_KEY,
      {}
    );

    return res.status(200).json({ message: "OTP sent successfully", token });
  } catch (err) {
    return res.status(400).json({ error: "OTP not found or has expired", err });
  }
};

export const submitForgottonPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  const { password_again, new_password } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  const userId = req.user;

  try {
    const hashPassword = await argon2.hash(new_password);

    const userUpdate = await PeopleUser.findByIdAndUpdate(
      userId,
      {
        password: hashPassword,
        last_password_update: new Date(),
        otp_verified: true,
      },
      { new: true }
    );

    if (!userUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Password updated", token, user: userUpdate });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const checkSession = async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) return res.redirect("/auth/login");

  const encryptedSession = await redisClient.get(`session:${sessionId}`);
  if (!encryptedSession) return res.redirect("/auth/login");

  try {
    const { user, fingerprint } = JSON.parse(decrypt(encryptedSession));
    const currentFingerprint = getFingerprintFromRequest(req);

    if (fingerprint !== currentFingerprint) {
      await redisClient.del(`session:${sessionId}`);
      return res.redirect("/auth/logout");
    }

    // Check OTP verification status from Mongo session
    const mongoSession = await PeopleSession.findOne({
      user_id: user.id,
      device_name: req.headers["user-agent"] || "Unknown",
      device_os: req.headers["sec-ch-ua-platform"] || "Unknown",
    });

    if (!mongoSession) {
      return res.redirect("/auth/login");
    } else if (mongoSession.otp_verified === true) {
      return res.redirect("/");
    }

    // OTP not verified yet
    req.user = user;
    return res.redirect("/auth/otpVerify");
  } catch (err) {
    console.log(err);
    await redisClient.del(`session:${sessionId}`);
    return res.redirect("/auth/login");
  }
};
