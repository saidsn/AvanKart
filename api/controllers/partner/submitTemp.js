import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import TempPartnerProfileChanges from "../../../shared/models/tempPartnerProfileChanges.js";
import argon2 from "argon2";
import {
  generateOtp,
  sendMail,
  sendSms,
} from "../../../shared/utils/otpHandler.js";
import { SECRET_KEY } from "../../middlewares/partner/authMiddleware.js";
import Session from "../../../shared/model/partner/sessionModel.js";
import jwt from "jsonwebtoken";

export const submitOtp = async (req, res) => {
  try {
    const userId = req.user;
    const { otp } = req.body;

    const tempChange = await TempPartnerProfileChanges.findOne({
      user_id: userId,
    });

    if (!tempChange) {
      return res.status(404).json({ message: "Change request not found" });
    }

    // OTP yoxlama
    if (tempChange.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (tempChange.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Profil dəyişiklikləri
    const updatedData = {};

    if (tempChange.name) updatedData.name = tempChange.name;
    if (tempChange.email) updatedData.email = tempChange.email;
    if (tempChange.phone_suffix)
      updatedData.phone_suffix = tempChange.phone_suffix;
    if (tempChange.phone_number) updatedData.phone = tempChange.phone_number;
    if (tempChange.birth_date) updatedData.birth_date = tempChange.birth_date;
    if (tempChange.password) updatedData.password = tempChange.password;

    await PartnerUser.findByIdAndUpdate(userId, updatedData);

    // Temp sənədi sil
    await TempPartnerProfileChanges.findByIdAndDelete(tempChange._id);

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const submitDeleteOtp = async (req, res) => {
  try {
    const userId = req.user;
    const { otp } = req.body;

    const tempChange = await TempPartnerProfileChanges.findOne({
      user_id: userId,
    });

    if (!tempChange) {
      return res.status(404).json({ message: "Change request not found" });
    }

    if (tempChange.duty !== "deleteAccount") {
      return res.status(400).json({ message: "Not a delete request" });
    }

    if (tempChange.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (tempChange.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Hesabı deaktiv et (və ya sil)
    await PartnerUser.findByIdAndUpdate(userId, { status: 2 }); // Məs: status 2 = deaktiv

    await TempPartnerProfileChanges.findByIdAndDelete(tempChange._id);

    return res
      .status(200)
      .json({ message: "Account deleted (deactivated) successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const userId = req.user.id;

    const tempChange = await TempPartnerProfileChanges.findOne({
      user_id: userId,
    });

    if (!tempChange) {
      return res.status(404).json({ message: "Change request not found" });
    }

    const newOtp = generateOtp();

    tempChange.otp = newOtp;
    tempChange.expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await tempChange.save();
    const debug = process.env.NODE_ENV !== "production";

    if (tempChange.otp_type === "email" && tempChange.email) {
      await sendMail(tempChange.email, newOtp, debug);
    } else if (
      tempChange.otp_type === "sms" &&
      tempChange.phone_number &&
      tempChange.phone_suffix
    ) {
      await sendSms(
        tempChange.phone_suffix,
        tempChange.phone_number,
        newOtp,
        debug
      );
    }

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelOtp = async (req, res) => {
  try {
    const userId = req.user;

    const tempChange = await TempPartnerProfileChanges.findOne({
      user_id: userId,
    });

    if (!tempChange) {
      return res.status(404).json({ message: "Change request not found" });
    }

    await TempPartnerProfileChanges.findByIdAndDelete(tempChange._id);

    return res
      .status(200)
      .json({ message: "Change request cancelled successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptDeleteUser = async (req, res) => {
  try {
    const userId = req.user;

    const tempChange = await TempPartnerProfileChanges.findOne({
      user_id: userId,
    });

    if (!tempChange || !tempChange.request_delete) {
      return res.status(404).json({ message: "No delete request found" });
    }

    await PartnerUser.findByIdAndDelete(userId);
    await TempPartnerProfileChanges.findByIdAndDelete(tempChange._id);
    await Session.deleteMany({ user_id: userId });

    return res.status(200).json({
      message: "Hesab silindi",
      token: null,
      user: null,
    });
  } catch (error) {
    console.error("acceptDeleteUser error:", error);
    return res.status(500).json({ message: "Server xətası" });
  }
};
