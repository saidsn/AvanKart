import express from "express"
import { isAuthenticated } from "../../middlewares/people/authMiddleware.js";
import { getNotification, updateNotificationStatus, handleInviteAction } from "../../controllers/people/notificationController.js";
import { validateInviteAction } from "../../middlewares/people/notificationMiddleware.js";

const router = express.Router()

router.get("/", isAuthenticated, getNotification)
router.post("/status", isAuthenticated, updateNotificationStatus)
router.post("/invite-action", [isAuthenticated, validateInviteAction], handleInviteAction)

export default router;