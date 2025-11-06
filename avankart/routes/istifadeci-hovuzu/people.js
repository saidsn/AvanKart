import express from "express";
import csrf from "csurf";
import { getPeople, getPeopleInside } from "../../controllers/istifadeci-hovuzu/people.js";
import { getPeopleTransactionsTable, getPeopleTransactionSubjects, getPeopleTransactionCardCategories, getPeopleTransactionDestinationsAndStatuses } from "../../controllers/istifadeci-hovuzu/peopleTransactions.js";
import { getPeopleOperationsPersonal, getPeopleOperationCardCategories, getPeopleOperationsCorporate, getPeopleOperationsCorporateCompanyTable } from "../../controllers/istifadeci-hovuzu/peopleOperations.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {
  getAdminProfile,
  getAdminTable,
  requestAdminDelete,
  setAdminStatus,
} from "../../controllers/istifadeci-hovuzu/admin.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();


router.get("/", [verifyToken, csrfProtection], getPeople);
router.get("/:people_id", [verifyToken, csrfProtection], getPeopleInside);
router.post(
  "/:people_id/transactions/table",
  [verifyToken, csrfProtection],
  getPeopleTransactionsTable
);
router.get(
  "/:people_id/transactions/subjects",
  [verifyToken, csrfProtection],
  getPeopleTransactionSubjects
);
router.get(
  "/:people_id/transactions/card-categories",
  [verifyToken, csrfProtection],
  getPeopleTransactionCardCategories
);
router.get(
  "/:people_id/transactions/destinations-and-statuses",
  [verifyToken, csrfProtection],
  getPeopleTransactionDestinationsAndStatuses
);

// Fərdi əməliyyatlar endpoints
router.post(
  "/:people_id/operations/personal/table",
  [verifyToken, csrfProtection],
  getPeopleOperationsPersonal
);
router.get(
  "/:people_id/operations/card-categories",
  [verifyToken, csrfProtection],
  getPeopleOperationCardCategories
);

// Korporativ əməliyyatlar endpoints
router.post(
  "/:people_id/operations/corporate/table",
  [verifyToken, csrfProtection],
  getPeopleOperationsCorporate
);
// Seçilmiş şirkət üçün detallı əməliyyatlar
router.post(
  "/:people_id/operations/corporate/company-table",
  [verifyToken, csrfProtection],
  getPeopleOperationsCorporateCompanyTable
);

router.get("/adminPanel/table/:admin_id/profile", verifyToken, getAdminProfile);
router.get("/adminPanel/table", verifyToken, getAdminTable);
router.post(
  "/adminPanel/table/:admin_id/status",
  setAdminStatus
);
router.post(
  "/adminPanel/table/:admin_id/request-delete",
  requestAdminDelete
);

export default router;
