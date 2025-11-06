import express from "express";
import { isAuthenticated } from "../middlewares/people/authMiddleware.js";
import { getIcon } from "../controllers/icon.js";

const router = express.Router();

router.get("/:icon", getIcon);

export default router;
