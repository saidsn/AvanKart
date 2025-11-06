import mongoose from "mongoose";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import argon2 from "argon2";
import {
  generateOtp,
  sendMail,
  sendSms,
} from "../../../shared/utils/otpHandler.js";
import { validationResult } from "express-validator";
import TempPartnerProfileChanges from "../../../shared/models/tempPartnerProfileChanges.js";

export const requestChange = async (req, res) => {
  const errors = validationResult(req);
  const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ error: formattedErrors[0] });
  }

  const {
    duty,
    name_surname,
    birth_date,
    email,
    old_password,
    new_password,
    phone_suffix,
    phone,
  } = req.body;

  const userId = new mongoose.Types.ObjectId(req.user);

  try {
    const user = await PartnerUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const changes = {
      user_id: userId,
      duty,
      otp: generateOtp(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };

    switch (duty) {
      case "updateName":
        const fullName = name_surname.split(" ");
        changes.name = fullName[0]?.trim();
        for (let i = 1; i < fullName.length; i++) {
          changes.surname = (changes.surname || "") + " " + fullName[i].trim();
        }
        break;

      case "updateBirthDate":
        changes.birth_date = birth_date;
        break;
      case "updateNumber":
        if (phone_suffix) changes.phone_suffix = phone_suffix.trim();
        if (phone) changes.phone_number = phone.trim();

      case "updateEmail":
        if (email !== user.email) {
          const existingEmail = await PartnerUser.findOne({ email });
          if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
          }
        }
        changes.email = email?.toLowerCase()?.trim();
        break;

      case "updatePassword":
        const isMatch = await argon2.verify(user.password, old_password);
        if (!isMatch)
          return res
            .status(400)
            .json({ message: "Old password is incorrect." });
        changes.password = await argon2.hash(new_password);
        break;

      case "deleteProfile":
        changes.request_delete = true;
        break;
    }

    let otpSentSuccessfully = false;
    let otpTypeUsed;
    const debug = process.env.NODE_ENV !== "production";

    if (user.email) {
      otpTypeUsed = "email";
      changes.otp_type = otpTypeUsed;
      otpSentSuccessfully = await sendMail(user.email, changes.otp, debug);
    } else if (user.phone_number && user.phone_suffix) {
      otpTypeUsed = "sms";
      changes.otp_type = otpTypeUsed;
      otpSentSuccessfully = await sendSms(
        user.phone_suffix,
        user.phone_number,
        changes.otp_code,
        debug
      );
    } else {
      return res.status(400).json({
        message:
          "Cannot send OTP. User has no registered email or phone number.",
      });
    }
    const newChangeUser = await TempPartnerProfileChanges.create(changes);

    if (!otpSentSuccessfully) {
      await TempPartnerProfileChanges.findByIdAndDelete(newChangeUser._id);
      console.log(`Failed to send OTP to user ${userId} via ${otpTypeUsed}.`);
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Please try again." });
    }

    return res.status(200).json({
      message: "Change request received. OTP sent.",
      duty,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
