import PeopleUser from "../../../../shared/models/peopleUserModel.js";
import moment from "moment";
import mongoose from "mongoose";
import OtpModel from "../../../../shared/models/otp.js";
import { generateOtp, sendMail } from "../../../utils/optHandler.js";

import PeopleSession from "../../../../shared/model/people/peopleSessionModel.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const submitOtp = async (req, res) => {
  const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";
  try {
    const { email, otp, device_info = "Unknown, Unknown" } = req.body;
    const [device_name, device_os] = device_info.split(", ");

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }
    const userId = new mongoose.Types.ObjectId(req.user);
    const user = await PeopleUser.findOne({ email, _id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let comingOtp;

    //OTP-in haradan geldiyine baxaraq axtaris edirik
    if (user.otp_destination === "email") {
      comingOtp = await OtpModel.findOne({ email: user.email, otp_to: 'sirket' }).sort({
        createdAt: -1,
      });
    } else if (user.otp_destination === "sms") {
      comingOtp = await OtpModel.findOne({
        phone_suffix: user.phone_suffix?.toString(),
        phone_number: user.phone,
        otp_to: 'sirket'
      }).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported OTP method",
      });
    }

    if (!comingOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found, please request again.",
      });
    }

    if (comingOtp.otp !== otp) {
      comingOtp.attempts += 1;

      if (comingOtp.attempts === 3) {
        await comingOtp.save();
        return res.status(401).json({
          success: false,
          message: "OTP is invalid (3 attempts). Please request a new one.",
        });
      }

      if (comingOtp.attempts > 5) {
        await OtpModel.deleteOne({ _id: comingOtp._id });

        user.otp_code = null;
        user.otp_send_time = null;
        await user.save();

        return res.status(403).json({
          success: false,
          message: "Too many attempts. OTP has been invalidated and deleted.",
        });
      }

      await comingOtp.save();

      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const now = moment();
    if (now.isAfter(moment(comingOtp.expire_time))) {
      return res.status(401).json({
        success: false,
        message: "OTP has expired",
      });
    }

    await OtpModel.deleteOne({ _id: comingOtp._id });

    // Update user OTP status

    //user.email_otp_status = true;
    user.otp_code = null;
    user.otp_expires_at = null;
    user.otp_verified = true;
    user.otp_send_time = null;

    if (user.otp_destination === "email") {
      user.otp_email_status = 2;
    } else if (user.otp_destination === "sms") {
      user.otp_sms_status = 2;
    }

    await user.save();

    // Update session OTP status
    const location = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const tokenId = uuidv4();
    const peopleSession = await PeopleSession.findOne({
      user_id: user._id,
      device_name,
      device_os,
      location,
    });

    if (peopleSession) {
      peopleSession.otp_verified = true;
      peopleSession.last_login_date = new Date();
      peopleSession.token_id = tokenId; // jti ekle
      await peopleSession.save();
    } else {
      await PeopleSession.create({
        user_id: user._id,
        device_name,
        device_os,
        location,
        last_login_date: new Date(),
        otp_verified: true,
        token_id: tokenId, // jti ekle
      });
    }

    // Generate new token with otp_verified true
    const token = jwt.sign(
      {
        id: user._id,
        otp_verified: true,
        jti: tokenId,
      },
      SECRET_KEY
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified",
      token,
      user,
    });
  } catch (error) {
    console.error("submitOtp error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const cancelOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const userId = new mongoose.Types.ObjectId(req.user);

    const user = await PeopleUser.findOne({ email, _id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // PeopleUser içindeki OTP bilgilerini sıfırla
    user.otp_code = null;
    user.otp_expires_at = null;

    await user.save();

    // OtpModel'daki OTP kaydını da sil
    await OtpModel.deleteOne({ user_id: user._id });

    return res.status(200).json({ success: true, message: "OTP cancelled" });
  } catch (error) {
    console.error("cancelOtp error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const retryOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const comingOtp = await OtpModel.findOne({ email, otp_to: 'sirket' });
    if (!comingOtp)
      return res
        .status(404)
        .json({ success: false, message: "OTP not found for this email" });

    if (comingOtp.attempts >= 3) {
      return res
        .status(429)
        .json({ success: false, message: "Retry limit exceeded" });
    }

    const otpCode = generateOtp(6);

    comingOtp.otp = otpCode;
    comingOtp.attempts += 1;
    comingOtp.expire_time = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika
    await comingOtp.save();

    const user = await PeopleUser.findOneAndUpdate(
      { email },
      {
        otp_code: otpCode,
        otp_send_time: new Date(),
      },
      { new: true }
    );

    const debug = process.env.NODE_ENV !== "production";

await sendMail({
  to: email,
  data: { subject: "Your OTP Code" },
  otp: otpCode,
  debugMode: debug
});

    return res
      .status(200)
      .json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("retryOtp error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
