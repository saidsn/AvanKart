import express from "express";
import sirketRoutes from "./sirket/hesablasma.js";
import qaimeRoutes from "./sirket/eqaime.js";
import muessiseRoutes from "./muessise/hesablasma.js";
import cashbackRoutes from "./avankart/cashback.js";
import mukafatRoutes from "./avankart/mukafat.js";
import sirketiscilerRouter from "./sirket/sirketIscilerRouter.js";

const router = express.Router();

router.use("/sirket/hesablasma", sirketRoutes);
router.use("/sirket/isciler", sirketiscilerRouter);
router.use("/sirket/eqaime", qaimeRoutes);

router.use("/muessise/hesablasma", muessiseRoutes);
router.use("/avankart/cashback", cashbackRoutes);
router.use("/avankart/mukafat", mukafatRoutes);

export default router;
