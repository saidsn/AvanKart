import express from "express";
import {
  getSorgu,
  getSorgularInside,
  getReasons,
} from "../../controllers/people/sorgular/sorguController.js";
import { isAuthenticated } from "../../middlewares/people/authMiddleware.js";
import fileUploadMiddleware from "../../middlewares/fileUploadMiddleware.js";
import addFiles, {
  deleteTicketFile,
} from "../../controllers/people/sorgular/addFiles.js";
import { addSorgu } from "../../controllers/people/sorgular/addSorgu.js";

const router = express.Router();

router.post("/", isAuthenticated, getSorgu);
router.post("/inside", isAuthenticated, getSorgularInside);
router.get("/reasons", isAuthenticated, getReasons);
router.post(
  "/tickets/:ticketId/files",
  isAuthenticated,
  fileUploadMiddleware("files"),
  addFiles
);
router.post(
  "/tickets/:ticketId/files/:fileId/delete",
  isAuthenticated,
  deleteTicketFile
);

router.post("/add", isAuthenticated, fileUploadMiddleware("files"), addSorgu);

export default router;
