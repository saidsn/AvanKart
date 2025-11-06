import express from "express";
import multer from "multer";
import {
  dataTablePost,
  hesablasmalarTable,
  addReport,
} from "../controllers/hesablashmalar.js";
import { sendToAvankart } from "../controllers/hesablashmalar.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacHandler.js";
import {
  details,
  detailsDataTable,
} from "../controllers/hesablashmalar/hesablashmalarDetails.js";
import csrf from "csurf";

const router = express.Router();

const upload = multer();
const csrfProtection = csrf({ cookie: true });

router.get(
  "/datatable",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("hesablashmalar_view", "read"),
    attachPermissionsToLocals,
  ],
  hesablasmalarTable
);
router.post(
  "/datatable",
  [
    verifyToken,
    csrfProtection,
    csrfProtection,
    checkRbacPermission("hesablashmalar_view", "full"),
  ],
  dataTablePost
);

router.post(
  "/add-report",
  [
    verifyToken,
    upload.none(), 
    csrfProtection, 
    checkRbacPermission("hesablashmalar_view", "full"),
  ],
  addReport
);
router.post(
  "/send-to-avankart",
  [
    verifyToken,
    csrfProtection,
    csrfProtection,
    checkRbacPermission("hesablashmalar_view", "full"),
  ],
  sendToAvankart
);
router.get(
  "/:invoiceId",
  [
    verifyToken,
    csrfProtection,
    csrfProtection,
    checkRbacPermission("hesablashmalar_view", "read"),
  ],
  details
);
router.post(
  "/:invoiceId/details",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("hesablashmalar_view", "full"),
  ],
  detailsDataTable
);

export default router;
