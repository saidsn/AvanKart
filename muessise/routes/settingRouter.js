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
import { testNotification } from "../controllers/notificationTest.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacHandler.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get(
  "/",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "read"),
    attachPermissionsToLocals,
  ],
  renderSettingsPage
);

router.get(
  "/active-sessions",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "read"),
    attachPermissionsToLocals,
  ],
  renderSessionsPage
);

router.post(
  "/active-sessions",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "read"),
    attachPermissionsToLocals,
  ],
  activeSession
);

router.post(
  "/end-session",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "full"),
    attachPermissionsToLocals,
  ],
  endSession
);

router.get(
  "/2fa",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "read"),
    attachPermissionsToLocals,
  ],
  render2FAPage
);
router.post(
  "/change-private",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "full"),
    attachPermissionsToLocals,
    privateDataMiddleware,
  ],
  changePrivateDetails
);

router.post(
  "/change-password",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "full"),
    attachPermissionsToLocals,
    settingsPasswordMiddleware,
  ],
  changePasswordDetails
);

router.post(
  "/change-otp",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "full"),
    attachPermissionsToLocals,
  ],
  changeOtp
);

router.post(
  "/accept-otp",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("settings_view", "full"),
    attachPermissionsToLocals,
  ],
  acceptOtpServices
);

router.post("/test-notification", testNotification);

export default router;
