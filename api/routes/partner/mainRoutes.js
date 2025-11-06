import express from 'express';
import { home } from '../../controllers/partner/homeController.js';
import { isAuthenticated } from '../../middlewares/partner/authMiddleware.js';

const router = express.Router(); 

router.post('/home', isAuthenticated, home);
// router.post('/profile', isAuthenticated, home);

export default router;