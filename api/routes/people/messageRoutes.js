import express from "express";
import {
  ticketMessages,
  sendMessage,
} from "../../controllers/people/messages.js";
import { isAuthenticated } from "../../middlewares/people/authMiddleware.js";

const router = express.Router();

router.get("/:ticket_id", isAuthenticated, ticketMessages);

router.post("/send", isAuthenticated, sendMessage);

export default router;
