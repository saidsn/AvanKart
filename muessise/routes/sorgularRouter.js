import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import csrf from "csurf";
import {
  getSorgularInside,
  showSorgularPage,
  sorgularTable,
  addSorgu,
} from "../controllers/sorgularController.js";
import fileUploadMiddleware from "../middlewares/fileUploadMiddleware.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacHandler.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/:ticketId", [
  verifyToken, 
  csrfProtection,
  checkRbacPermission("sorgular_view", "read"),
  attachPermissionsToLocals,
], getSorgularInside);

router.get("/", [
  verifyToken, 
  csrfProtection,
  checkRbacPermission("sorgular_view", "read"),
  attachPermissionsToLocals,
], showSorgularPage);

router.post("/sorgular-table", [
  verifyToken, 
  csrfProtection,
  checkRbacPermission("sorgular_view", "read"),
  attachPermissionsToLocals,
], sorgularTable);

router.post(
  "/add",
  [
    verifyToken, 
    csrfProtection, 
    checkRbacPermission("sorgular_view", "full"),
    attachPermissionsToLocals,
    fileUploadMiddleware("files")
  ],
  addSorgu
);

export default router;
