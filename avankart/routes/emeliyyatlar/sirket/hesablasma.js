import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../../middlewares/verifyToken.js";
import {
  getHesablasma,
  hesablasmaList,
  hesablasmaTree,
  hesablasmaFolderByMonth,
  hesablasmaMonthCounts,
  hesablasmaYearCounts,
  hesablasmaAmountRange,
  confirmHesablasma,
  reportHesablasma,
} from "../../../controllers/emeliyyatlar/sirket/hesablasma.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.use((req, res, next) => {
  next();
});

router.get("/", [verifyToken], getHesablasma);
router.post("/", [verifyToken, csrfProtection], hesablasmaList);
router.post("/tree", [verifyToken], hesablasmaTree);
router.post(
  "/api/hesablasma/folder/:companyId/:year/:month",
  [verifyToken],
  hesablasmaFolderByMonth
);

router.get(
  "/api/hesablasma/month-counts/:companyId/:year",
  [verifyToken],
  hesablasmaMonthCounts
);

router.get(
  "/api/hesablasma/year-counts/:companyId",
  [verifyToken],
  hesablasmaYearCounts
);

router.get(
  "/api/hesablasma/amount-range",
  [verifyToken],
  hesablasmaAmountRange
);

router.post(
  "/:invoice_id/confirm",
  [verifyToken],
  confirmHesablasma
);

router.post(
  "/:invoice_id/report",
  [verifyToken],
  reportHesablasma
);

export default router;
