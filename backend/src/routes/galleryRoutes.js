import express from 'express';
import multer from 'multer';
import {
    getGalleryItems,
    uploadGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    uploadChunk,
    finalizeUpload,
    getUploadStatus,
    cancelUpload,
    addVideoByUrl,
    getGoogleAuthUrl,
    googleOAuthCallback,
    getGoogleDriveStatus,
    streamGoogleDriveVideo,
} from '../controllers/galleryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Resumable chunked upload endpoints
router.post('/upload-chunk', protect, upload.single('chunk'), uploadChunk);
router.post('/finalize-upload', protect, finalizeUpload);
router.get('/upload-status/:uploadId', protect, getUploadStatus);
router.post('/cancel-upload/:uploadId', protect, cancelUpload);
router.post('/video-link', protect, addVideoByUrl);

// Google Drive video streaming (Public, HTTP 206 Partial Content)
router.get('/stream-drive/:fileId', streamGoogleDriveVideo);

// Google Drive OAuth & status routes
router.get('/google-auth-url', getGoogleAuthUrl);
router.get('/google-oauth-callback', googleOAuthCallback);
router.get('/google-drive-status', getGoogleDriveStatus);

// Standard endpoints
router.route('/')
    .get(getGalleryItems)
    .post(protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadGalleryItem);

router.route('/:id')
    .put(protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateGalleryItem)
    .delete(protect, deleteGalleryItem);

export default router;
