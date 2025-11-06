import express from "express"
import csrf from "csurf"
import { showOtpPage } from "../controllers/otpController.js"
import { verifyToken } from "../middlewares/verifyToken.js"

const csrfProtection = csrf({cookie: true})
const router = express.Router()

router.get('/otp',[verifyToken,csrfProtection] ,showOtpPage)


export default router