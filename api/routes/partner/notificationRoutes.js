import express from "express"
import { isAuthenticated } from "../../middlewares/partner/authMiddleware.js";
import { getNotification, updateNotificationStatus, handleInviteAction } from "../../controllers/partner/notificationController.js";
import { validateInviteAction } from "../../middlewares/partner/notificationMiddleware.js";

const router = express.Router()

router.get("/", isAuthenticated, getNotification)
router.post("/status", isAuthenticated, updateNotificationStatus)
router.post("/invite-action", [isAuthenticated, validateInviteAction], handleInviteAction)

export default router;