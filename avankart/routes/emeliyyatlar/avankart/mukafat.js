import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../../middlewares/verifyToken.js";
import {
  getMukafat,
  getMukafatDetails,
  createMukafatFolder,
  createMukafat,
  apiGetMukafatFolders,
  apiGetMukafatDetails,
  apiGetCards,
} from "../../../controllers/emeliyyatlar/avankart/mukafat.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

// 🔹 EJS səhifələr (CSRF aktiv)
router.get("/", [verifyToken, csrfProtection], getMukafat);
router.get("/:folder_id", [verifyToken, csrfProtection], getMukafatDetails);

// 🔹 Form POST-lar (EJS üçün CSRF)
router.post("/create", [verifyToken, csrfProtection], createMukafat);

// 🔹 API endpoints (CSRF yoxlaması yoxdur)
router.post("/create-folder", verifyToken, createMukafatFolder);
router.get("/api/folders", verifyToken, apiGetMukafatFolders);
router.get("/api/cards", verifyToken, apiGetCards);
router.get(
  "/api/folders/:folder_id/details",
  verifyToken,
  apiGetMukafatDetails
);

export default router;
