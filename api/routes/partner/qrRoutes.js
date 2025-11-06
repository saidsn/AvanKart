import express from "express"
import { checkQrStatus, generateQr } from "../../controllers/partner/qrController.js"
import { isAuthenticated } from "../../middlewares/partner/authMiddleware.js"
import { cancelQr } from "../../controllers/partner/qrController.js";
import { body } from "express-validator";

const router  = express.Router()

router.post("/checkQr",isAuthenticated,checkQrStatus)


router.post(
    "/cancelQr",isAuthenticated,
    [
        body("code")
            .isString()
            .isLength({ min: 16, max: 16 })
            .withMessage("QR kod 16 simvol olmalıdır"),
    ],
    
    cancelQr
);

router.post("/generateQr", isAuthenticated, generateQr);

export default router;
