import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import csrf from "csurf";
import {
  getHistoryDetails,
  getMuessisePageInfo,
  muessiseInfo,
} from "../controllers/muessiseController.js";
import {
  addUser,
  deleteUser,
  acceptDeleteUser,
  editUser,
  showUsers,
  acceptAddedUser,
  acceptEditUser,
} from "../controllers/muessiseInfo/muessise.js";
import { validateAddUser } from "../middlewares/validateAddUser.js";
import { validateEditUser } from "../middlewares/validateEditUser.js";
import { validateDeleteUser } from "../middlewares/validateDeleteUser.js";
import { validateMuessiseInfo } from "../middlewares/validateMuessiseInfo.js";

import { filterMuessiseMuqavile, muessiseMuqavile } from "../controllers/muessiseInfo/tables.js";

import { editMuessiseInfo } from "../controllers/muessiseInfo/muessiseInfo.js";
import { uploadMuessiseImages } from "../utils/multerConfig.js";
import {
  showHistoryTable,
  showPermissions,
  getPermissionDetails,
  editPermissionFull,
  deletePermission,
  editPermissionName,
  deletePermissionUser,
  addPermissionUser,
} from "../controllers/rbac/rbacController.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacHandler.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get(
  "/",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("company_info_view", "read"),
  ],
  muessiseInfo
);

router.get(
  "/get-muessise-info",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("company_info_view", "read"),
  ],
  getMuessisePageInfo
);

router.post(
  "/add-user",
  [
    validateAddUser,
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("user_management", "full"),
  ],
  addUser
);

router.post(
  "/users",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("user_management", "read"),
  ],
  showUsers
);

router.post(
  "/edit-user",
  [
    validateEditUser,
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("user_management", "full"),
  ],
  editUser
);

router.post(
  "/delete-user",
  [
    validateDeleteUser,
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("user_management", "full"),
  ],
  deleteUser
);

router.post(
  "/accept-delete-user",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("user_management", "full"),
  ],
  acceptDeleteUser
);

router.post(
  "/accept-add-user",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("user_management", "full"),
  ],
  acceptAddedUser
);

router.post(
  "/accept-edit-user",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("user_management", "full"),
  ],
  acceptEditUser
);

router.post(
  "/edit-info",
  [
    verifyToken,
    csrfProtection,
    uploadMuessiseImages.fields([
      { name: "xarici_cover_image", maxCount: 1 },
      { name: "daxili_cover_image", maxCount: 1 },
      { name: "profile_image", maxCount: 1 },
    ]),
    validateMuessiseInfo,
    attachPermissionsToLocals,
    checkRbacPermission("company_info_view", "full"),
  ],
  editMuessiseInfo
);

router.post(
  "/muessise-muqavile",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("company_info_view", "read"),
  ],
  muessiseMuqavile
);
router.post(
  "/filter-muessise-muqavile",
  [verifyToken, csrfProtection, attachPermissionsToLocals],
  filterMuessiseMuqavile
);

router.post(
  "/show-history-table",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("history_view", "read"),
  ],
  showHistoryTable
);

router.post(
  "/show-permissions",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("permission_management", "read"),
  ],
  showPermissions
);

router.post(
  "/get-permission-details",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("permission_management", "read"),
  ],
  getPermissionDetails
);

router.post(
  "/edit-permission-full",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("permission_management", "full"),
  ],
  editPermissionFull
);

router.post(
  "/edit-permission-name",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("permission_management", "full"),
  ],
  editPermissionName
);
router.post(
  "/delete-permission",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("permission_management", "full"),
  ],
  deletePermission
);

router.post(
  "/history-details",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("history_view", "read"),
  ],
  getHistoryDetails
);

router.delete(
  "/permission/:permissionId/user/:userId",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("permission_management", "full"),
  ],
  deletePermissionUser
);
router.post(
  "/permissions/add-users",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("permission_management", "full"),
  ],
  addPermissionUser
);

export default router;
