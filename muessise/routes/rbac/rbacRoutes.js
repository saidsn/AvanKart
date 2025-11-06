import express from "express";
import {
  createDuty,
  editDuty,
  showDuties,
} from "../../controllers/rbac/rbacDuties.js";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {
  createPermGroup,
  editPermGroup,
  getDefaultPermissionDetails,
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
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../../shared/utils/rbacHandler.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.post(
  "/create-duty",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  createDuty
);
router.post(
  "/createPermGroup",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  createPermGroup
);
router.post(
  "/edit-perm",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  editPermGroup
);
router.post(
  "/edit-perm-data",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  editPermGroupData
);
router.post(
  "/edit-duty",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  editDuty
);
router.post(
  "/rbacDeletes/delete",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  rbacDeleteDuty
);
router.post(
  "/rbacPermission/delete",
  [
    verifyToken,
    // TODO: 401 aliram deye comment etdim
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  rbacDeletePerm
);

router.post(
  "/rbacPermission/acceptPermissionDelete",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  acceptPermissionDelete
);
router.post(
  "/rbacAccept/delete",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  acceptDeleteDuty
);
router.post(
  "/rbacPermission/acceptDelete",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "full"),
  ],
  acceptDeletePerm
);
router.post(
  "/show-duties",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "read"),
  ],
  showDuties
);
router.post(
  "/showPermUsers",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "read"),
  ],
  showPermUsers
);
router.post(
  "/defaultPermUsers",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("rbac_management", "read"),
  ],
  getDefaultPermissionDetails
);

export default router;
