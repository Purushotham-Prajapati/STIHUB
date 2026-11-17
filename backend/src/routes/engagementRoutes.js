import express from 'express';
import multer from 'multer';
import { getEngagementCards, createEngagementCard, updateEngagementCard, deleteEngagementCard } from '../controllers/engagementController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .get(getEngagementCards)
    .post(protect, upload.single('icon'), createEngagementCard);

router.route('/:id')
    .put(protect, updateEngagementCard)
    .delete(protect, deleteEngagementCard);

export default router;
