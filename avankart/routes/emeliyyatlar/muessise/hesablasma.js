import express from "express";
import csrf from "csurf";
import {
  getHesablasma,
  getHesablasmaJson,
  approveHesablasma,
  getHesablasmaDetailPage,
  getHesablasmaDetailApi,
  getHesablasmaTransactionsPage,
  getHesablasmaTransactionsApi,
  getHesablasmaTransactionsCardsApi,
  exportHesablasmaTransactionsPDF,
  generateHesablasmaPDF,
  downloadHesablasmaPDF,
  uploadFaktura,
  downloadFaktura,
  deleteFaktura,
  getHesablasmaAnaliz,
  getHesablasmaAnalizTransactions,
  getHesablasmaAnalizData,
  saveHesablasmaAnalizChanges,
  approveAndResendHesablasma,
  sendOtpForHesablasma,
} from "../../../controllers/emeliyyatlar/muessise/hesablasma.js";
import { verifyToken } from "../../../middlewares/verifyToken.js";
import { uploadSingleFaktura } from "../../../middlewares/fakturaUploadMiddleware.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/", [verifyToken, csrfProtection], getHesablasma);

router.post("/json", [verifyToken], getHesablasmaJson);
router.post("/api/data", [verifyToken], getHesablasmaJson);

router.get(
  "/details/:hesablasma_id",
  [verifyToken, csrfProtection],
  getHesablasmaDetailPage
);

// Yeni route: müəssisə ilə şirkət arasındakı detallı səhifə üçün hesablasma_id istifadə et
router.get(
  "/details/:hesablasma_id/transactions/:company_id",
  [verifyToken, csrfProtection],
  getHesablasmaTransactionsPage
);

router.get(
  "/api/details/:hesablasma_id",
  [verifyToken],
  getHesablasmaDetailApi
);

// API endpoint for transaction details
router.post(
  "/api/details/:hesablasma_id/transactions/:company_id",
  [verifyToken],
  getHesablasmaTransactionsApi
);

// NEW: summary cards (category totals)
router.get(
  "/api/details/:hesablasma_id/transactions/:company_id/cards",
  [verifyToken],
  getHesablasmaTransactionsCardsApi
);

// NEW: export PDF stub
router.get(
  "/details/:hesablasma_id/transactions/:company_id/pdf",
  exportHesablasmaTransactionsPDF
);

router.post("/:hesablasma_id/approve", [verifyToken], approveHesablasma);

router.get(
  "/:hesablasma_id/generate-pdf",
  [verifyToken],
  generateHesablasmaPDF
);
router.get(
  "/:hesablasma_id/download-pdf",
  [verifyToken],
  downloadHesablasmaPDF
);

router.post(
  "/:hesablasma_id/upload-faktura",
  [verifyToken, uploadSingleFaktura],
  uploadFaktura
);

router.get("/:hesablasma_id/download-faktura", [verifyToken], downloadFaktura);

router.delete("/:hesablasma_id/delete-faktura", [verifyToken], deleteFaktura);

// Analiz modal API-ləri
router.get("/analiz/:hesablasma_id", [verifyToken], getHesablasmaAnaliz);
router.post(
  "/analiz/:hesablasma_id/transactions",
  [verifyToken],
  getHesablasmaAnalizTransactions
);
router.post(
  "/analiz/:hesablasma_id/send-otp",
  [verifyToken],
  sendOtpForHesablasma
);
router.post(
  "/analiz/:hesablasma_id/approve-resend",
  [verifyToken],
  approveAndResendHesablasma
);

// Yeni analiz modal API-ləri
router.get("/:hesablasma_id/analiz-data", [verifyToken], getHesablasmaAnalizData);
router.post("/:hesablasma_id/save-analiz-changes", [verifyToken], saveHesablasmaAnalizChanges);

export default router;
