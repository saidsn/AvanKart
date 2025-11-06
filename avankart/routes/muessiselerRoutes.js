import express from "express";
import csrf from "csurf";
import mongoose from "mongoose";
import { verifyToken } from "../middlewares/verifyToken.js";
import { uploadMuessiseImages, uploadMuessiseCreationImages } from "../utils/multerConfig.js";
import { AskForDeaktiveOrAktiveMuessise,
  createRekvizit, 
  askForDeleteMuessise,
  createMuessise,
   updateMuessise, 
   getDaxiliPage,
    postDaxiliPage, 
    getMuessiseler, 
    muessiselerTable, editRekvizit,
    uploadMuqavileler,
  deleteRekvizit,
  getContracts,
  deleteContracts,
  loadDashboardData,
  muessiseTransactionsTable,
  transactionsChart,
  hesablasmaChart,
  qrChart,
  usersTable,
  selahiyyetTable,
  selahiyyetDetailTable,
  jobTable,
  jobDetailTable,
  queries,
  notifications,
  kartChart
  } from "../controllers/muessiseler.js";
  import muqavileUploadMiddleware from "../middlewares/muqavileUploadMiddleware.js";

const csrfProtection = csrf({ cookie: true });
const router = express.Router();

// Health check endpoint for MongoDB connection - no auth required
router.get('/health', (req, res) => {
  console.log('🔍 Health check called at:', new Date().toISOString());
  console.log('🔍 Mongoose default connection state:', mongoose.connection.readyState);
  console.log('🔍 Mongoose connections count:', mongoose.connections.length);

  // Check all connections
  mongoose.connections.forEach((conn, index) => {
    console.log(`🔍 Connection ${index}: state=${conn.readyState}, db=${conn.db?.databaseName || 'No DB'}`);
  });

  const connectionState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    mongooseState: connectionState,
    stateDescription: states[connectionState],
    database: mongoose.connection.db?.databaseName || 'No database',
    host: mongoose.connection.host || 'No host',
    port: mongoose.connection.port || 'No port',
    connectionsCount: mongoose.connections.length,
    allConnections: mongoose.connections.map((conn, index) => ({
      index,
      state: conn.readyState,
      database: conn.db?.databaseName || 'No DB'
    })),
    timestamp: new Date().toISOString()
  });
});

router.get('/', [verifyToken, csrfProtection], getMuessiseler);
router.post('/', [verifyToken, csrfProtection], muessiselerTable);
router.post("/create", [verifyToken, csrfProtection, uploadMuessiseCreationImages.fields([
  { name: 'xarici_cover_image', maxCount: 1 },
  { name: 'daxili_cover_image', maxCount: 1 },
  { name: 'profile_image', maxCount: 1 },
  { name: 'cover_sekil', maxCount: 1 },
  { name: 'profile_sekil', maxCount: 1 }
])], createMuessise);
router.post("/update", [verifyToken, csrfProtection, uploadMuessiseCreationImages.fields([
  { name: 'xarici_cover_image', maxCount: 1 },
  { name: 'daxili_cover_image', maxCount: 1 },
  { name: 'profile_image', maxCount: 1 },
  { name: 'cover_sekil', maxCount: 1 },
  { name: 'profile_sekil', maxCount: 1 }
])], updateMuessise);
router.post("/delete", [verifyToken, csrfProtection], askForDeleteMuessise);
router.post("/deaktiv", [verifyToken, csrfProtection], AskForDeaktiveOrAktiveMuessise);
router.post("/filter", [verifyToken, csrfProtection], postDaxiliPage);
router.post("/rekvizitler", [verifyToken,csrfProtection,createRekvizit]);
router.get("/rekvizitler/:id", [verifyToken,csrfProtection], editRekvizit);
router.delete("/rekvizitler/:id",[verifyToken,csrfProtection],deleteRekvizit);
router.post("/contracts",[verifyToken,csrfProtection],getContracts)
router.post("/muqavileler",[verifyToken,csrfProtection,muqavileUploadMiddleware("files")],uploadMuqavileler)
router.post("/contracts/delete",[verifyToken,csrfProtection],deleteContracts);
router.get("/dashboard-data", [verifyToken,csrfProtection], loadDashboardData);
router.post("/transaction",[verifyToken,csrfProtection], transactionsChart);
router.post("/transactions-table",[verifyToken,csrfProtection], muessiseTransactionsTable);
router.post("/hesablasma",[verifyToken,csrfProtection],hesablasmaChart);
router.post("/qr",[verifyToken,csrfProtection],qrChart);
router.post("/kart",[verifyToken,csrfProtection],kartChart);
router.post("/user-table",[verifyToken,csrfProtection],usersTable);
router.post("/selahiyyet-table",[verifyToken,csrfProtection], selahiyyetTable);
router.post("/selahiyyet-detail-table",[verifyToken,csrfProtection],selahiyyetDetailTable);
router.post("/job-table",[verifyToken,csrfProtection], jobTable);
router.post("/job-detail-table",[verifyToken,csrfProtection],jobDetailTable);
router.post("/sorgular",[verifyToken,csrfProtection],queries);
router.post("/notifications",[verifyToken,csrfProtection],notifications);
router.get("/:muessise_id", [verifyToken, csrfProtection], getDaxiliPage);





export default router;
