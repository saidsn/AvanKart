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
import avankartPeopleRoutes from "./avankartPeopleRoutes.js";
import invoiceRoutes from "./invoice.js";
import { resendOtp } from "../controllers/otp.js";
import { deleteTicket, deleteTicketPost } from "../controllers/deleteTicket.js";
import { invoiceDelete } from "../controllers/operations/invoiceUpdate.js";
import balanceRoutes from "./balance.js";
import balancesRoutes from "./balances.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacPeopleHandler.js";

const router = express.Router();

const csrfProtection = csrf({ cookie: true });

router.get(
  "/",
  [
    verifyToken,
    csrfProtection,
    checkRbacPermission("dashboard_view", "read"),
    attachPermissionsToLocals,
  ],
  getHome
);

// terms no rbac
router.get("/terms", (req, res) =>
  res.render("terms", { layout: "./layouts/auth.ejs" })
);

// Otp no rbac
router.post("/resend-otp", [verifyToken, csrfProtection], resendOtp);

// ticket no rbac
router.get("/delete-ticket", csrfProtection, deleteTicket);
router.post("/delete-ticket-post", csrfProtection, deleteTicketPost);

// Invoice operations
router.post("/invoice-delete", [verifyToken, csrfProtection], invoiceDelete);

router.post("/user/duty", [verifyToken, csrfProtection], getUserDuty);

router.post("/faq", alreadyLoggedIn, fag);
router.post("/faq_auth", verifyToken, fag);

// Sub-routes
router.use("/sorgular", sorgularRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/dashboardChart", dashboardChartsRouter);
router.use("/hesablashmalar", hesablasmalarRoutes);
router.use("/people", avankartPeopleRoutes);
router.use("/invoice", invoiceRoutes);
router.use("/people", balanceRoutes);
router.use("/balances", balancesRoutes);

router.use("/rbac", rbacRoutes);

export default router;
