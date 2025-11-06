import { Router } from "express";
import { balanceOperationsTemp } from "../controllers/operations/balanceOperationsTemp.js";
import { getBalanceInside,postBalanceInside } from "../controllers/operations/balanceOperations.js";
import csrf from "csurf";
import { verifyToken } from "../middlewares/verifyToken.js";


const router = Router();
const csrfProtection = csrf({ cookie: true });

router.get("/:balance_id", [verifyToken, csrfProtection], getBalanceInside);
router.post("/table", [verifyToken, csrfProtection], postBalanceInside);

export default router;
