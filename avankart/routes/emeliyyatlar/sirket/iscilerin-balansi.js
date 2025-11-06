// routes/emeliyyatlar/sirket/iscilerin-balansi.js
import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../../middlewares/verifyToken.js";
import {
  getIscilerinBalansi,
  iscilerinBalansiList,
  iscilerinBalansiFolderByMonth,
} from "../../../controllers/emeliyyatlar/sirket/iscilerin-balansi.js";

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.use((req, res, next) => {
  console.log(`[ISCILERIN BALANSI ROUTER] ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/", [verifyToken], getIscilerinBalansi);
router.post("/", [verifyToken], iscilerinBalansiList);
router.post(
  "/api/iscilerin-balansi/folder/:companyId/:year/:month",
  [verifyToken],
  iscilerinBalansiFolderByMonth
);

export default router;
