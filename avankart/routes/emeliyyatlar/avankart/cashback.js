import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../../middlewares/verifyToken.js";
import { getCardCategories, getCashback,getCashbackDetails, getCashbackDetailsPost, getCashbackPost } from "../../../controllers/emeliyyatlar/avankart/cashback.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get('/', [verifyToken, csrfProtection], getCashback);
router.get('/:folder_id', [verifyToken, csrfProtection], getCashbackDetails);
router.post('/cashback', getCashbackPost);
router.post('/cashback/:folder_id', getCashbackDetailsPost);
router.get('/card-categories', getCardCategories);

export default router;