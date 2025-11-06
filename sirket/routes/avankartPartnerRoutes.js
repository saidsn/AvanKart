import express from "express";
import csrf from "csurf";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  partnerTable,
  getAvankartPartnerPage,
  partnerTransactionsTable,
  partnerUserShow,
  restorePartnerUser,
  getUserData,
  addBalance,
} from "../controllers/avankartPeople.js";
import { invitePartner } from "../controllers/avankartInvite.js";
import {
  attachPermissionsToLocals,
  checkRbacPermission,
} from "../../shared/utils/rbacHandler.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get(
  "/avankart-partner",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "read"),
    attachPermissionsToLocals,
  ],
  getAvankartPartnerPage
);

router.post(
  "/avankart-partner",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "full"),
    attachPermissionsToLocals,
  ],
  partnerTable
);

router.post(
  "/invite-partner",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "full"),
    attachPermissionsToLocals,
  ],
  invitePartner
);

router.post(
  "/avankart-partner/transactions-table",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "full"),
    attachPermissionsToLocals,
  ],
  partnerTransactionsTable
);

router.get(
  "/user/:partnyor_id",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "read"),
    attachPermissionsToLocals,
  ],
  partnerUserShow
);

router.post(
  "/get-user-data",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "full"),
    attachPermissionsToLocals,
  ],
  getUserData
);

router.post(
  "/avankart-people/add-balance",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_people", "full"),
    attachPermissionsToLocals,
  ],
  addBalance
);

export default router;
