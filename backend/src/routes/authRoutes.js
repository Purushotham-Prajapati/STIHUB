import express from 'express';
import { authAdmin, logoutAdmin, checkAuth } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', authAdmin);
router.post('/logout', logoutAdmin);
router.get('/check', protect, checkAuth);

export default router;
