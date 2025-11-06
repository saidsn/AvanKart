import express from "express";
import {
  getHome,
  getHesablashmalar,
  fag,
  getUserDuty,
} from "../controllers/mainController.js";
import csrf from "csurf";
import { alreadyLoggedIn, verifyToken } from "../middlewares/verifyToken.js";
import dashboardChartsRouter from "./dashboardChartsRouter.js";
import notificationsRoutes from "./notificationsRoutes.js";
import rbacRoutes from "./rbac/rbacRoutes.js";
import { resendOtp } from "../controllers/otp.js";
import { deleteTicket, deleteTicketPost } from "../controllers/deleteTicket.js";
import {
  checkRbacPermission,
  attachPermissionsToLocals,
} from "../../shared/utils/rbacPeopleHandler.js";

import emeliyyatRoutes from "./emeliyyatlar/emeliyyatRoutes.js";
import hovuzRoutes from "./istifadeci-hovuzu/hovuzRouter.js";
import transactionRoutes from "./transactionsRoutes.js";
import sirketlerRoutes from "./sirketlerRoutes.js";
import muessiselerRoutes from "./muessiselerRoutes.js";
import avankartProfileRoutes from "./avankartProfileRoutes.js";
import peopleApiRouter from "./api/peopleTableApiRoute.js";
import peopleUiRouter from "./istifadeci-hovuzu/people.js";
import partnerUiRouter from "./istifadeci-hovuzu/partner.js";
import cashbackRoutes from "./emeliyyatlar/avankart/cashback.js";
import kartlarRoutes from "../routes/imtiyazlar/kartlar.js";
import rozetlerRoutes from "../routes/imtiyazlar/rozetler.js";
import mukafatlarRoutes from "../routes/imtiyazlar/mukafatlar.js";
import { getMukafatlar } from "../controllers/imtiyazlar/mukafatlar.js";
import mukafatApiRouter from "./api/mukafat.js";
import auditRouter from "../routes/api/auditRouter.js";
import rekvitirRouter from "../routes/api/rekvizitRouter.js";

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
router.post("/user/duty", [verifyToken, csrfProtection], getUserDuty);

router.post("/faq", alreadyLoggedIn, fag);
router.post("/faq_auth", verifyToken, fag);

// Sub-routes
router.use("/notifications", notificationsRoutes);
router.use("/dashboardChart", dashboardChartsRouter);
router.use("/cashback", cashbackRoutes);
router.use("/rbac", rbacRoutes);

router.use("/emeliyyatlar", emeliyyatRoutes);
router.use("/hovuz", hovuzRoutes);
router.use("/transactions", transactionRoutes);
router.use("/avankart-profile", avankartProfileRoutes);
// Sirket və müəssisə route-ları
router.use("/sirketler", sirketlerRoutes);
router.use("/muessiseler", muessiselerRoutes);
// People (API + UI) route-ları
router.use("/api/people", peopleApiRouter);
router.use("/istifadeci-hovuzu/people", peopleUiRouter);
router.use("/istifadeci-hovuzu/partner", partnerUiRouter);
// API üçün həm də avankart prefix
router.use("/api/avankart/istifadeciHovuzu/people", peopleUiRouter);
router.use("/imtiyazlar/kartlar", csrfProtection, kartlarRoutes);
router.use("/imtiyazlar/rozetler", csrfProtection, rozetlerRoutes);
router.use("/imtiyazlar/mukafatlar", csrfProtection, mukafatlarRoutes);
// Serve card's internal rewards UI at /avankart/mukafatlar/:cardId
router.get(
  "/avankart/mukafatlar/:cardId",
  [verifyToken, csrfProtection],
  getMukafatlar
);
// API for mukafatlar used by frontend JS
router.use("/api/avankart/mukafatlar", mukafatApiRouter);
router.use(
  "/api/avankart/rekvizit",
  [verifyToken, csrfProtection],
  rekvitirRouter
);
router.use("/api/avankart/audit", [verifyToken, csrfProtection], auditRouter);
export default router;
