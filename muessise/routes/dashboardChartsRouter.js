import express from "express";
import qrCodeCounts, {
  kartlarUzreMeblegChart,
} from "../controllers/dashboardCharts.js";
import { tranzactionsTable } from "../controllers/dashboardCharts.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import csrf from "csurf";
import { hesablasmalar } from "../controllers/dashboardCharts.js";
import { meblegChart } from "../controllers/dashboardCharts.js";
import { createTestTransaction } from "../controllers/dashboardCharts.js";
import {
  attachPermissionsToLocals,
  checkRbacPermission,
} from "../../shared/utils/rbacHandler.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.post(
  "/qr-code-counts",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("dashboard_view", "read"),
  ],
  qrCodeCounts
);

router.post(
  "/hesablasmalar",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("dashboard_view", "read"),
  ],
  hesablasmalar
);

router.post(
  "/transactions-table",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("dashboard_view", "read"),
  ],
  tranzactionsTable
);

router.post(
  "/mebleg-chart",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("dashboard_view", "read"),
  ],
  meblegChart
);

router.post(
  "/kartlar-chart",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("dashboard_view", "read"),
  ],
  kartlarUzreMeblegChart
);
router.post(
  "/create-test-data",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("dashboard_view", "full"),
  ],
  createTestTransaction
);

export default router;
