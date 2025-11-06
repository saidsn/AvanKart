import { createClient } from "redis"
import PeopleUser from "../../shared/models/peopleUserModel.js";

const redisClient = createClient();
redisClient.connect();
redisClient.on("error", err => console.log("Redis error!,", err));
export const showOtpPage = (req, res) => {
    if (!req.session.userIdForOtp) {
        return res.redirect("/")
    }

    const currentLang = req.getLocale()
    const langFilter = `lang.${currentLang}`

    return res.render("pages/auth/authOtp", {
        error: "",
        message: "",
        csrfToken: req.csrfToken(),
        layouts: "./layouts/auth"
    })
}

export const authOtpPost = async (req, res) => {
  const userId = req.session.userIdForOtp;
  if (!userId) return res.redirect("/");

  const { otp } = req.body;
  const cleanOtp = otp?.trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.render("pages/auth/authOtp", {
      error: "OTP 6 rəqəm olmalıdır",
      csrfToken: req.csrfToken(),
      layouts: "./layouts/auth"
    });
  }

  const user = await PeopleUser.findById(userId);
  if (!user) return res.redirect("/");

  if (user.otp_code !== cleanOtp) {
    return res.render("pages/auth/authOtp", {
      error: "OTP yanlışdır",
      csrfToken: req.csrfToken(),
      layouts: "./layouts/auth"
    });
  }

  user.otp_verified = true;
  user.otp_code = null;
  await user.save();

  req.session.otpVerified = true;
  return res.redirect("/home");
};