import express from "express";
import csrf from "csurf";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  getAvankartPeoplePage,
  peopleTable,
  exportPeopleToExcel,
  peopleTableImtiyaz,
} from "../controllers/avankartPeople.js";
import { getUserData, getUserDataPeople, addBalanceToUser } from "../controllers/avankartPeopleTables.js";
import { invitePartner } from "../controllers/avankartInvite.js";
import {
  attachPermissionsToLocals,
  checkRbacPermission,
} from "../../shared/utils/rbacPeopleHandler.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get(
  "/avankart-people",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_people", "read"),
    attachPermissionsToLocals,
  ],
  getAvankartPeoplePage
);

router.post(
  "/avankart-people",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_people", "full"),
    attachPermissionsToLocals,
  ],
  peopleTable
);

router.post(
  "/avankart-people-imtiyaz",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_people", "full"),
    attachPermissionsToLocals,
  ],
  peopleTableImtiyaz
);

router.post(
  "/user/:partnyor_id",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "read"),
    attachPermissionsToLocals,
  ],
  getUserData
);

router.post(
  "/user-data/:partnyor_id",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "read"),
    attachPermissionsToLocals,
  ],
  getUserDataPeople
);

router.post(
  "/user-add-balance",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_partner", "read"),
    attachPermissionsToLocals,
  ],
  addBalanceToUser
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
  "/export-excel",
  [
    csrfProtection,
    verifyToken,
    checkRbacPermission("avankart_people", "read"),
    attachPermissionsToLocals,
  ],
  exportPeopleToExcel
);

export default router;
