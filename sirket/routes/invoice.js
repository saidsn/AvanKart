import { Router } from "express";
import { addInvoice, editInvoice, approveInvoice } from "../controllers/operations/invoice.js";
import { invoiceDelete, acceptDeleteInvoice } from "../controllers/operations/invoiceUpdate.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import csrf from "csurf";

const router = Router();

const csrfProtection = csrf({ cookie: true });

router.post("/", [verifyToken, csrfProtection], addInvoice);

router.post('/edit', [verifyToken, csrfProtection], editInvoice);

// Invoice təsdiqləmə route-u
router.post('/approve', [verifyToken, csrfProtection], approveInvoice);

// Invoice silmə route-ları
router.post('/delete', [verifyToken, csrfProtection], invoiceDelete);
router.post('/confirm-delete', [verifyToken, csrfProtection], acceptDeleteInvoice);

export default router;