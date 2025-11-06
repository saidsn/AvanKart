import express from "express";
import {
  dataTablePost,
  hesablasmalarTable,
  addReport,
  editInvoice,
  deleteInvoice,
} from "../controllers/hesablashmalar.js";
import { sendToAvankart } from "../controllers/hesablashmalar.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacPeopleHandler.js";
import {
  details,
  detailsDataTable,
} from "../controllers/hesablashmalar/hesablashmalarDetails.js";
import { hesablasmaPage } from "../controllers/emeliyyatlar/hesablasma.js";
import csrf from "csurf";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/datatable", [verifyToken, csrfProtection], hesablasmaPage);
router.post("/datatable", [verifyToken, csrfProtection], dataTablePost);

router.post(
  "/add-report",
  [
    verifyToken,
    csrfProtection,
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
    csrfProtection,
    checkRbacPermission("hesablashmalar_view", "full"),
  ],
  detailsDataTable
);

router.post(
  "/:invoiceId/edit",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("hesablashmalar_view", "full"),
  ],
  editInvoice
);

router.post(
  "/:invoiceId/delete",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("hesablashmalar_view", "full"),
  ],
  deleteInvoice
);

export default router;
