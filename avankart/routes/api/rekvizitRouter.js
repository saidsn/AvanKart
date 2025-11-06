import express from "express";
import {
  createRekvizit,
  getRekvizitler,
  getRekvizitById,
  updateRekvizit,
  deleteRekvizit,
} from "../../controllers/api/rekvizitController.js";

const router = express.Router();

// Create new rekvizit
router.post("/", createRekvizit);

// Get all rekvizitler
router.get("/", getRekvizitler);

// Get single rekvizit by ID
router.get("/:id", getRekvizitById);

// Update rekvizit
router.put("/:id", updateRekvizit);

// Delete rekvizit
router.delete("/:id", deleteRekvizit);

export default router;
