import express from "express";
import csrf from "csurf";
import { verifyToken } from "../../middlewares/verifyToken.js";
import {
  getCards,
  getTotalCardCount,
  getCardsData,
  getCardData,
  getCardConditions,
  getCardUsers,
  createCardCondition,
  updateCardCondition,
  deleteCardCondition,
  createCard,
  updateCardStatus,
  getCategories,
  getIcons,
  updateCard,
  getCardFormattedData,
  respondToRequestCard,
  updateCardBalanceStatus,
  getDataForAcceptionPopup,
} from "../../controllers/imtiyazlar/kartlar.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get("/", [verifyToken, csrfProtection], getCards);
router.get("/icons", [verifyToken, csrfProtection], getIcons);
router.get("/card-categories", [verifyToken, csrfProtection], getCategories);
router.get("/count", [verifyToken, csrfProtection], getTotalCardCount);
router.get("/formatted-data", [verifyToken, csrfProtection], getCardsData);
router.post("/create-card", [verifyToken, csrfProtection], createCard);
router.put("/update-card/:id", [verifyToken, csrfProtection], updateCard);
router.put("/:id/status", [verifyToken, csrfProtection], updateCardStatus);
router.get("/:kartId", [verifyToken, csrfProtection], getCardData);
router.get(
  "/card-data/:kartId",
  [verifyToken, csrfProtection],
  getCardFormattedData
);
router.get(
  "/:kartId/conditions",
  [verifyToken, csrfProtection],
  getCardConditions
);
router.get("/:kartId/users", [verifyToken, csrfProtection], getCardUsers);
router.post(
  "/:kartId/conditions",
  [verifyToken, csrfProtection],
  createCardCondition
);
router.get(
  "/:id/acception-popup",
  [verifyToken, csrfProtection],
  getDataForAcceptionPopup
);
router.put(
  "/card-conditions/:conditionId",
  [verifyToken, csrfProtection],
  updateCardCondition
);
router.delete(
  "/card-conditions/:conditionId",
  [verifyToken, csrfProtection],
  deleteCardCondition
);

router.post(
  "/:requestId/respond-request",
  [verifyToken, csrfProtection],
  respondToRequestCard
);

router.put(
  "/:balanceId/update-status",
  [verifyToken, csrfProtection],
  updateCardBalanceStatus
);

export default router;
