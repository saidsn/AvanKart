import express from "express";
import { kartlarPage, qaimePage } from "../controllers/emeliyyatlar/qaime.js";
import csrf from "csurf";
import {verifyToken } from "../middlewares/verifyToken.js";
import { kartlarTable, qaime } from "../controllers/qaime.js";
import { ensureLastMonthQaime } from "../controllers/emeliyyatlar/qaime.js";

const router = express.Router();

const csrfProtection = csrf({ cookie: true });


router.get("/", [verifyToken, csrfProtection], qaimePage);
router.get("/:qaime_id/kartlar", [verifyToken, csrfProtection], kartlarPage);
router.post("/table", [verifyToken, csrfProtection], qaime);
router.post("/kartlar-table", [verifyToken, csrfProtection], kartlarTable);


export default router;
