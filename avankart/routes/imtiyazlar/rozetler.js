import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {createRozet, createRozetCategory, deleteRozet, deleteRozetCategory, editRozetCategoryName, getCards, getRozetCategories, getRozetCategoriesPost, getRozets, getRozetsPost, updateRozet} from "../../controllers/imtiyazlar/rozetler.js";
import fileUploadMiddleware from "../../middlewares/fileUploadMiddleware.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

// Rozet categories routes
router.get("/", [verifyToken, csrfProtection], getRozetCategories);
router.post("/", [verifyToken, csrfProtection], getRozetCategoriesPost);
router.patch("/:id", [verifyToken, csrfProtection], editRozetCategoryName);
router.delete("/delete-category/:id", [verifyToken, csrfProtection], deleteRozetCategory);
router.post("/create-category", [verifyToken, csrfProtection], createRozetCategory);

// Rozet routes
router.post("/rozet/create/:categoryId",[verifyToken, csrfProtection, fileUploadMiddleware("files")],createRozet);
router.get("/rozet/:rozetid", [verifyToken, csrfProtection], getRozets);
router.post("/rozet/:rozetid", [verifyToken, csrfProtection], getRozetsPost);
router.delete("/rozet/delete", [verifyToken, csrfProtection], deleteRozet);
router.put( "/rozet/update/:rozetId", [verifyToken, csrfProtection, fileUploadMiddleware("files")], updateRozet);
// Other routes
router.get("/cards", [verifyToken, csrfProtection], getCards);
export default router;
