import express from "express";
const router = express.Router();
import { body, param } from "express-validator";
import csrf from "csurf";

// Import controller
import sirketIscilerController from "../../../controllers/emeliyyatlar/sirket/sirketIscilerController.js";

// Authentication middleware (əgər mövcud deyilsə)
const authMiddleware = (req, res, next) => {
  // Burada authentication yoxlanılacaq
  // Hal-hazırda dummy user
  req.user = req.user || {
    id: "user-1",
    name: "Test User",
    role: "admin",
  };
  next();
};

// CSRF protection
const csrfProtection = csrf({ cookie: true });

// Routes

// 1. Ana səhifə - Şirkətlərin siyahısı
router.get(
  "/",
  authMiddleware,
  csrfProtection,
  sirketIscilerController.showIscilerPage
);

// 2. Şirkətlərin data-sı (DataTables üçün)
router.post(
  "/data",
  authMiddleware,
  csrfProtection,
  [
    body("draw").optional().isInt({ min: 1 }),
    body("start").optional().isInt({ min: 0 }),
    body("length").optional().isInt({ min: 1, max: 100 }),
    body("minAmount").optional().isFloat({ min: 0 }),
    body("maxAmount").optional().isFloat({ min: 0 }),
    body("minCardCount").optional().isInt({ min: 0 }),
    body("maxCardCount").optional().isInt({ min: 0 }),
    body("startDate").optional().isISO8601(),
    body("endDate").optional().isISO8601(),
    body("status").optional().isArray(),
    body("status.*").optional().isIn(["active", "pending", "completed"]),
  ],
  sirketIscilerController.getCompaniesData
);

// 3. Şirkətin kartları səhifəsi
router.get(
  "/:companyId",
  [authMiddleware,
  csrfProtection,
  param("companyId").isString().trim().escape()],
  sirketIscilerController.showCompanyCardsPage
);

// 4. Şirkət kartlarının data-sı
router.post(
  "/:companyId/data",
  authMiddleware,
  csrfProtection,
  [
    body("draw").optional().isInt({ min: 1 }),
    body("start").optional().isInt({ min: 0 }),
    body("length").optional().isInt({ min: 1, max: 100 }),
    body("minEmployeeCount").optional().isInt({ min: 0 }),
    body("maxEmployeeCount").optional().isInt({ min: 0 }),
    body("minAmount").optional().isFloat({ min: 0 }),
    body("maxAmount").optional().isFloat({ min: 0 }),
    body("startDate").optional().isISO8601(),
    body("endDate").optional().isISO8601(),
  ],
  sirketIscilerController.getCompanyCardsData
);

// 5. Kartın işçiləri səhifəsi
router.get(
  "/:companyId/:cardId",
  authMiddleware,
  csrfProtection,
  [param("cardId").isString().trim().escape()],
  sirketIscilerController.showCardEmployeesPage
);

// 6. Kart işçilərinin data-sı
router.post(
  "/:companyId/:cardId/data",
  authMiddleware,
  csrfProtection,
  [
    body("draw").optional().isInt({ min: 1 }),
    body("start").optional().isInt({ min: 0 }),
    body("length").optional().isInt({ min: 1, max: 100 }),
    body("positionGroup").optional().isIn(["manager", "staff", "supervisor"]),
    body("minAmount").optional().isFloat({ min: 0 }),
    body("maxAmount").optional().isFloat({ min: 0 }),
    body("startDate").optional().isISO8601(),
    body("endDate").optional().isISO8601(),
  ],
  sirketIscilerController.getCardEmployeesData
);

export default router;
