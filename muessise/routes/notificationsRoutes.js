import express from "express";
import csrf from "csurf";
import {
  notificationsPersonalTable,
  notificationsPage,
  setas,
} from "../controllers/notifications.js";
import { verifyToken } from "../middlewares/verifyToken.js";
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
    checkRbacPermission("notifications_view", "read"),
    attachPermissionsToLocals,
  ],
  notificationsPage
);

router.post(
  "/personal-table",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("notifications_view", "read"),
    attachPermissionsToLocals,
  ],
  notificationsPersonalTable
);

router.post(
  "/setas",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("notifications_view", "full"),
    attachPermissionsToLocals,
  ],
  setas
);

export default router;
