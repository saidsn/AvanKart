// routes/emeliyyatlar/sirket/eqaime.js
import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../../middlewares/verifyToken.js";
import {
  getEQaime,
  eqaimeList,
  eqaimeDetails,
  eqaimeApprove,
  eqaimeFolderByMonth,
  eqaimeDetailsView,
  eqaimeDetailsJson,
  eqaimeMonthCounts,
  eqaimeYearCounts, // <-- NEW
} from "../../../controllers/emeliyyatlar/sirket/eqaime.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.use((req, res, next) => {
  // console.log(`[EQAIME ROUTER] ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/", [verifyToken], getEQaime);
router.get("/:qaime_id/view", [verifyToken], eqaimeDetailsView);
router.post("/:qaime_id", [verifyToken], eqaimeDetailsJson);
router.post("/", [verifyToken, csrfProtection], eqaimeList);
router.post("/:qaime_id", [verifyToken], eqaimeDetails);
router.post("/:qaime_id/approve", [verifyToken, csrfProtection], eqaimeApprove);
router.post(
  "/api/eqaimes/folder/:companyId/:year/:month",
  [verifyToken],
  eqaimeFolderByMonth
);

// === NEW: month counts for E-qaimə (company + year) ===
router.get(
  "/api/eqaime/month-counts/:companyId/:year",
  [verifyToken],
  eqaimeMonthCounts
);

// === NEW: year counts for E-qaimə (company) ===
router.get(
  "/api/eqaime/year-counts/:companyId",
  [verifyToken],
  eqaimeYearCounts
);

export default router;
