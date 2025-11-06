import express from "express";
import {
  getHome,
  getHesablashmalar,
  fag,
  getUserDuty,
} from "../controllers/mainController.js";
import csrf from "csurf";
import { alreadyLoggedIn, verifyToken } from "../middlewares/verifyToken.js";
import sorgularRoutes from "./sorgularRouter.js";
import dashboardChartsRouter from "./dashboardChartsRouter.js";
import notificationsRoutes from "./notificationsRoutes.js";
import hesablasmalarRoutes from "./hesablashmalar.js";
import rbacRoutes from "./rbac/rbacRoutes.js";
import avankartPartnerRoutes from "./avankartPartnerRoutes.js";
import { resendOtp } from "../controllers/otp.js";
import { deleteTicket, deleteTicketPost } from "../controllers/deleteTicket.js";

import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacHandler.js";

const router = express.Router();

const csrfProtection = csrf({ cookie: true });

router.get(
  "/",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("dashboard_view", "read"),
  ],
  getHome
);

router.get(
  "/hesablashmalar",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("hesablashmalar_view", "read"),
  ],
  getHesablashmalar
);

router.get("/terms", (req, res) =>
  res.render("terms", { layout: "./layouts/auth.ejs" })
);

router.post("/resend-otp", [verifyToken, csrfProtection], resendOtp);

router.get("/delete-ticket", csrfProtection, deleteTicket);
router.post("/delete-ticket-post", csrfProtection, deleteTicketPost);
router.post(
  "/user/duty",
  [
    verifyToken,
    csrfProtection,
    attachPermissionsToLocals,
    checkRbacPermission("user_management", "read"),
  ],
  getUserDuty
);

router.post("/faq", alreadyLoggedIn, fag);
router.post("/faq_auth", verifyToken, fag);

router.use("/sorgular", sorgularRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/charts", dashboardChartsRouter);
router.use("/hesablashmalar", hesablasmalarRoutes);
router.use("/partner", avankartPartnerRoutes);

router.use("/rbac", rbacRoutes);

export default router;
