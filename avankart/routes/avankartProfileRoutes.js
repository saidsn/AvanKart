import express from "express";
import csrf from "csurf";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getProfile } from "../controllers/avankartProfile.js";
import {
  getAvankartUsers,
  getAvankartUser,
  updateAvankartUser,
  deleteAvankartUser,
  listDuties,
  getDutiesTable,
  listAdminPermissionGroups,
  getPermissionTypes,
  getAdminPermissionGroupsTable,
  createAvankartUser,
  verifyAvankartUserOtp,
  resendAvankartUserOtp,
} from "../controllers/avankart/avankartProfileController.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/", [verifyToken, csrfProtection], getProfile);
router.get("/api/users", verifyToken, getAvankartUsers);
router.get("/api/users/:id", verifyToken, getAvankartUser);
router.post("/api/users", verifyToken, createAvankartUser);
router.post("/api/users/:id/verify-otp", verifyToken, verifyAvankartUserOtp);
router.post("/api/users/:id/resend-otp", verifyToken, resendAvankartUserOtp);
router.put("/api/users/:id", verifyToken, updateAvankartUser);
router.delete("/api/users/:id", verifyToken, deleteAvankartUser);
router.get("/api/duties", verifyToken, listDuties);
router.get("/api/duties-table", verifyToken, getDutiesTable);
router.get("/api/permission-groups", verifyToken, listAdminPermissionGroups);
router.get("/api/permission-types", verifyToken, getPermissionTypes);
router.get(
  "/api/permission-groups-table",
  verifyToken,
  getAdminPermissionGroupsTable
);

export default router;
