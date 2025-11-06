import express from "express";
import authRoutes from "./people/authRoutes.js";
import mainRoutes from "./people/mainRoutes.js";
import qrRoutes from "./people/qrRoutes.js";
import notificationRoutes from "./people/notificationRoutes.js";
import profileRoutes from "./people/profileRoutes.js";
import sorguRoutes from "./people/sorguRoutes.js";
import muessiseRoutes from "./people/muessiseRoutes.js";
import cardsRoutes from "./people/cardsRoutes.js";
import twoFactorRoutes from "./people/twoFactorRoutes.js";
import messageRoutes from "./people/messageRoutes.js";
import { isAuthenticated } from "../middlewares/people/authMiddleware.js";
import { getUzvluk, getUzvlukDetails } from "../controllers/people/uzvluk.js";
import { getOnMap } from "../controllers/people/map.js";
import { excelExport } from "../controllers/people/exportExcel.js";
import {
  leaveMembership,
  acceptLeaveMembership,
} from "../controllers/people/leaveMembership.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/profile", profileRoutes);
router.use("/action", qrRoutes);
router.use("/sorgu", sorguRoutes);
router.use("/muessise", muessiseRoutes);
router.use("/cards", cardsRoutes);
router.use("/2fa", twoFactorRoutes);
router.use("/messages", messageRoutes);
router.use("/", mainRoutes);

// TODO: We need uzvlukRoutes
router.post("/uzvluk", isAuthenticated, getUzvluk);
router.get("/uzvluk/:sirket_id/details", isAuthenticated, getUzvlukDetails);
router.post("/get-on-map", isAuthenticated, getOnMap);
router.post("/excel-export", isAuthenticated, excelExport);

// Leave Membership endpoints
router.post("/leave-membership", isAuthenticated, leaveMembership);
router.post("/accept-leave-membership", isAuthenticated, acceptLeaveMembership);
export default router;
