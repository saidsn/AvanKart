import express from "express";
import csrf from "csurf";
import {
  getTransactions,
  getTransactionsTable,
  exportTransactions,
  getFilterOptions,
  getTransactionSummary,
  invalidateTransactionCache,
} from "../controllers/transactions.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/", [verifyToken, csrfProtection], getTransactions);
router.get("/summary", [verifyToken, csrfProtection], getTransactionSummary);
router.get("/filter-options", [verifyToken, csrfProtection], getFilterOptions);
router.post("/", [verifyToken, csrfProtection], getTransactionsTable);
router.post("/export", [verifyToken, csrfProtection], exportTransactions);
router.post(
  "/invalidate-cache",
  [verifyToken, csrfProtection],
  invalidateTransactionCache
);

export default router;
