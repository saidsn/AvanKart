import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import csrf from "csurf";
import {
  getHistoryDetails,
  getSirketPageInfo,
  sirketInfo,
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
  showImtiyaz,
  getPermissionDetails,
  editPermissionDefaultName,
  editPermissionFull,
  deletePermission,
  deletePermissionUser,
  addPermissionUser,
  getDefaultPermissionUsers,
} from "../controllers/rbac/rbacController.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/", [verifyToken, csrfProtection], sirketInfo);

router.get(
  "/get-muessise-info",
  [verifyToken, csrfProtection],
  getSirketPageInfo
);

router.post(
  "/add-user",
  [validateAddUser, verifyToken, csrfProtection],
  addUser
);

router.post(
  "/accept-add-user",
  [verifyToken, csrfProtection],
  acceptAddedUser
);

router.post("/users", [verifyToken, csrfProtection], showUsers);
router.post(
  "/edit-user",
  [validateEditUser, verifyToken, csrfProtection],
  editUser
);

router.post(
  "/accept-edit-user",
  [verifyToken, csrfProtection],
  acceptEditUser
);

router.post(
  "/delete-user",
  [validateDeleteUser, verifyToken, csrfProtection],
  deleteUser
);
router.post(
  "/accept-delete-user",
  [verifyToken, csrfProtection],
  acceptDeleteUser
);

router.post(
  "/edit-info",
  [
    verifyToken,
    uploadMuessiseImages.fields([
      { name: "profile_image", maxCount: 1 },
    ]),
    csrfProtection,
    validateMuessiseInfo,
  ],
  editMuessiseInfo
);

router.post(
  "/muessise-muqavile",
  [verifyToken, csrfProtection],
  muessiseMuqavile
);
router.post(
  "/filter-muessise-muqavile",
  [verifyToken, csrfProtection],
  filterMuessiseMuqavile
);
router.post(
  "/show-history-table",
  [verifyToken, csrfProtection],
  showHistoryTable
);
router.post(
  "/show-permissions",
  [verifyToken, csrfProtection],
  showPermissions
);

router.post(
  "/show-imtiyaz",
  [verifyToken, csrfProtection],
  showImtiyaz
);

router.post(
  "/get-permission-details",
  [verifyToken, csrfProtection],
  getPermissionDetails
);
router.post(
  "/edit-permission-default-name",
  [verifyToken, csrfProtection],
  editPermissionDefaultName
);
router.post(
  "/edit-permission-full",
  [verifyToken, csrfProtection],
  editPermissionFull
);
router.post(
  "/delete-permission",
  [verifyToken, csrfProtection],
  deletePermission
);

router.post(
  "/history-details",
  [verifyToken, csrfProtection],
  getHistoryDetails
);
// delete permission users
router.delete('/permission/:permissionId/user/:userId',  [verifyToken, csrfProtection], deletePermissionUser);
// add permission users
router.post('/permissions/add-users',  [verifyToken, csrfProtection], addPermissionUser);
router.post('/permissions/get-defaultPerm-users',  [verifyToken, csrfProtection], getDefaultPermissionUsers);

export default router;
