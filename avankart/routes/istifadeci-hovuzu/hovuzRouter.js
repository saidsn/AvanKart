import express from "express";
import peopleRoutes from "./people.js";
import partnerRoutes from "./partner.js";
import adminRoutes from "./admin.js";

const router = express.Router();

router.use('/people', peopleRoutes);
router.use('/partner', partnerRoutes);
router.use('/admin', adminRoutes);

export default router;