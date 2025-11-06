import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { validationResult } from "express-validator";
import i18n from "i18n";
import {
  createSessionId,
  encrypt,
  getFingerprintFromRequest,
} from "../../utils/crypto.js";
import { createClient } from "redis";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import Session from "../../../shared/model/partner/sessionModel.js";
import {
  sendMail,
  sendSms,
  generateOtp,
  verifyAuthenticator,
} from "../../../shared/utils/otpHandler.js";
import OtpModel from "../../../shared/models/otp.js";

export const forgetOtpSubmit = async (req, res) => {
  const currentLang = req.getLocale();
  const langFilter = `lang.${currentLang}`;

  const userId = req.user.id;
  const user = await PartnerUser.findById(userId);
  let destination = user.otp_destination || "email";

  if (!user) {
    return res.redirect("/auth/logout");
  }

  const sentTime = user.otp_send_time || new Date();
  const now = new Date();

  const OTP_TTL_MS = 5 * 60 * 1000; // 5 dk + 10 sn
  const expireTime = new Date(sentTime.getTime() + OTP_TTL_MS);
  const diffMs = Math.max(expireTime - now, 0);

  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  const countdown = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return res.render("pages/auth/forgetPasswordOtp", {
    error: "",
    csrfToken: req.csrfToken(),
    layout: "./layouts/auth",
    to: user[destination] ?? destination,
    countdown
  });
};

export const forgetOtpSubmitPost = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.redirect("/auth/logout");

  const {otp1,otp2,otp3,otp4,otp5,otp6} = req.body
  const cleanOtp = 
  otp1.trim()+ 
  otp2.trim()+
  otp3.trim()+
  otp4.trim()+
  otp5.trim()+
  otp6.trim()

  if (!/^\d{6}$/.test(cleanOtp)) return res.json({
    error: "Otp is only 6 number",
    csrfToken: req.csrfToken()
  })

  const user = await PartnerUser.findById(userId)

  if(!user) return res.redirect("/")

  const otpData = await OtpModel.findOne({email: user.email})

  if(!otpData) return res.json({
    error: "OTP not found or timed out",
    csrfTOken: req.csrfToken()
  })

  if (otpData.attempts >= 3) {
    return res.json({
      error: "OTP is invalid",
      csrfToken: req.csrfToken()
    })
  }

  if( otpData >= 5) {
    user.otp_code = null
    await OtpModel.deleteOne({_id: otpData._id})
    await user.save()
    return res.json({
      error: "many attempts",
      csrfToken: req.csrfToken()
    })
  }
  if( cleanOtp !== user.otp_code) {
     otpData.attempts++
    res.json({
      error: "OTP is wrong",
      csrfToken: req.csrfToken()
    })
  }


  user.otp_verified = true
  user.otp_code = null
  await user.save()
  req.session.otp_verified = true

  return res.json({
    success: true,
    message: "Login successfully",
    csrfToken: req.csrfToken(),
    redirect: "/auth/forget/reset"
  });

};

const maskEmail = (email) => {
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