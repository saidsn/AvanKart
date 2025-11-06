import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {
  getMukafatKartlar,
  getMukafatlar,
} from "../../controllers/imtiyazlar/mukafatlar.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/", [verifyToken, csrfProtection], getMukafatKartlar);
router.get("/mukafat/:mukafatid", [verifyToken, csrfProtection], getMukafatlar);

// dynamic card route: /imtiyazlar/mukafatlar/:cardId
router.get("/:cardId", [verifyToken, csrfProtection], getMukafatlar);
// dynamic card route so /imtiyazlar/mukafatlar/:cardId works
router.get("/:cardId", [verifyToken, csrfProtection], getMukafatlar);

export default router;
