import GalleryItem from '../models/GalleryItem.js';
import imagekit from '../config/imagekit.js';

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = async (req, res) => {
    try {
        const items = await GalleryItem.find({}).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error("Gallery fetch error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Upload new gallery item
// @route   POST /api/gallery
// @access  Private
export const uploadGalleryItem = async (req, res) => {
    try {
        const { title, category, description, date, sectionName } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        // Upload to ImageKit using new @imagekit/nodejs SDK - upload to root so CDN URLs work
        const uploadResponse = await imagekit.files.upload({
            file: file.buffer.toString('base64'),
            fileName: `stihub-${Date.now()}-${file.originalname}`,
            tags: ['stihub', category],
        });

        // Save to Database using the URL from the upload response
        const newItem = await GalleryItem.create({
            imageUrl: uploadResponse.url,
            imageKitFileId: uploadResponse.fileId,
            title,
            category,
            sectionName: sectionName || 'Project Gallery',
            description,
            date
        });

        res.status(201).json(newItem);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: 'Image upload failed' });
    }
};

// @desc    Update gallery item details
// @route   PUT /api/gallery/:id
// @access  Private
export const updateGalleryItem = async (req, res) => {
    try {
        const { title, category, description, date } = req.body;
        const item = await GalleryItem.findById(req.params.id);

        if (item) {
            item.title = title || item.title;
            item.category = category || item.category;
            item.description = description || item.description;
            item.date = date || item.date;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Gallery item not found' });
        }
    } catch (error) {
        console.error("Gallery update error:", error);
        res.status(500).json({ message: 'Update failed' });
    }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private
export const deleteGalleryItem = async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id);

        if (item) {
            // Delete from ImageKit using new SDK
            await imagekit.files.delete(item.imageKitFileId);

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
