import express from 'express';
import { getSections, createSection, updateSection, deleteSection } from '../controllers/sectionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getSections)
    .post(protect, createSection);

router.route('/:id')
    .put(protect, updateSection)
    .delete(protect, deleteSection);

export default router;
