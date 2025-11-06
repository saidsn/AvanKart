import TempPeopleOtpService from "../../../shared/model/people/tempPeopleOtpService.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import { generateOtp, sendMail, sendSms } from "../../utils/optHandler.js";

export const get2FASettings = async (req, res) => {
  try {
    const userId = req.user;
    const user = await PeopleUser.findById(userId).select(
      "otp_email_status otp_sms_status email phone phone_suffix"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        email: {
          enabled: user.otp_email_status === 1,
          value: user.email,
          status: user.otp_email_status,
        },
        sms: {
          enabled: user.otp_sms_status === 1,
          value: user.phone
            ? `${user.phone_suffix || ""} ${user.phone}`.trim()
            : null,
          status: user.otp_sms_status,
        },
      },
    });
  } catch (error) {
    console.error("[get2FASettings]", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

export const initiate2FAChange = async (req, res) => {
  const debug = process.env.NODE_ENV !== "production";

  try {
    const { type, status } = req.body;
    const userId = req.user;
    const user = await PeopleUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!type || !["email", "sms"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be email or sms",
      });
    }

    if (!status || !["active", "passive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be active or passive",
      });
    }

    if (type === "email" && !user.email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required for email 2FA",
      });
    }

    if (type === "sms" && (!user.phone || !user.phone_suffix)) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required for SMS 2FA",
      });
    }

    const otp = generateOtp();
    console.log(
      `[2FA Change] Generated OTP: ${otp} for user: ${userId}, type: ${type}`
    );

    let otpSent = false;

    if (type === "email") {
      try {
        const emailData = {
          subject: "Your OTP Code",
        };
        otpSent = await sendMail({
          to: user.email,
          data: emailData,
          otp: otp,
          debugMode: debug,
        });
        console.log(`[2FA Change] OTP email send status: ${otpSent}`);
      } catch (emailError) {
        console.error("Email send failed:", emailError);
        otpSent = false;
      }
    } else if (type === "sms") {
      try {
        otpSent = await sendSms(user.phone_suffix, user.phone, otp, debug);
        console.log(`[2FA Change] OTP SMS send status: ${otpSent}`);
      } catch (smsError) {
        console.error("SMS send failed:", smsError);
        otpSent = false;
      }
    }

    if (!otpSent) {
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP via ${type}. Please try again.`,
      });
    }

    const tempOtpService = new TempPeopleOtpService({
      user_id: user._id,
      otp_code: otp,
      changed: type,
      status,
      type,
      accepted_at: null,
    });

    await tempOtpService.save();

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        type,
        status,
        tempId: tempOtpService._id,
      },
    });
  } catch (error) {
    console.error("[initiate2FAChange]", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

export const verify2FAChange = async (req, res) => {
  try {
    const { otp, tempId } = req.body;
    const userId = req.user || req.user;
    const user = await PeopleUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate OTP
    if (!otp || typeof otp !== "string") {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    // Sanitize and validate OTP format
    const cleanOtp = otp.trim().replace(/[^0-9]/g, "");

    if (cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "OTP must be exactly 6 digits",
      });
    }

    const tempRecord = await TempPeopleOtpService.findOne({
      _id: tempId,
      user_id: userId,
      accepted_at: null,
    });

    if (!tempRecord) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found or expired",
      });
    }

    const isValidOtp = tempRecord.otp_code === cleanOtp;

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code",
      });
    }

    await TempPeopleOtpService.findByIdAndUpdate(tempRecord._id, {
      accepted_at: new Date(),
    });

    const updateFields = {};
    let destination = "";
    let message = "";

    const newStatus = tempRecord.status === "active" ? 1 : 0;

    switch (tempRecord.type) {
      case "email":
        updateFields.otp_email_status = newStatus;
        destination = user.email;
        message = `Email 2FA has been ${
          tempRecord.status === "active" ? "enabled" : "disabled"
        }`;
        break;
      case "sms":
        updateFields.otp_sms_status = newStatus;
        destination = `${user.phone_suffix} ${user.phone || ""}`;
        message = `SMS 2FA has been ${
          tempRecord.status === "active" ? "enabled" : "disabled"
        }`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid 2FA type",
        });
    }

    await PeopleUser.findByIdAndUpdate(userId, { $set: updateFields });

    return res.status(200).json({
      success: true,
      message,
      data: {
        type: tempRecord.type,
        status: tempRecord.status,
        destination: destination.trim(),
      },
    });
  } catch (error) {
    console.error("[verify2FAChange]", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};
