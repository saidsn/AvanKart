import express from "express";
import csrf from "csurf";
import {
  getSirketler,
  listTable,
  createCompany,
  getSirketInside,
  getCompanyByIdApi,
  updateCompany,
  updateCompanyStatus,
  requestDelete,
  getSirketCounts,
  createOrEditRekvizit,
  deleteRekvizit,
  getContracts,
  uploadContract,
  downloadContract,
  deleteContract,
} from "../controllers/sirketler.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { uploadContractFiles } from "../utils/multerConfig.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/", [verifyToken, csrfProtection], getSirketler);
router.get("/api/counts", [verifyToken, csrfProtection], getSirketCounts);
router.get("/api/:id", [verifyToken, csrfProtection], getCompanyByIdApi);
router.get("/:id", [verifyToken, csrfProtection], getSirketInside);

router.post(
  "/:id/request-delete",
  [verifyToken, csrfProtection],
  requestDelete
);
router.post("/create", [verifyToken, csrfProtection], createCompany);
router.post("/table", [verifyToken, csrfProtection], listTable);

router.patch("/:id", [verifyToken, csrfProtection], updateCompany);
router.patch("/:id/status", [verifyToken, csrfProtection], updateCompanyStatus);

router.post("/rekvizitler", [verifyToken, csrfProtection], createOrEditRekvizit);
router.delete("/rekvizitler/:id", [verifyToken, csrfProtection], deleteRekvizit);

// Contract routes
router.post("/:sirket_id/contracts", [verifyToken], getContracts);
router.post("/:sirket_id/contracts/upload", [verifyToken, uploadContractFiles.single('contract')], uploadContract);
router.get("/contracts/download/:contract_id", [verifyToken], downloadContract);
router.delete("/contracts/:contract_id", [verifyToken], deleteContract);

export default router;
