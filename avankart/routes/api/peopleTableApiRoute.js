import express from "express";
import { peopleTableApi } from "../../controllers/avankart/peopleTableApi.js";
import { getPeopleInsideDetail } from "../../controllers/avankart/peopleInsideController.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { deactivatePeopleUser, activatePeopleUser, requestDeletePeopleUser, getAllCards, getUserRozets, getRozetCategories, getUserMukafatlar, cashbackChart, addedBalancesChart, transactionsChart, getAllCompanies, getAllMuessiseler, getAllSorgular, checkUserCardsStatus, getAllRequestsByUser, getDeactivateReasons, deactiveUserCard, acceptDeactiveUserCard, getUserActivationSummary, activateUserCard, confirmActivateUserCard, getUserRequestCards } from "../../controllers/avankart/peopleActionsController.js";
import { peopleCompaniesListApi } from "../../controllers/avankart/peopleCompaniesListApi.js";

const router = express.Router();

// NOTE: Global csrfProtection already wrapped via app.js -> mainRoute. Avoid double CSRF middleware.
router.post("/table", [verifyToken], peopleTableApi);
router.get('/companies', [verifyToken], peopleCompaniesListApi);
// People inside detail (single GET to fetch all user + card balance data)
router.get('/:peopleId/inside', [verifyToken], getPeopleInsideDetail);
router.post('/:peopleId/deactivate', [verifyToken], deactivatePeopleUser);
router.post('/:peopleId/activate', [verifyToken], activatePeopleUser);
router.post('/:peopleId/delete-request', [verifyToken], requestDeletePeopleUser);

//Imtiyaz kartlari section
router.post("/imtiyaz-cards",[verifyToken],getAllCards);
router.post("/usercard-status/:peopleId", [verifyToken], checkUserCardsStatus);

//Rozets
router.post("/rozets/:peopleId",[verifyToken],getUserRozets);
router.get("/rozets/rozet-categories",[verifyToken],getRozetCategories);

//Mukafatlar
router.post("/mukafat/:peopleId",[verifyToken],getUserMukafatlar);

//Charts
router.post("/cashbacks/:peopleId",[verifyToken],cashbackChart);
router.post("/addedbalances/:peopleId",[verifyToken],addedBalancesChart);
router.post("/xerclenenbalance/:peopleId",[verifyToken],transactionsChart);

//others for filter and etc.
router.get("/companies",[verifyToken],getAllCompanies);
router.get("/muessiseler", [verifyToken], getAllMuessiseler);
router.post("/requests/:peopleId", getAllRequestsByUser);
router.get("/requests/:cardId/reasons/:peopleId", getDeactivateReasons);
router.post("/send-deactivate-otp", deactiveUserCard);
router.post("/accept-deactivate-otp", acceptDeactiveUserCard);
router.post("/:peopleId/user-active-summary/:cardId", getUserActivationSummary);

router.post("/activate-user-card", activateUserCard);
router.post("/confirm-activate-user-card", confirmActivateUserCard);
router.post("/user-requests/:peopleId", getUserRequestCards);

//sorgular
router.post("/sorgular/:peopleId",[verifyToken],getAllSorgular);

export default router;
