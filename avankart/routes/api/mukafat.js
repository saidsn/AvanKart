import express from "express";
import {
  listMukafatlar,
  getMukafat,
  createMukafat,
  updateMukafat,
  deleteMukafat,
  listByCard,
} from "../../controllers/api/mukafatController.js";

const router = express.Router();

// List all (DataTables-compatible payload supported via body.search)
router.get("/list", listMukafatlar);
router.post("/list", listMukafatlar);

// CRUD
router.get("/:id", getMukafat);
router.post("/", createMukafat);
router.put("/:id", updateMukafat);
router.delete("/:id", deleteMukafat);

// List by card
router.get("/card/:cardId", listByCard);

export default router;
