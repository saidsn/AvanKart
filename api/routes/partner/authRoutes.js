import express from "express";
import {
  otpAuthMiddleware,
  isGuest,
  isAuthenticated
} from "../../middlewares/partner/authMiddleware.js";
import {
  forgotPassword,
  login,
  logout,
  register,
  submitForgottonPassword,
} from "../../controllers/partner/auth/authController.js";
import {
  forgotPasswordMiddleware,
  loginMiddleware,
  registerMiddleware,
  submitForgottonPasswordMiddleware,
} from "../../middlewares/partner/authValidate.js";
import {
  cancelOtp,
  retryOtp,
  submitOtp,
} from "../../controllers/partner/auth/otpController.js";
import { checkSession } from "../../controllers/partner/auth/authController.js";

const router = express.Router();

router.get("/login", isGuest, (req, res) => {
  res.json({ message: "Login [page]" });
});

router.post("/login", [isGuest, loginMiddleware], login);
router.get("/check-session", checkSession);

router.post("/register", [isGuest, registerMiddleware], register);
router.post(
  "/forgot-password",
  [isGuest, forgotPasswordMiddleware],
  forgotPassword
);
router.post(
  "/submit-forgotten-password",
  [isAuthenticated, submitForgottonPasswordMiddleware],
  submitForgottonPassword
);

router.post("/submit-otp", otpAuthMiddleware, submitOtp);
router.post("/cancel-otp", otpAuthMiddleware, cancelOtp);

router.post("/retry-otp", retryOtp);
router.post("/logout", logout);

export default router;
