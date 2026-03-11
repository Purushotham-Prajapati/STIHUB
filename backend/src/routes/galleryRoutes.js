import express from 'express';
import multer from 'multer';
import { getGalleryItems, uploadGalleryItem, updateGalleryItem, deleteGalleryItem } from '../controllers/galleryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory for ImageKit upload

router.route('/')
    .get(getGalleryItems)
    .post(protect, upload.single('image'), uploadGalleryItem);

router.route('/:id')
    .put(protect, updateGalleryItem)
    .delete(protect, deleteGalleryItem);

export default router;
