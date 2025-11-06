import express from "express";
import csrf from "csurf";
import {
  iscilerTable,
  iscilerTablePerm,
} from "../controllers/emeliyyatlar/ishcilerTable.js";
import {
  balancePage,
  isciBalance,
  balanceTable,
  sendToAvankart,
  deleteBalance,
  userDetailsPage,
  imtiyazUsersPage,
  dutyUsersPage,
  userCardDetails,
  imtiyazDetails,
  dutyDetails,
} from "../controllers/emeliyyatlar/ischiler.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { editWorkerBalance } from "../controllers/emeliyyatlar/editWorkerBalance.js";

import {
  addBalance,
  editBalance,
} from "../controllers/operations/balanceOperations.js";
import { editBalanceOperation } from "../controllers/operations/balanceOperationsTemp.js";

const router = express.Router();

const csrfProtection = csrf({ cookie: true });

router.post("/isciler-table", [verifyToken, csrfProtection], iscilerTable);
router.post(
  "/isciler-table-perm",
  [verifyToken, csrfProtection],
  iscilerTablePerm
);
// TODO: TEST ETMEK UCUNDUR
router.get("/isciler-balance", [verifyToken, csrfProtection], balancePage);
//inside on all
router.get("/details/:id", [verifyToken, csrfProtection], userDetailsPage);
router.post("/kart-details", [verifyToken, csrfProtection], userCardDetails);
router.get("/imtiyaz/:id", [verifyToken, csrfProtection], imtiyazUsersPage);
router.post("/imtiyaz-details", [verifyToken, csrfProtection], imtiyazDetails);
router.get("/duty/:id", [verifyToken, csrfProtection], dutyUsersPage);
router.post("/duty-details", [verifyToken, csrfProtection], dutyDetails);

router.post("/add-balance-table", [verifyToken, csrfProtection], balanceTable);
router.post("/send-to-avankart", [verifyToken, csrfProtection], sendToAvankart);
router.post("/delete-balance", [verifyToken, csrfProtection], deleteBalance);
router.get(
  "/edit-balance/:balance_id",
  [verifyToken, csrfProtection],
  editBalance
);
router.get("/add-balance", [verifyToken, csrfProtection], addBalance);
router.post("/edit-balance", [verifyToken, csrfProtection], editBalanceOperation);
router.get("/:balance_id/:card_id", [verifyToken, csrfProtection], isciBalance);

export default router;
