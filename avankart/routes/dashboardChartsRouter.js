import express from "express";
import {
  balanceMovement,
  balanceMovementSimple,
  toplamOdemeler,
  cashbackDonught,
  meblegChart,
  getAllHesablasmalar,
  getAllHesablasmalarTotalAmount,
  getAllMuessiseler,
  getMuessiseRegisterStats,
  getTransactionsStats,
  cardBalancesSummary,
  getAllSirketler,
  getRegistratedUserStats,
  getInvoiceStats,
  getAllCards,
  getKartlarMedaxilStats,
  getKartlarMexaricStats,
  // imtiyazQruplariUzeOdemeler,
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
  "/balance-simple",
  [verifyToken, csrfProtection],
  balanceMovementSimple
);

router.post(
  "/imtiyaz-qruplari-uzre-odemeler",
  [verifyToken, csrfProtection],
  balanceMovement
);

router.post("/toplam-odemeler", [verifyToken, csrfProtection], toplamOdemeler);

router.post(
  "/cashback-donught",
  [verifyToken, csrfProtection],
  cashbackDonught
);

router.post("/mebleg-chart", [verifyToken, csrfProtection], meblegChart);
router.post("/commission", [verifyToken, csrfProtection], getAllHesablasmalar);
router.post(
  "/amount",
  [verifyToken, csrfProtection],
  getAllHesablasmalarTotalAmount
);
router.get("/muessiseler", [verifyToken, csrfProtection], getAllMuessiseler);
router.get("/sirketler", [verifyToken, csrfProtection], getAllSirketler);
router.get("/kartlar", [verifyToken, csrfProtection], getAllCards);
router.post(
  "/registered/users",
  [verifyToken, csrfProtection],
  getRegistratedUserStats
);
router.post("/mebleg/by-year", [verifyToken, csrfProtection], getInvoiceStats);
router.post(
  "/muessiseler/by-year",
  [verifyToken, csrfProtection],
  getMuessiseRegisterStats
);
router.post(
  "/transactions/by-year",
  [verifyToken, csrfProtection],
  getTransactionsStats
);
router.post(
  "/card-balances",
  [verifyToken, csrfProtection],
  cardBalancesSummary
);
router.post(
  "/medaxil/kartlar",
  [verifyToken, csrfProtection],
  getKartlarMedaxilStats
);
router.post(
  "/mexaric/kartlar",
  [verifyToken, csrfProtection],
  getKartlarMexaricStats
);
export default router;
