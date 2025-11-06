import express from "express";
import authRoutes from "./partner/authRoutes.js";
import mainRoutes from "./partner/mainRoutes.js";
import qrRoutes from "./partner/qrRoutes.js";
import { isAuthenticated } from "../middlewares/partner/authMiddleware.js";
import notificationRoutes from "./partner/notificationRoutes.js";
import profileRoutes from "./partner/profileRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/notifications", notificationRoutes);
router.use("/profile", profileRoutes);
router.use("/action", qrRoutes);
router.use("/", mainRoutes);

export default router;
