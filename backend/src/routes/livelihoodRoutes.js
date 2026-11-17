import express from 'express';
import multer from 'multer';
import {
    getLivelihoods,
    getLivelihoodsAdmin,
    createLivelihoodItem,
    updateLivelihoodItem,
    deleteLivelihoodItem,
    reorderLivelihoodItems,
    getLivelihoodHeader,
    updateLivelihoodHeader,
} from '../controllers/livelihoodController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Section Header Routes
router.route('/header')
    .get(getLivelihoodHeader)
    .put(protect, updateLivelihoodHeader);

// Reorder Route
router.put('/reorder', protect, reorderLivelihoodItems);

// Admin Fetch Route
router.get('/admin', protect, getLivelihoodsAdmin);

// Base CRUD Routes
router.route('/')
    .get(getLivelihoods)
    .post(protect, upload.single('image'), createLivelihoodItem);

router.route('/:id')
    .put(protect, upload.single('image'), updateLivelihoodItem)
    .delete(protect, deleteLivelihoodItem);

export default router;
