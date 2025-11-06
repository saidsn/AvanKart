import express from "express";
import {
  createDuty,
  editDuty,
  showDuties,
} from "../../controllers/rbac/rbacDuties.js";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {
  addImtiyaz,
  createPermGroup,
  editPermGroup,
  // showPermissionUsers,
  showPermUsers,
} from "../../controllers/rbac/rbacController.js";
import { editPermGroupData } from "../../controllers/rbac/rbacPermController.js";
import {
  acceptDeleteDuty,
  rbacDeleteDuty,
  rbacDeletePerm,
  acceptDeletePerm,
  acceptPermissionDelete,
} from "../../controllers/rbac/rbacDeletes.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.post("/create-duty", [verifyToken, csrfProtection], createDuty);
router.post("/createPermGroup", [verifyToken, csrfProtection], createPermGroup);
router.post("/edit-perm", [verifyToken, csrfProtection], editPermGroup);
router.post(
  "/edit-perm-data",
  [verifyToken, csrfProtection],
  editPermGroupData
);
router.post("/edit-duty", [verifyToken, csrfProtection], editDuty);
router.post(
  "/rbacDeletes/delete",
  [verifyToken, csrfProtection],
  rbacDeleteDuty
);
router.post(
  "/rbacPermission/delete",
  [
    verifyToken,
    // TODO: 401 aliram deye comment etdim
    // csrfProtection
  ],
  rbacDeletePerm
);

router.post(
  "/rbacPermission/acceptPermissionDelete",
  [verifyToken, csrfProtection],
  acceptPermissionDelete
);
router.post(
  "/rbacAccept/delete",
  [verifyToken, csrfProtection],
  acceptDeleteDuty
);
router.post(
  "/rbacPermission/acceptDelete",
  [verifyToken, csrfProtection],
  acceptDeletePerm
);
router.post("/show-duties", [verifyToken, csrfProtection], showDuties);
router.post("/showPermUsers", [verifyToken, csrfProtection], showPermUsers);
router.post("/add-imtiyaz", [verifyToken, csrfProtection], addImtiyaz);

export default router;
