import TempPeopleProfileChanges from "../../../shared/models/tempPeopleProfileChanges.js";
import argon2 from "argon2";
import {
  generateOtp,
  sendMail,
  sendSms,
} from "../../../shared/utils/otpHandler.js";
import { SECRET_KEY } from "../../middlewares/partner/authMiddleware.js";
import jwt from "jsonwebtoken";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import PeopleSession from "../../../shared/model/people/peopleSessionModel.js";

export const submitOtp = async (req, res) => {
  try {
    const userId = req.user;
    const { otp } = req.body;

    const tempChange = await TempPeopleProfileChanges.findOne({
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
    if (tempChange.request_freeze) {
      updatedData.status = 2;
      if (process.env.NODE_ENV !== "production") {
        await sendMail("Your account frozen");
      }

      return res.redirect("/logout?message=Your%20account%20frozen");
    }
    if(tempChange.gender || ["male","female","other"].includes(tempChange.gender)) updatedData.gender = tempChange.gender; 

    // request_unsubscribe true-dursa şirkətdən ayrılma prosesini başladırıq
    if (tempChange.request_unsubscribe) {
      try {
        // İstifadəçinin cari şirkət məlumatlarını əldə edirik
        const currentUser = await PeopleUser.findById(userId).populate(
          "sirket_id"
        );

        if (!currentUser) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        if (!currentUser.sirket_id) {
          return res.status(400).json({
            success: false,
            message: "User is not currently employed at any company",
          });
        }

        // OldSirketUsers-ə köhnə şirkət məlumatlarını əlavə edirik
        const oldSirketUser = new OldSirketUsers({
          user_id: currentUser._id,
          sirket_id: currentUser.sirket_id._id,
          hire_date: currentUser.hire_date,
          dismissal_date: new Date(),
        });

        await oldSirketUser.save();

        // PeopleUser-dən sirket_id-ni null edirik və dismissal_date təyin edirik
        await PeopleUser.findByIdAndUpdate(userId, {
          sirket_id: null,
          dismissal_date: new Date(),
        });

        // TempPeopleProfileChanges qeydini silirik
        await TempPeopleProfileChanges.findByIdAndDelete(tempChange._id);

        return res.status(200).json({
          success: true,
          message:
            "Successfully unsubscribed from company. Your employment has been terminated.",
        });
      } catch (error) {
        console.error("Error processing unsubscribe request:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to process unsubscribe request",
        });
      }
    }

    await PeopleUser.findByIdAndUpdate(userId, updatedData);

    // Temp sənədi sil
    await TempPeopleProfileChanges.findByIdAndDelete(tempChange._id);

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

    const tempChange = await TempPeopleProfileChanges.findOne({
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
    await PeopleUser.findByIdAndUpdate(userId, { status: 2 }); // Məs: status 2 = deaktiv

    await TempPeopleProfileChanges.findByIdAndDelete(tempChange._id);

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
    const userId = req.user;

    const tempChange = await TempPeopleProfileChanges.findOne({
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

    const tempChange = await TempPeopleProfileChanges.findOne({
      user_id: userId,
    });

    if (!tempChange) {
      return res.status(404).json({ message: "Change request not found" });
    }

    await TempPeopleProfileChanges.findByIdAndDelete(tempChange._id);

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

    const tempChange = await TempPeopleProfileChanges.findOne({
      user_id: userId,
    });

    if (!tempChange || !tempChange.request_delete) {
      return res.status(404).json({ message: "No delete request found" });
    }

    await PeopleUser.findByIdAndDelete(userId);
    await TempPeopleProfileChanges.findByIdAndDelete(tempChange._id);
    await PeopleSession.deleteMany({ user_id: userId });

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
