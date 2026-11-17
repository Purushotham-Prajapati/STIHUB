import fs from 'fs';
import path from 'path';
import ImageKit from '@imagekit/nodejs';
import GalleryItem from '../models/GalleryItem.js';
import imagekit from '../config/imagekit.js';
import {
    uploadFileToGoogleDrive,
    deleteFileFromGoogleDrive,
    getOAuth2AuthUrl,
    exchangeCodeForTokens,
} from '../config/googleDrive.js';

const TEMP_CHUNKS_DIR = path.resolve('temp_uploads', 'chunks');
const IMAGEKIT_FREE_TIER_MAX_BYTES = 104857600; // 100 MB in bytes

// Ensure base temporary chunk directory exists
if (!fs.existsSync(TEMP_CHUNKS_DIR)) {
    fs.mkdirSync(TEMP_CHUNKS_DIR, { recursive: true });
}

const normalizeCategory = (cat) => {
    if (!cat) return '';
    return cat.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = async (req, res) => {
    try {
        const { category } = req.query;
        const normalizedCategory = normalizeCategory(category);
        const query = normalizedCategory ? {
            category: { $regex: new RegExp(`^${normalizedCategory}$`, 'i') }
        } : {};
        // If category is provided, use FIFO (oldest first), else use default LIFO (newest first)
        const sort = normalizedCategory ? { createdAt: 1 } : { createdAt: -1 };

        const items = await GalleryItem.find(query).sort(sort);
        res.json(items);
    } catch (error) {
        console.error("Gallery fetch error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload new gallery item (standard direct upload for photos and small videos)
// @route   POST /api/gallery
// @access  Private
export const uploadGalleryItem = async (req, res) => {
    try {
        const { title, category, description, date, sectionName } = req.body;
        const normCat = normalizeCategory(category);

        // After multer.fields(), files come in req.files
        const file = req.files?.image?.[0];
        const thumbnailFile = req.files?.thumbnail?.[0];

        if (!file) {
            return res.status(400).json({ message: 'Please upload an image or video' });
        }

        const isVideo = file.mimetype.startsWith('video/');

        if (isVideo) {
            // Check 100MB limit
            if (file.size > IMAGEKIT_FREE_TIER_MAX_BYTES) {
                return res.status(400).json({
                    message: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds ImageKit's Free Tier limit of 100 MB. Please compress the video or use the Link Video option.`
                });
            }

            // Upload video to ImageKit using binary File object
            const fileObj = await ImageKit.toFile(file.buffer, `stihub-video-${Date.now()}-${file.originalname}`, { type: file.mimetype });
            const videoUpload = await imagekit.files.upload({
                file: fileObj,
                fileName: `stihub-video-${Date.now()}-${file.originalname}`,
                tags: ['stihub', normCat, 'video'],
            });

            let thumbnailUrl = '';
            let thumbnailKitFileId = '';

            // Handle optional thumbnail upload
            if (thumbnailFile) {
                const thumbObj = await ImageKit.toFile(thumbnailFile.buffer, `stihub-thumb-${Date.now()}-${thumbnailFile.originalname}`, { type: thumbnailFile.mimetype });
                const thumbnailUpload = await imagekit.files.upload({
                    file: thumbObj,
                    fileName: `stihub-thumb-${Date.now()}-${thumbnailFile.originalname}`,
                    tags: ['stihub', normCat, 'thumbnail'],
                });
                thumbnailUrl = thumbnailUpload.url;
                thumbnailKitFileId = thumbnailUpload.fileId;
            }

            const newItem = await GalleryItem.create({
                imageUrl: '',
                imageKitFileId: videoUpload.fileId,
                mediaType: 'video',
                videoUrl: videoUpload.url,
                videoDuration: req.body.videoDuration || '',
                thumbnailUrl,
                thumbnailKitFileId,
                title,
                category: normCat,
                sectionName: sectionName || 'Project Gallery',
                description,
                date,
            });

            return res.status(201).json(newItem);
        } else {
            // Image upload
            const fileObj = await ImageKit.toFile(file.buffer, `stihub-${Date.now()}-${file.originalname}`, { type: file.mimetype });
            const uploadResponse = await imagekit.files.upload({
                file: fileObj,
                fileName: `stihub-${Date.now()}-${file.originalname}`,
                tags: ['stihub', normCat],
            });

            const newItem = await GalleryItem.create({
                imageUrl: uploadResponse.url,
                imageKitFileId: uploadResponse.fileId,
                mediaType: 'image',
                title,
                category: normCat,
                sectionName: sectionName || 'Project Gallery',
                description,
                date,
            });

            return res.status(201).json(newItem);
        }
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: 'Upload failed' });
    }
};

// ── Resumable Chunked Video Upload Endpoints ─────────────────────────────────

// @desc    Get status of an in-progress resumable upload
// @route   GET /api/gallery/upload-status/:uploadId
// @access  Private
export const getUploadStatus = async (req, res) => {
    try {
        const { uploadId } = req.params;
        const uploadDir = path.join(TEMP_CHUNKS_DIR, uploadId);

        if (!fs.existsSync(uploadDir)) {
            return res.json({ uploadedChunks: [], isComplete: false });
        }

        const files = fs.readdirSync(uploadDir);
        const uploadedChunks = files
            .filter(f => f.startsWith('chunk_'))
            .map(f => parseInt(f.replace('chunk_', ''), 10))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);

        res.json({ uploadedChunks, isComplete: false });
    } catch (error) {
        console.error('Get upload status error:', error);
        res.status(500).json({ message: 'Error checking upload status' });
    }
};

// @desc    Upload a single chunk of a video file
// @route   POST /api/gallery/upload-chunk
// @access  Private
export const uploadChunk = async (req, res) => {
    try {
        const { uploadId, chunkIndex, totalChunks } = req.body;

        if (!uploadId || chunkIndex === undefined || !totalChunks) {
            return res.status(400).json({ message: 'Missing required chunk metadata (uploadId, chunkIndex, totalChunks)' });
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: 'No chunk data received' });
        }

        const chunkIndexInt = parseInt(chunkIndex, 10);
        const totalChunksInt = parseInt(totalChunks, 10);
        const uploadDir = path.join(TEMP_CHUNKS_DIR, uploadId);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Save current chunk to disk
        const chunkPath = path.join(uploadDir, `chunk_${chunkIndexInt}`);
        fs.writeFileSync(chunkPath, req.file.buffer);

        return res.status(200).json({
            status: 'chunk_received',
            chunkIndex: chunkIndexInt,
            totalChunks: totalChunksInt,
            isComplete: false,
        });

    } catch (error) {
        console.error('Chunk upload error:', error);
        res.status(500).json({ message: error.message || 'Chunk upload failed' });
    }
};

// @desc    Assemble all chunks and finalize video upload to ImageKit
// @route   POST /api/gallery/finalize-upload
// @access  Private
export const finalizeUpload = async (req, res) => {
    try {
        const {
            uploadId,
            totalChunks,
            fileName,
            title,
            category,
            description,
            date,
            sectionName,
            videoDuration,
            thumbnailBase64,
        } = req.body;

        if (!uploadId || !totalChunks) {
            return res.status(400).json({ message: 'Missing uploadId or totalChunks' });
        }

        const totalChunksInt = parseInt(totalChunks, 10);
        const uploadDir = path.join(TEMP_CHUNKS_DIR, uploadId);

        if (!fs.existsSync(uploadDir)) {
            return res.status(404).json({ message: 'Upload session not found on server. Please re-upload.' });
        }

        const chunkFiles = [];
        for (let i = 0; i < totalChunksInt; i++) {
            const cp = path.join(uploadDir, `chunk_${i}`);
            if (!fs.existsSync(cp)) {
                return res.status(400).json({
                    message: `Chunk ${i} is missing on the server. Please resume upload to complete missing chunks.`,
                    missingChunk: i,
                });
            }
            chunkFiles.push(cp);
        }

        // Calculate total size
        let totalSize = 0;
        for (const cp of chunkFiles) {
            totalSize += fs.statSync(cp).size;
        }
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);

        // Write assembled video to temp file
        const assembledFilePath = path.join(uploadDir, `assembled_${Date.now()}.mp4`);
        const writeStream = fs.createWriteStream(assembledFilePath);
        for (const cp of chunkFiles) {
            writeStream.write(fs.readFileSync(cp));
        }
        writeStream.end();

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        const normCat = normalizeCategory(category);
        let videoUrl = '';
        let imageKitFileId = '';
        let googleDriveFileId = '';
        let storageProvider = 'imagekit';

        if (totalSize <= IMAGEKIT_FREE_TIER_MAX_BYTES) {
            // ── ROUTE A: ImageKit (File size <= 100 MB) ──
            const fileObj = await ImageKit.toFile(
                fs.createReadStream(assembledFilePath),
                `stihub-video-${Date.now()}-${fileName || 'video.mp4'}`,
                { type: 'video/mp4' }
            );

            try {
                const videoUpload = await imagekit.files.upload({
                    file: fileObj,
                    fileName: `stihub-video-${Date.now()}-${fileName || 'video.mp4'}`,
                    tags: ['stihub', normCat, 'video'],
                });
                videoUrl = videoUpload.url;
                imageKitFileId = videoUpload.fileId;
                storageProvider = 'imagekit';
            } catch (ikErr) {
                console.error('ImageKit upload error on assembled video:', ikErr);
                return res.status(400).json({
                    message: ikErr.message || 'ImageKit rejected video upload.'
                });
            }
        } else {
            // ── ROUTE B: Google Drive (File size > 100 MB) ──
            console.log(`Video size (${totalSizeMB} MB) > 100 MB. Routing automatically to Google Drive...`);
            try {
                const gdUpload = await uploadFileToGoogleDrive(
                    assembledFilePath,
                    `stihub-video-${Date.now()}-${fileName || 'video.mp4'}`,
                    'video/mp4'
                );
                videoUrl = gdUpload.videoUrl;
                googleDriveFileId = gdUpload.fileId;
                storageProvider = 'google-drive';
            } catch (gdErr) {
                console.error('Google Drive upload error:', gdErr);
                return res.status(500).json({
                    message: `Google Drive upload failed: ${gdErr.message}. Ensure Google Drive OAuth is authorized.`
                });
            }
        }

        if (fs.existsSync(assembledFilePath)) {
            try { fs.unlinkSync(assembledFilePath); } catch {}
        }

        // Optional thumbnail processing
        let thumbnailUrl = '';
        let thumbnailKitFileId = '';
        if (thumbnailBase64 && typeof thumbnailBase64 === 'string' && thumbnailBase64.length > 50) {
            try {
                const cleanB64 = thumbnailBase64.replace(/^data:image\/\w+;base64,/, '');
                const thumbUpload = await imagekit.files.upload({
                    file: cleanB64,
                    fileName: `stihub-thumb-${Date.now()}-preview.webp`,
                    tags: ['stihub', normCat, 'thumbnail'],
                });
                thumbnailUrl = thumbUpload.url;
                thumbnailKitFileId = thumbUpload.fileId;
            } catch (thumbErr) {
                console.warn('Optional thumbnail upload failed, continuing without thumbnail:', thumbErr.message);
            }
        }

        // Save GalleryItem to DB
        const newItem = await GalleryItem.create({
            imageUrl: '',
            imageKitFileId: imageKitFileId || '',
            googleDriveFileId: googleDriveFileId || '',
            storageProvider: storageProvider || 'imagekit',
            mediaType: 'video',
            videoUrl: videoUrl,
            videoDuration: videoDuration || '',
            thumbnailUrl,
            thumbnailKitFileId,
            title: title || 'Untitled Video',
            category: normCat || 'Outreach',
            sectionName: sectionName || 'Project Gallery',
            description: description || '',
            date: date || new Date().getFullYear().toString(),
        });

        // Clean up temporary chunks directory
        try {
            fs.rmSync(uploadDir, { recursive: true, force: true });
        } catch (cleanupErr) {
            console.error('Failed to clean up temp chunk folder:', cleanupErr);
        }

        return res.status(201).json({
            status: 'complete',
            isComplete: true,
            storageProvider,
            item: newItem,
        });

    } catch (error) {
        console.error('Finalize upload error:', error);
        res.status(500).json({ message: error.message || 'Failed to finalize video upload' });
    }
};

// @desc    Cancel an in-progress chunked upload and clean up temporary chunks
// @route   POST /api/gallery/cancel-upload/:uploadId
// @access  Private
export const cancelUpload = async (req, res) => {
    try {
        const { uploadId } = req.params;
        const uploadDir = path.join(TEMP_CHUNKS_DIR, uploadId);

        if (fs.existsSync(uploadDir)) {
            fs.rmSync(uploadDir, { recursive: true, force: true });
        }

        res.json({ message: 'Upload session cancelled and temporary files removed' });
    } catch (error) {
        console.error('Cancel upload error:', error);
        res.status(500).json({ message: 'Error cancelling upload' });
    }
};

// @desc    Add video via external link (YouTube, Google Drive, direct MP4)
// @route   POST /api/gallery/video-link
// @access  Private
export const addVideoByUrl = async (req, res) => {
    try {
        const { title, category, description, date, sectionName, videoUrl, videoDuration, thumbnailUrl } = req.body;
        if (!videoUrl || !videoUrl.trim()) {
            return res.status(400).json({ message: 'Video URL is required' });
        }
        const normCat = normalizeCategory(category);
        const newItem = await GalleryItem.create({
            imageUrl: '',
            imageKitFileId: '',
            mediaType: 'video',
            videoUrl: videoUrl.trim(),
            videoDuration: videoDuration || '',
            thumbnailUrl: thumbnailUrl || '',
            thumbnailKitFileId: '',
            title: title || 'Untitled Video',
            category: normCat || 'Outreach',
            sectionName: sectionName || 'Project Gallery',
            description: description || '',
            date: date || new Date().getFullYear().toString(),
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Add video by URL error:', error);
        res.status(500).json({ message: 'Failed to add video link' });
    }
};

// @desc    Update gallery item details
// @route   PUT /api/gallery/:id
// @access  Private
export const updateGalleryItem = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            date,
            sectionName,
            videoDuration,
            thumbnailUrl,
            thumbnailBase64,
            videoUrl
        } = req.body;

        const item = await GalleryItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }

        if (title !== undefined) item.title = title.trim();
        if (category) item.category = normalizeCategory(category);
        if (description !== undefined) item.description = description.trim();
        if (date !== undefined) item.date = date.trim();
        if (sectionName !== undefined) item.sectionName = sectionName.trim();

        // 1. Handle Thumbnail Replacement / Update (for videos)
        const thumbnailFile = req.files?.thumbnail?.[0];
        if (thumbnailFile) {
            // Delete previous thumbnail from ImageKit if exists
            if (item.thumbnailKitFileId) {
                try { await imagekit.files.delete(item.thumbnailKitFileId); } catch (e) {
                    console.warn('Could not delete old thumbnail:', e.message);
                }
            }
            const thumbObj = await ImageKit.toFile(
                thumbnailFile.buffer,
                `stihub-thumb-${Date.now()}-${thumbnailFile.originalname}`,
                { type: thumbnailFile.mimetype }
            );
            const thumbUpload = await imagekit.files.upload({
                file: thumbObj,
                fileName: `stihub-thumb-${Date.now()}-${thumbnailFile.originalname}`,
                tags: ['stihub', item.category, 'thumbnail'],
            });
            item.thumbnailUrl = thumbUpload.url;
            item.thumbnailKitFileId = thumbUpload.fileId;
        } else if (thumbnailBase64 && typeof thumbnailBase64 === 'string' && thumbnailBase64.startsWith('data:image/')) {
            if (item.thumbnailKitFileId) {
                try { await imagekit.files.delete(item.thumbnailKitFileId); } catch (e) {
                    console.warn('Could not delete old thumbnail:', e.message);
                }
            }
            const cleanB64 = thumbnailBase64.replace(/^data:image\/\w+;base64,/, '');
            const thumbUpload = await imagekit.files.upload({
                file: cleanB64,
                fileName: `stihub-thumb-${Date.now()}-custom.webp`,
                tags: ['stihub', item.category, 'thumbnail'],
            });
            item.thumbnailUrl = thumbUpload.url;
            item.thumbnailKitFileId = thumbUpload.fileId;
        } else if (thumbnailUrl !== undefined) {
            // If user explicitly cleared or entered a URL
            item.thumbnailUrl = thumbnailUrl.trim();
        }

        // 2. Handle Video-Specific fields (Duration & Video URL)
        if (item.mediaType === 'video') {
            if (videoDuration !== undefined) item.videoDuration = videoDuration.trim();
            if (videoUrl !== undefined && videoUrl.trim()) item.videoUrl = videoUrl.trim();
        }

        // 3. Handle Image Replacement (for photos)
        const imageFile = req.files?.image?.[0];
        if (imageFile && item.mediaType === 'image') {
            if (item.imageKitFileId) {
                try { await imagekit.files.delete(item.imageKitFileId); } catch (e) {
                    console.warn('Could not delete old image:', e.message);
                }
            }
            const imgObj = await ImageKit.toFile(
                imageFile.buffer,
                `stihub-${Date.now()}-${imageFile.originalname}`,
                { type: imageFile.mimetype }
            );
            const uploadResponse = await imagekit.files.upload({
                file: imgObj,
                fileName: `stihub-${Date.now()}-${imageFile.originalname}`,
                tags: ['stihub', item.category],
            });
            item.imageUrl = uploadResponse.url;
            item.imageKitFileId = uploadResponse.fileId;
        }

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        console.error("Gallery update error:", error);
        res.status(500).json({ message: error.message || 'Update failed' });
    }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private
export const deleteGalleryItem = async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id);

        if (item) {
            // Delete from Google Drive if stored there
            if (item.googleDriveFileId || item.storageProvider === 'google-drive') {
                try {
                    await deleteFileFromGoogleDrive(item.googleDriveFileId);
                } catch (gdErr) {
                    console.warn('Google Drive delete warning:', gdErr.message);
                }
            }

            // Delete primary file from ImageKit if one exists (external links don't have fileId)
            if (item.imageKitFileId) {
                try {
                    await imagekit.files.delete(item.imageKitFileId);
                } catch (delErr) {
                    console.warn('ImageKit delete warning:', delErr.message);
                }
            }

            // For videos, also delete thumbnail from ImageKit if one exists
            if (item.mediaType === 'video' && item.thumbnailKitFileId) {
                try {
                    await imagekit.files.delete(item.thumbnailKitFileId);
                } catch (delErr) {
                    console.warn('ImageKit thumbnail delete warning:', delErr.message);
                }
            }

            // Delete from DB
            await item.deleteOne();
            res.json({ message: 'Gallery item removed' });
        } else {
            res.status(404).json({ message: 'Gallery item not found' });
        }
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: 'Delete failed' });
    }
};

// @desc    Get Google Drive OAuth URL for admin authorization
// @route   GET /api/gallery/google-auth-url
// @access  Public
export const getGoogleAuthUrl = (req, res) => {
    try {
        const url = getOAuth2AuthUrl();
        // If accessed directly from browser address bar or link, redirect immediately to Google
        if (req.query.redirect === 'true' || req.headers.accept?.includes('text/html')) {
            return res.redirect(url);
        }
        res.json({ url });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Handle Google Drive OAuth Callback
// @route   GET /api/gallery/google-oauth-callback
// @access  Public
export const googleOAuthCallback = async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).send('<h1>No authorization code provided.</h1>');
        }
        await exchangeCodeForTokens(code);
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Google Drive Connected</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f3f4f6; }
                    .card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); text-align: center; max-width: 480px; }
                    h1 { color: #16a34a; font-size: 24px; margin-bottom: 12px; }
                    p { color: #4b5563; font-size: 15px; line-height: 1.5; }
                    .badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: 600; padding: 8px 20px; border-radius: 9999px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>🎉 Google Drive Connected!</h1>
                    <p>The refresh token has been securely saved to your backend.</p>
                    <p>Videos larger than 100 MB will now automatically be routed and stored in your Google Drive folder.</p>
                    <div class="badge">You can close this tab and return to the dashboard</div>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        console.error('Google OAuth callback error:', err);
        res.status(500).send(`<h1>Authorization Failed</h1><p>${err.message}</p>`);
    }
};

// @desc    Check Google Drive storage integration status
// @route   GET /api/gallery/google-drive-status
// @access  Public
export const getGoogleDriveStatus = (req, res) => {
    const isConfigured = Boolean(
        process.env.GOOGLE_DRIVE_REFRESH_TOKEN ||
        (process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY)
    );
    res.json({
        isConfigured,
        hasRefreshToken: Boolean(process.env.GOOGLE_DRIVE_REFRESH_TOKEN),
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
    });
};
