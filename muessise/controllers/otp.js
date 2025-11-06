import OtpModel from "../../shared/models/otp.js";
import PartnerUser from "../../shared/models/partnyorUserModel.js";
import TempPartnerUserDelete from "../../shared/model/partner/tempPartnerUserDelete.js";
import TempPartnerPermDelete from "../../shared/model/partner/tempPartnerPermDelete.js";
import TempPartnerDutyDelete from "../../shared/model/partner/tempPartnerDutyDelete.js";
import { generateOtp, sendMail } from "../../shared/utils/otpHandler.js";
import dotenv from "dotenv";
dotenv.config();

export const resendOtp = async (req, res) => {
  try {
    const { tempDeleteId } = req.body;
    const userId = req.user._id || req.user.id;

    if (!tempDeleteId) {
      return res.status(400).json({
        success: false,
        message: "TempDeleteId is required."
      });
    }

    // Find the temporary delete record in all 3 collections
    let tempDelete = await TempPartnerUserDelete.findById(tempDeleteId)
      || await TempPartnerPermDelete.findById(tempDeleteId)
      || await TempPartnerDutyDelete.findById(tempDeleteId);

    if (!tempDelete) {
      console.log("❌ [resendOtp] Temporary delete record not found");
      return res.status(404).json({
        success: false,
        message: "Temporary delete record not found."
      });
    }


    // Verify that the current user is the sender
    if (String(tempDelete.sender_id) !== String(userId)) {
      console.log("❌ [resendOtp] Unauthorized user");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to resend OTP for this operation."
      });
    }

    let targetUserId = null;

    if (Array.isArray(tempDelete.users) && tempDelete.users.length > 0) {
      targetUserId = tempDelete.users[0]; // TempPartnerUserDelete
    } else {
      targetUserId = tempDelete.sender_id; // Perm & Duty models
    }

    const targetUser = await PartnerUser.findById(targetUserId).select("email fullname");
    if (!targetUser || !targetUser.email) {
      console.log("❌ [resendOtp] Target user not found or no email");
      return res.status(404).json({
        success: false,
        message: "Target user not found or has no email."
      });
    }

    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Check if OTP was sent recently
    const lastOtp = await OtpModel.findOne({
      user_id: userId,
      email: targetUser.email,
      createdAt: { $gt: fiveMinAgo },
    }).sort({ createdAt: -1 });

    if (lastOtp) {
      console.log("⏱️ [resendOtp] OTP already sent recently:", lastOtp.otp);
      return res.status(200).json({
        success: true,
        message: "OTP already sent recently. Please wait before requesting again.",
      });
    }

    // Generate new OTP and save
    const newOtp = generateOtp();
    console.log("🔑 [resendOtp] Generated OTP:", newOtp);
    const expireTime = new Date(now.getTime() + 15 * 60 * 1000);

    await OtpModel.create({
      user_id: userId,
      email: targetUser.email,
      otp: newOtp,
      expire_time: expireTime,
    });

    // Send OTP email
    const emailSent = await sendMail(targetUser.email, newOtp, false);
    const isSuccess = emailSent && (emailSent.success === true || emailSent === true);
    const isDevelopment = process.env.NODE_ENV !== "production";

    if (!isSuccess && !isDevelopment) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email.",
        error: emailSent?.error || "Unknown email error",
      });
    }

    // Update tempDelete with new OTP info
    tempDelete.otp_code = newOtp;
    tempDelete.otp_send_time = now;
    await tempDelete.save();

    console.log("✅ [resendOtp] OTP resent successfully:", newOtp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
      email: targetUser.email,
      otp: newOtp 
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
