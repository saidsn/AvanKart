import express from 'express';
import { home } from '../../controllers/people/homeController.js';
import { isAuthenticated } from '../../middlewares/people/authMiddleware.js';
import { favoriteMuessise } from '../../controllers/people/favorites.js';
import { requestChangeStatusCard } from '../../controllers/people/mycards.js';
const router = express.Router(); 

router.post('/home', isAuthenticated, home);
router.post("/favorites/muessise", isAuthenticated, favoriteMuessise);
router.post("/mycards/request-change-status", isAuthenticated, requestChangeStatusCard);

// router.post('/profile', isAuthenticated, home);

export default router;