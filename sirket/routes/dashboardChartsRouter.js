import express from "express";
import {
  balanceMovement,
  toplamOdemeler,
  cashbackDonught,
  meblegChart,
  imtiyazQruplariUzeOdemeler,
} from "../controllers/dashboardCharts.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import csrf from "csurf";
const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.post(
  "/balance-movement",
  [verifyToken, csrfProtection],
  balanceMovement
);

router.post(
  "/imtiyaz-qruplari-uzre-odemeler",
  [verifyToken, csrfProtection],
  imtiyazQruplariUzeOdemeler
);

router.post("/toplam-odemeler", [verifyToken, csrfProtection], toplamOdemeler);

router.post(
  "/cashback-donught",
  [verifyToken, csrfProtection],
  cashbackDonught
);

router.post("/mebleg-chart", [verifyToken, csrfProtection], meblegChart);

export default router;
