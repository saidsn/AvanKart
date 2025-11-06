import express from "express";
import {getMuessises, getMuessiseDetails, getFavoriteMuessises} from "../../controllers/people/muessises.js";
import { isAuthenticated } from "../../middlewares/people/authMiddleware.js";

const router = express.Router();

router.post("/", isAuthenticated,getMuessises);
router.post("/favorites", isAuthenticated, getFavoriteMuessises);
router.post("/details", isAuthenticated, getMuessiseDetails);

export default router;
