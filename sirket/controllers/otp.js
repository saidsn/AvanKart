import OtpModel from "../../shared/models/otp.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import {
  generateOtp,
  sendMail,
  smsChooser,
} from "../../shared/utils/otpHandler.js";
import dotenv from "dotenv";
dotenv.config();

export const resendOtp = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await PeopleUser.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const lastOtp = await OtpModel.findOne({
      user_id: user._id,
      createdAt: { $gt: fiveMinAgo },
    }).sort({ createdAt: -1 });

    if (lastOtp) {
      return res.status(200).json({
        success: true,
        message:
          "OTP already sent recently. Please wait before requesting again.",
      });
    }

    const newOtp = generateOtp();
    console.log(
      `🔐 [Resend OTP] User: ${user.email || user.phone_suffix + user.phone}, OTP: ${newOtp}`
    );
    const expireTime = new Date(now.getTime() + 5 * 60 * 1000);

    await OtpModel.create({
      user_id: user._id,
      phone_suffix: user.phone_suffix?.toString() || "",
      phone_number: user.phone || "",
      email: user.email || "",
      otp: newOtp,
      expire_time: expireTime,
      otp_to: "sirket",
    });

    const debugMode = (process.env.NODE_ENV || "").trim() === "development";
    const noActive =
      user.otp_email_status !== 1 &&
      user.otp_sms_status !== 1 &&
      user.otp_authenticator_status !== 1;

    let sendResult = false;

    if (noActive && user.email) {
      sendResult = await sendMail(user.email, newOtp, debugMode);
    } else if (user.otp_destination === "sms") {
      sendResult = await smsChooser(
        "sms",
        newOtp,
        user.phone_suffix?.toString(),
        user.phone,
        debugMode
      );
    } else if (user.otp_destination === "email" && user.email) {
      sendResult = await sendMail(user.email, newOtp, debugMode);
    } else {
      sendResult = await smsChooser(
        user.otp_destination,
        newOtp,
        user.phone_suffix?.toString(),
        user.phone,
        debugMode
      );
    }

    const isSuccess =
      sendResult && (sendResult.success === true || sendResult === true);

    if (isSuccess) {
      await PeopleUser.findByIdAndUpdate(user._id, {
        otp_code: newOtp,
        otp_send_time: now,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP.",
        error: sendResult?.error || "Unknown error",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    console.error("resendOtp error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
