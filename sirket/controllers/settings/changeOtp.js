import TempPeopleOtpService from "../../../shared/model/people/tempPeopleOtpService.js";
import PeopleUser from "../../../shared/models/peopleUserModel.js";
import {
  generateOtp,
  sendMail,
  sendSms,
} from "../../../shared/utils/otpHandler.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

// Sadecə serverdə saxlanacaq: { userId: timestamp }
const lastAuthenticatorRequest = {};

export const changeOtp = async (req, res) => {
  const debug = process.env.NODE_ENV !== "production";

  try {
    const { changed } = req.body;
    const userId = req.user?.id || req.user?._id;
    const user = await PeopleUser.findById(userId);

    if (!changed || !["sms", "email", "authenticator"].includes(changed)) {
      return res.status(400).json({
        success: false,
        message: "Invalid changed value"
      });
    }

    // 🔹 Authenticator üçün xüsusi məntiq
    if (changed === "authenticator") {
      const now = Date.now();
      const lastRequest = lastAuthenticatorRequest[userId] || 0;

      // 1 saniyə keçməyibsə mövcud OTP-ni qaytar
      if (now - lastRequest < 1000) {
        const existingOtp = await TempPeopleOtpService.findOne({ user_id: user._id, changed })
          .sort({ createdAt: -1 });
        if (existingOtp) {
          const manualCode = existingOtp.otp_code.replace(/=/g, '').substring(0, 16);
          const qrCodeDataURL = await qrcode.toDataURL(`otpauth://totp/Avankart:${user.email}?secret=${existingOtp.otp_code}&issuer=Avankart`);

          return res.status(200).json({
            success: true,
            message: "Authenticator aktivləşdirmə prosesi (cooldown)",
            otpRequired: true,
            showPopup: true,
            type: changed,
            qr: qrCodeDataURL,
            manualCode,
            otpauthUrl: `otpauth://totp/Avankart:${user.email}?secret=${existingOtp.otp_code}&issuer=Avankart`
          });
        }
      }

      // cooldown üçün vaxtı yenilə
      lastAuthenticatorRequest[userId] = now;

      const secret = speakeasy.generateSecret({
        length: 10,
        name: `Avankart (${user.email})`,
        issuer: "Avankart"
      });

      // TempPeopleOtpService-də saxla
      const otpDoc = new TempPeopleOtpService({
        user_id: user._id,
        otp_code: secret.base32,
        changed,
        accepted_at: null,
        type: "authenticator"
      });
      await otpDoc.save();

      // İstifadəçi modelinə də yaz
      user.authenticator_secret = secret.base32;
      await user.save();

      const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
      const manualCode = secret.base32.replace(/=/g, '').substring(0, 16);

      return res.status(200).json({
        success: true,
        message: "Authenticator aktivləşdirmə prosesi başlatıldı",
        otpRequired: true,
        showPopup: true,
        type: changed,
        qr: qrCodeDataURL,
        manualCode,
        otpauthUrl: secret.otpauth_url
      });
    }

    // 🔹 SMS və Email üçün OTP 
    const otp = generateOtp().toString().trim();

    if (changed === "email") {
      try {
        await sendMail(user.email, otp, debug);
        if (debug) console.log(`[DEBUG][EMAIL OTP] ${user.email} üçün OTP: ${otp}`);
      } catch (mailError) {
        console.error("Email send failed:", mailError);
        return res.status(500).json({ success: false, message: "Email göndərilmədi" });
      }
    } else if (changed === "sms") {
      try {
        await sendSms(user.phone_suffix, user.phone, otp, debug);
        if (debug) console.log(`[DEBUG][SMS OTP] ${user.phone_suffix}${user.phone} üçün OTP: ${otp}`);
      } catch (smsError) {
        console.error("SMS send failed:", smsError);
        return res.status(500).json({ success: false, message: "SMS göndərilmədi" });
      }
    }

    // 🔹 Əvvəlki OTP-ləri sil
    await TempPeopleOtpService.deleteMany({ user_id: user._id, changed });

    // 🔹 Yeni OTP-ni DB-yə yaz
    await new TempPeopleOtpService({
      user_id: user._id,
      otp_code: otp,
      changed,
      accepted_at: null,
      type: changed
    }).save();

    return res.status(200).json({
      success: true,
      message: `${changed.toUpperCase()} üçün OTP göndərildi`,
      otpRequired: true,
      showPopup: true,
      type: changed
    });

  } catch (error) {
    console.error("[changeOtp]", error);
    return res.status(500).json({ success: false, message: "Xəta baş verdi" });
  }
};



export const acceptOtpServices = async (req, res) => {
  try {
    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const userId = req.user?.id || req.user?._id;

    // Validate and sanitize OTP inputs
    const otpArray = [otp1, otp2, otp3, otp4, otp5, otp6];

    for (let i = 0; i < otpArray.length; i++) {
      if (!otpArray[i] || typeof otpArray[i] !== "string") {
        return res.status(400).json({
          message: `OTP ${i + 1} kodu göndərilməyib və ya düzgün formatda deyil`,
        });
      }

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

    const latestRequest = await TempPeopleOtpService.findOne({
      user_id: userId,
      accepted_at: null,
    }).sort({ createdAt: -1 });

    if (!latestRequest) {
      return res.status(404).json({ message: "Tətbiq ediləcək OTP növü tapılmadı" });
    }

    const user = await PeopleUser.findById(userId);

    // Verify OTP based on type
    if (latestRequest.changed === "authenticator") {
      const verified = speakeasy.totp.verify({
        secret: user.authenticator_secret,
        encoding: "base32",
        token: otp,
        window: 1
      });

      if (!verified) {
        return res.status(400).json({ message: "OTP kodu düzgün deyil" });
      }
    } else {
      if (latestRequest.otp_code !== otp) {
        return res.status(400).json({ message: "OTP kodu düzgün deyil" });
      }
    }

    // Mark OTP as accepted
    await TempPeopleOtpService.findByIdAndUpdate(latestRequest._id, {
      accepted_at: new Date(),
    });

    // Update user 2FA status
    const updateFields = {};
    let destination = "";
    let message = "";
    let newDestination = "";

    switch (latestRequest.changed) {
      case "email":
        const newEmailStatus = user.otp_email_status ? 0 : 1;
        updateFields.otp_email_status = newEmailStatus;
        destination = user.email;
        message = newEmailStatus === 1 
          ? "Email ilə 2 addımlı doğrulama aktivləşdirildi" 
          : "Email ilə 2 addımlı doğrulama söndürüldü";
        
        // Əgər aktivləşdirilirsə, destination email olsun
        if (newEmailStatus === 1) {
          newDestination = "email";
        } else {
          // Söndürülürsə, digər aktiv metodlardan birini seç
          if (user.otp_sms_status === 1) {
            newDestination = "sms";
          } else if (user.otp_authenticator_status === 1) {
            newDestination = "authenticator";
          } else {
            newDestination = ""; // heç biri aktiv deyilsə
          }
        }
        break;

      case "sms":
        const newSmsStatus = user.otp_sms_status ? 0 : 1;
        updateFields.otp_sms_status = newSmsStatus;
        destination = `${user.phone_suffix} ${user.phone || "507-70-35-22"}`;
        message = newSmsStatus === 1 
          ? "Nömrə ilə 2 addımlı doğrulama aktivləşdirildi" 
          : "Nömrə ilə 2 addımlı doğrulama söndürüldü";
        
        if (newSmsStatus === 1) {
          newDestination = "sms";
        } else {
          if (user.otp_email_status === 1) {
            newDestination = "email";
          } else if (user.otp_authenticator_status === 1) {
            newDestination = "authenticator";
          } else {
            newDestination = "";
          }
        }
        break;

      case "authenticator":
        const newAuthStatus = user.otp_authenticator_status ? 0 : 1;
        updateFields.otp_authenticator_status = newAuthStatus;
        destination = "Auth key";
        message = newAuthStatus === 1 
          ? "Auth key ilə 2 addımlı doğrulama aktivləşdirildi" 
          : "Auth key ilə 2 addımlı doğrulama söndürüldü";
        
        if (newAuthStatus === 1) {
          newDestination = "authenticator";
        } else {
          if (user.otp_email_status === 1) {
            newDestination = "email";
          } else if (user.otp_sms_status === 1) {
            newDestination = "sms";
          } else {
            newDestination = "";
          }
        }
        break;

      default:
        return res.status(400).json({ message: "OTP növü düzgün deyil" });
    }

    // otp_destination də əlavə et
    updateFields.otp_destination = newDestination;

    await PeopleUser.findByIdAndUpdate(userId, { $set: updateFields });

    return res.status(200).json({
      success: true,
      message,
      destination,
      type: latestRequest.changed,
      current_otp_destination: newDestination 
    });
  } catch (error) {
    console.error("[acceptOtpServices]", error);
    return res.status(500).json({ message: "Server xətası baş verdi" });
  }
};
