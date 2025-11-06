import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import csrf from "csurf";
import {
  getSorgularInside,
  showSorgularPage,
  sorgularTable,
  addSorgu,
  uploadFilesToTicket,
  downloadTicketFile,
  deleteTicketFile,
} from "../controllers/sorgularController.js";
import fileUploadMiddleware from "../middlewares/fileUploadMiddleware.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacPeopleHandler.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

// RBAC Middleware deleted
router.get("/:ticketId", [verifyToken, csrfProtection], getSorgularInside);

router.get("/", [verifyToken, csrfProtection], showSorgularPage);

router.post("/sorgular-table", [verifyToken, csrfProtection], sorgularTable);

router.post(
  "/add",
  [
    verifyToken,
    fileUploadMiddleware("files"),
    // csrfProtection
  ],
  addSorgu
);

// Add route for uploading files to existing tickets
router.post(
  "/:ticketId/upload",
  [
    verifyToken,
    fileUploadMiddleware("files"),
    // csrfProtection
  ],
  uploadFilesToTicket
);

// Add route for downloading files
router.get("/files/:fileId/download", [verifyToken], downloadTicketFile);

// Add route for deleting files
router.delete("/files/:fileId", [verifyToken], deleteTicketFile);

export default router;
