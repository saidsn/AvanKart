import express from "express";
import csrf from "csurf";
import {
  getPartner,
  getPartnerData,
  getPartnerCounts,
  getFilterOptions,
  getPartnerDetails,
  getPartnerWorkingHistory,
  getPartnerWorkplaceFilterOptions,
  getPartnerWorkplaceStats,
  getPartnerWorkplaceTransactions,
  getPartnerTransactionFilterOptions,
  sendActivateOTP,
  verifyActivateOTP,
  sendDeactivateOTP,
  verifyDeactivateOTP,
  sendDeleteOTP,
  verifyDeleteOTP,
  getCurrentUserEmail,
  requestDeletePartner,
  confirmDeletePartner,
  togglePartnerStatus,
  getPartnerTicketsData,
  getPartnerTicketDetail,
  getAvailableUsersForAssignment,
  assignUserToTicket,
  uploadTicketFiles,
  downloadTicketFile,
  updateTicket,
  deleteTicketFile,
  deleteTicket,
} from "../../controllers/istifadeci-hovuzu/partner.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import fileUploadMiddleware from "../../../api/middlewares/fileUploadMiddleware.js";
import ticketFileUploadMiddleware from "../../middlewares/ticketFileUploadMiddleware.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();
// Ticket routes for partner - must be before /:id route
router.post("/:partner_id/tickets/data", [verifyToken, csrfProtection], getPartnerTicketsData);
router.get("/:partner_id/tickets/:ticket_id", [verifyToken, csrfProtection], getPartnerTicketDetail);
router.get("/:partner_id/tickets/:ticket_id/available-users", [verifyToken], getAvailableUsersForAssignment);
router.patch("/:partner_id/tickets/:ticket_id/assign", [verifyToken], assignUserToTicket);
router.patch("/:partner_id/tickets/:ticket_id", [verifyToken], updateTicket);
router.delete("/:partner_id/tickets/:ticket_id", [verifyToken], deleteTicket);
router.post("/:partner_id/tickets/:ticket_id/upload", [verifyToken, ...ticketFileUploadMiddleware("files")], uploadTicketFiles);
router.get("/tickets/files/:file_id/download", [verifyToken], downloadTicketFile);
router.delete("/tickets/files/:file_id", [verifyToken], deleteTicketFile);

router.get("/", [verifyToken, csrfProtection], getPartner);
router.post("/data", [verifyToken], getPartnerData);
router.get("/counts", [verifyToken], getPartnerCounts);
router.get("/filter-options", [verifyToken], getFilterOptions);
router.get("/current-user-email", [verifyToken], getCurrentUserEmail);

// Separate OTP endpoints for each action
router.post("/send-activate-otp", [verifyToken], sendActivateOTP);
router.post("/verify-activate-otp", [verifyToken], verifyActivateOTP);
router.post("/send-deactivate-otp", [verifyToken], sendDeactivateOTP);
router.post("/verify-deactivate-otp", [verifyToken], verifyDeactivateOTP);
router.post("/send-delete-otp", [verifyToken], sendDeleteOTP);
router.post("/verify-delete-otp", [verifyToken], verifyDeleteOTP);

// Important: Keep specific routes BEFORE parameterized routes

router.post("/:id/working-history", [verifyToken], getPartnerWorkingHistory);
router.post(
  "/:id/workplace-filter-options",
  [verifyToken],
  getPartnerWorkplaceFilterOptions
);
router.post(
  "/:id/workplace-stats/:muessiseId",
  [verifyToken],
  getPartnerWorkplaceStats
);
router.post(
  "/:id/workplace-transactions/:workplaceId",
  [verifyToken],
  getPartnerWorkplaceTransactions
);
router.get(
  "/:id/transaction-filter-options/:muessiseId?",
  [verifyToken],
  getPartnerTransactionFilterOptions
);

// router.get(
//   "/:id/sorgular",
//   [verifyToken],
//   // getPartnerTransactionFilterOptions
// );

router.post(
  "/workplace-transactions",
  [verifyToken],
  getPartnerWorkplaceTransactions
);
router.post(
  "/workplace-filter-options",
  [verifyToken],
  getPartnerWorkplaceFilterOptions
);

// Delete request routes
router.post("/:id/delete/request", [verifyToken], requestDeletePartner);
router.post("/:id/delete/confirm", [verifyToken], confirmDeletePartner);

// Status toggle route
router.patch("/:id/status", [verifyToken], togglePartnerStatus);

router.get("/:id", [verifyToken, csrfProtection], getPartnerDetails);
// router.get('/:id/qr-history', [verifyToken], getPartnerQrHistory);

export default router;
