import express from 'express';
import multer from 'multer';
import { getSliderItems, createSliderItem, deleteSliderItem, reorderSliderItems } from '../controllers/sliderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .get(getSliderItems)
    .post(protect, upload.single('image'), createSliderItem);

router.put('/reorder', protect, reorderSliderItems);

router.route('/:id')
    .delete(protect, deleteSliderItem);

export default router;
