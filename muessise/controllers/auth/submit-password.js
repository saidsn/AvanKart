import { createClient } from "redis";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";
import argon2 from "argon2";
import { decrypt } from "../../utils/crypto.js";

const redisClient = createClient();
redisClient.connect();

export const createNewPassword = async (req, res) => {
  const currentLang = req.getLocale();
  const langFilter = `lang.${currentLang}`;

  return res.render("pages/auth/createNewPassword", {
    csrfToken: req.csrfToken(),
    layout: "./layouts/auth",
  });
};

export const createNewPasswordSubmit = async (req, res) => {
  const { new_password } = req.body;

  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        error: "Session not found. Please start the password reset process again.",
        redirect: "/auth/forget-password"
      });
    }

    const encryptedSession = await redisClient.get(`session:${sessionId}`);

    if (!encryptedSession) {
      return res.status(401).json({
        error: "Session expired. Please start the password reset process again.",
        redirect: "/auth/forget-password"
      });
    }

    const sessionData = JSON.parse(decrypt(encryptedSession));
    const { user, isPasswordReset } = sessionData;

    console.log("Session data:", { user, isPasswordReset });

    if (!isPasswordReset) {
      return res.status(403).json({
        error: "Invalid session type. Please start the password reset process again.",
        redirect: "/auth/forget-password"
      });
    }

    const dbUser = await PartnerUser.findById(user.id);

    if (!dbUser) {
      return res.status(404).json({
        error: "User not found",
        redirect: "/auth/forget-password"
      });
    }

    const hashedPassword = await argon2.hash(new_password);

    console.log("Updating password for user:", dbUser.email);

    await PartnerUser.findByIdAndUpdate(dbUser._id, {
      password: hashedPassword,
      last_password_update: new Date()
    });

    if (sessionId) {
      await redisClient.del(`session:${sessionId}`);
    }
    await res.clearCookie("sessionId");

    res.status(200).json({
      message: "Password updated successfully",
      success: true,
      redirect: "/auth/login"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      error: "Failed to update password. Please try again.",
      redirect: "/auth/forget-password"
    });
  }
};