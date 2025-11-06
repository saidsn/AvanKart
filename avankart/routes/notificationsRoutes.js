import express from "express";
import csrf from "csurf";
import { notificationsPersonalTable, notificationsPage, setas } from "../controllers/notifications.js";
import { verifyToken } from "../middlewares/verifyToken.js"

const csrfProtection = csrf({ cookie: true })
const router = express.Router()

router.get("/", [verifyToken, csrfProtection], notificationsPage);
router.post("/personal-table", [verifyToken, csrfProtection], notificationsPersonalTable);
router.post("/setas", [verifyToken, csrfProtection], setas);

export default router;
