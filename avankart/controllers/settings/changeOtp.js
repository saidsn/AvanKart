import {
  generateOtp,
  sendMail,
  sendSms,
} from "../../../shared/utils/otpHandler.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import AdminUser from "../../../shared/models/adminUsersModel.js";
import TempAdminOtpService from "../../../shared/models/temAdminOtpServices.js";

export const changeOtp = async (req, res) => {
  const debug = process.env.NODE_ENV !== "production";

  try {
    const { changed } = req.body;
    const userId = req.user?.id || req.user?._id;
    const user = await AdminUser.findById(userId);

    if (!changed || !["sms", "email", "authenticator"].includes(changed)) {
      return res.status(400).json({ message: "Invalid changed value" });
    }

    const otp = generateOtp();

      await TempAdminOtpService.deleteMany({
      user_id: user._id,
      accepted_at: null,
      otp_to: "admin",
      changed
      });
    // Send OTP based on selected method
    if (changed === "email") {
      await sendMail(user.email, otp, debug);
    } else if (changed === "sms") {
      //TODO:  Use test phone number if user doesn't have one
      const phonePrefix = user.phone_suffix;
      const phoneNumber = user.phone;

      try {
        await sendSms(phonePrefix, phoneNumber, otp, debug);
      } catch (smsError) {
        console.error("SMS send failed:", smsError);
      }
    } else if (changed === "authenticator") {
      const secret = speakeasy.generateSecret({
        name: `Avankart (${user.email})`,
      });

      const otpDoc = new TempAdminOtpService({
        user_id: user._id,
        otp_code: secret.base32,
        changed,
        type: changed,
        accepted_at: null,
        otp_to: "admin"
      });
  
      await otpDoc.save();
      const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
      return res.status(200).json({
        success: true,
        otpRequired: true,
        showPopup: true,
        type: changed,
        qr: qrCodeDataURL,
      });
    }
    // Save OTP to database
    const otpDoc = new TempAdminOtpService({
      user_id: user._id,
      otp_code: otp,
      changed,
      type: changed,
      accepted_at: null,
      otp_to: "admin"
    });
    await otpDoc.save();

    return res.status(200).json({
      success: true,
      otpRequired: true,
      showPopup: true,
      type: changed,
      otp
    });
  } catch (error) {
    console.error("[changeOtp]", error);
    return res.status(500).json({ message: "Xəta baş verdi" });
  }
};

export const acceptOtpServices = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const userId = req.user?.id || req.user?._id;
    const user = await AdminUser.findById(userId);
    // Validate and sanitize OTP inputs
    const otpArray = [otp1, otp2, otp3, otp4, otp5, otp6];

    for (let i = 0; i < otpArray.length; i++) {
      if (!otpArray[i] || typeof otpArray[i] !== "string") {
        return res.status(400).json({
          message: `OTP ${i + 1
            } kodu göndərilməyib və ya düzgün formatda deyil`,
        });
      }
      // Sanitize - only accept numbers
      otpArray[i] = otpArray[i].trim().replace(/[^0-9]/g, "");
      if (otpArray[i].length !== 1) {
        return res.status(400).json({
          message: `OTP ${i + 1} kodu düzgün formatda deyil`,
        });
      }
    }

    const otp = otpArray.join("");

    if (otp.length !== 6) {
      return res.status(400).json({ message: "OTP kodu 6 rəqəmli olmalıdır" });
    }

    // Find latest OTP record for this user
    const latestRequest = await TempAdminOtpService.findOne({
      user_id: userId,
      accepted_at: null,
      otp_to: "admin"
    }).sort({ createdAt: -1 });
    if (!latestRequest) {
      return res
        .status(404)
        .json({ message: "Tətbiq ediləcək OTP növü tapılmadı" });
    }

    // Verify OTP code
    if (latestRequest.otp_code !== otp) {
      return res.status(400).json({
        message: "OTP kodu düzgün deyil",
      });
    }

    // Mark OTP as accepted
    await TempAdminOtpService.findByIdAndUpdate(latestRequest._id, {
      accepted_at: new Date(),
    });

    // Update user's 2FA status
    const updateFields = {};
    let destination = "";
    let message = "";

    switch (latestRequest.changed) {
      case "email":
        updateFields.otp_email_status = user.otp_email_status ? 0 : 1;
        destination = user.email;
        message = "Email ilə 2 addımlı doğrulama təsdiqləndi";
        break;
      case "sms":
        updateFields.otp_sms_status = user.otp_sms_status ? 0 : 1;
        destination = `${user.phone_suffix} ${user.phone || "507-70-35-22"}`;
        message = "Nömrə ilə 2 addımlı doğrulama təsdiqləndi";
        break;
      case "authenticator":
        updateFields.otp_authenticator_status = user.otp_authenticator_status
          ? 0
          : 1;
        destination = "Auth key";
        message = "Auth key ilə 2 addımlı doğrulama təsdiqləndi";
        break;
      default:
        return res.status(400).json({ message: "OTP növü düzgün deyil" });
    }

    await AdminUser.findByIdAndUpdate(userId, { $set: updateFields });

    return res.status(200).json({
      success: true,
      message: message,
      destination: destination,
      type: latestRequest.changed,
    });
  } catch (error) {
    console.error("[acceptOtpServices]", error);
    return res.status(500).json({ message: "Server xətası baş verdi" });
  }
};
