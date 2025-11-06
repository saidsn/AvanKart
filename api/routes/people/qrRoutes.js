import express from "express";
import { checkQrCode, checkQrCodeStatus } from "../../controllers/people/checkQrCodeController.js";
import { isAuthenticated } from "../../middlewares/people/authMiddleware.js";
import { body } from "express-validator";

const router = express.Router();

router.post("/checkQr", isAuthenticated, checkQrCode);
router.post("/checkQrStatus", isAuthenticated, checkQrCodeStatus);


export default router;
