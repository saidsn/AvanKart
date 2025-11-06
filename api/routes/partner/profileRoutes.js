import express from "express";
import { home } from "../../controllers/partner/homeController.js";
import { isAuthenticated } from "../../middlewares/partner/authMiddleware.js";
import { validatePartnerProfileChange } from "../../middlewares/partner/profileMiddleware.js";
import { requestChange } from "../../controllers/partner/profileController.js";
import {
  cancelOtp,
  resendOtp,
  submitDeleteOtp,
  submitOtp,
  acceptDeleteUser,
} from "../../controllers/partner/submitTemp.js";

const router = express.Router();

router.post(
  "/request-change",
  [isAuthenticated, validatePartnerProfileChange],
  requestChange
);

router.post("/otp-submit", isAuthenticated, submitOtp);
router.post("/delete-otp-submit", isAuthenticated, submitDeleteOtp);
router.post("/otp-resend", isAuthenticated, resendOtp);
router.post("/otp-cancel", isAuthenticated, cancelOtp);
router.post("/accept-delete-user", isAuthenticated, acceptDeleteUser);

export default router;
