// routes/fileUploadRoutes.js
import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import fileUploadMiddleware from "../middlewares/fileUploadMiddleware.js";
import { excelUpload, uploadTicketFiles } from "../controllers/fileUploadController.js";
import { hesablashmaAddFaktura } from "../controllers/fileUploadController.js";
import { uploadExcel } from "../middlewares/excelUploadMiddleware.js";

const router = express.Router();

// File upload endpoint
// POST /api/tickets/:ticketId/upload
router.post(
  "/tickets/:ticketId/upload",
  verifyToken, // Authentication required
  fileUploadMiddleware("files"), // Handle file upload and security
  uploadTicketFiles // Save to database
);

router.post(
  "/faktura/:hesablasmaId/upload",
  verifyToken,
  fileUploadMiddleware("files"),
  hesablashmaAddFaktura
);


router.post("/excel-upload", uploadExcel.single("file"), excelUpload);
export default router;
