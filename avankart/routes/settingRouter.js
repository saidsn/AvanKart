import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  renderSettingsPage,
  renderSessionsPage,
  render2FAPage,
  activeSession,
  endSession,
} from "../controllers/iController.js";
import csrf from "csurf";
import { changePrivateDetails } from "../controllers/settings/changePrivateDetails.js";
import { privateDataMiddleware } from "../middlewares/privateDataMiddlware.js";
import { settingsPasswordMiddleware } from "../middlewares/settingsPasswordMiddleware.js";
import { changePasswordDetails } from "../controllers/settings/changePassword.js";
import {
  acceptOtpServices,
  changeOtp,
} from "../controllers/settings/changeOtp.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/", [verifyToken, csrfProtection], renderSettingsPage);
router.get(
  "/active-sessions",
  [verifyToken, csrfProtection],
  renderSessionsPage
);
router.post("/active-sessions", [verifyToken, csrfProtection], activeSession);
router.post("/end-session", [verifyToken, csrfProtection], endSession);
router.get("/2fa", [verifyToken, csrfProtection], render2FAPage);
router.post(
  "/change-private",
  [verifyToken, csrfProtection, privateDataMiddleware],
  changePrivateDetails
);
router.post(
  "/change-password",
  [verifyToken, csrfProtection, settingsPasswordMiddleware],
  changePasswordDetails
);
router.post("/change-otp", [verifyToken, csrfProtection], changeOtp);
router.post("/accept-otp", [verifyToken, csrfProtection], acceptOtpServices);

export default router;
