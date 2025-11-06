import express from "express";
import {
  login,
  loginPost,
  logout,
  register,
  registerPost,
  forgetPassword,
  otpVerifyPage,
  otpVerifyPost,
  forgotPasswordOtherPost,
  forgetPasswordPost,
  sendOtherOtpPost,
} from "../controllers/authController.js";
import { resendOtp } from "../controllers/otp.js";
import {
  forgetOtpSubmit,
  forgetOtpSubmitPost,
} from "../controllers/auth/forget-password.js";
import csrf from "csurf";
import {
  alreadyLoggedIn,
  verifyForget,
  verifyOtp,
  verifyToken,
} from "../middlewares/verifyToken.js";
import {
  loginMiddleware,
  registerMiddleware,
} from "../middlewares/authMiddleware.js";
import { settingsPasswordMiddleware } from "../middlewares/settingsPasswordMiddleware.js";
import {
  createNewPassword,
  createNewPasswordSubmit,
} from "../controllers/auth/submit-password.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/login", [alreadyLoggedIn, csrfProtection], login);
router.get("/register", [alreadyLoggedIn, csrfProtection], register);
router.get(
  "/forget-password",
  [alreadyLoggedIn, csrfProtection],
  forgetPassword
);
router.get("/otpVerify", [verifyOtp, csrfProtection], otpVerifyPage);
router.post("/otpSubmit", [verifyOtp, csrfProtection], otpVerifyPost);
router.post('/resend-otp', [verifyOtp, csrfProtection], resendOtp);
router.get("/logout", logout);
router.post(
  "/forgot-password-other",
  [alreadyLoggedIn, csrfProtection],
  forgotPasswordOtherPost
);
router.post("/login", [loginMiddleware, alreadyLoggedIn,csrfProtection], loginPost);
router.post("/register", [registerMiddleware, csrfProtection], registerPost);
router.post("/forget-password", csrfProtection, forgetPasswordPost);

router.get(
  "/forgot-password-otp",
  [verifyOtp, csrfProtection],
  forgetOtpSubmit
);
router.post(
  "/forgot-password-otp-submit",
  [verifyForget, csrfProtection],
  forgetOtpSubmitPost
);

router.get("/create-new-password", [csrfProtection], createNewPassword);
router.post(
  "/create-new-password-submit",
  [csrfProtection, settingsPasswordMiddleware],
  createNewPasswordSubmit
);
router.post("/send-other-otp", [verifyOtp, csrfProtection], sendOtherOtpPost);

export default router;
