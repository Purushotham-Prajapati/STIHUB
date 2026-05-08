import express from 'express';
import { getNews, createNews, updateNews, deleteNews } from '../controllers/newsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getNews)
    .post(protect, createNews);

router.route('/:id')
    .put(protect, updateNews)
    .delete(protect, deleteNews);

export default router;
