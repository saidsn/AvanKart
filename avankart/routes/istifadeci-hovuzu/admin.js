import express from "express";
import csrf from "csurf";
import {
  getAdmin,
  getAdminInside,
  getAdminTable,
} from "../../controllers/istifadeci-hovuzu/admin.js";
import { verifyToken } from "../../middlewares/verifyToken.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/", [verifyToken, csrfProtection], getAdmin);

router.get("/:admin_id", [verifyToken, csrfProtection], getAdminInside);

export default router;
