import { Router } from "express";
import { isAuthenticated } from "../../middlewares/people/authMiddleware.js";
import { myCards, getTransactions, getTransactionDetails, getAllCards } from "../../controllers/people/cards.js";

const router = Router();

router.post('/my-cards', isAuthenticated, myCards);
router.post('/transactions', isAuthenticated, getTransactions);
router.post('/transaction-details', isAuthenticated, getTransactionDetails);
router.post('/get-all-cards', isAuthenticated, getAllCards);

export default router;