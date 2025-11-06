import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import fileUploadMiddleware from "../middlewares/fileUploadMiddleware.js";
import {
  excelUpload,
  uploadTicketFiles,
} from "../controllers/fileUploadController.js";
import { hesablashmaAddFaktura } from "../controllers/fileUploadController.js";
import { uploadExcel } from "../middlewares/excelUploadMiddleware.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacHandler.js";

const router = express.Router();

router.post(
  "/tickets/:ticketId/upload",
  verifyToken,
  attachPermissionsToLocals,
  checkRbacPermission("sorgular_view", "full"),
  fileUploadMiddleware("files"),
  uploadTicketFiles
);

router.post(
  "/faktura/:hesablasmaId/upload",
  verifyToken,
  attachPermissionsToLocals,
  checkRbacPermission("hesablashmalar_view", "full"),
  fileUploadMiddleware("files"),
  hesablashmaAddFaktura
);

router.post(
  "/excel-upload",
  verifyToken,
  attachPermissionsToLocals,
  checkRbacPermission("hesablashmalar_view", "full"),
  uploadExcel.single("file"),
  excelUpload
);
export default router;
