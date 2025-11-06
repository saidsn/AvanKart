import { Router } from "express";
import { balanceOperationsTemp } from "../controllers/operations/balanceOperationsTemp.js";
import {
  addBalanceByImtiyazGroup,
  confirmBalanceByImtiyazGroup,
} from "../controllers/operations/balanceOperations.js";
import csrf from "csurf";
import { verifyToken } from "../middlewares/verifyToken.js";
import {editBalanceOperation} from "../controllers/operations/balanceOperationsTemp.js"

const router = Router();
const csrfProtection = csrf({ cookie: true });

router.post(
  "/add-balance",
  [verifyToken, csrfProtection],
  balanceOperationsTemp
);

router.post(
  "/edit-balance",
  [verifyToken, csrfProtection],
  editBalanceOperation
);
// İmtiyaz qrupuna görə balans əlavə etmə
router.post(
  "/add-balance-by-imtiyaz",
  [verifyToken, csrfProtection],
  addBalanceByImtiyazGroup
);

// İmtiyaz qrupu balans əməliyyatını OTP ilə təsdiqləmə
router.post(
  "/confirm-balance-by-imtiyaz",
  [verifyToken, csrfProtection],
  confirmBalanceByImtiyazGroup
);

export default router;
