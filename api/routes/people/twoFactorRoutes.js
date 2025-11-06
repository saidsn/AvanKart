import express from "express";
import {
  get2FASettings,
  initiate2FAChange,
  verify2FAChange,
} from "../../controllers/people/twoFactorController.js";
import { isAuthenticated } from "../../middlewares/people/authMiddleware.js";

const router = express.Router();

router.get("/settings", isAuthenticated, get2FASettings);

router.post("/initiate", isAuthenticated, initiate2FAChange);

router.post("/verify", isAuthenticated, verify2FAChange);

export default router;
