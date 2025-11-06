import express from "express";
const router = express.Router();

// Import routers
import sirketIscilerRouter from "./emeliyyatlar/sirket/sirketIscilerRouter.js";

// Routes

// Şirkət İşçiləri router
router.use("/sirket", sirketIscilerRouter);

export default router;
