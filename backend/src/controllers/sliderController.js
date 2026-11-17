import SliderItem from '../models/SliderItem.js';
import imagekit from '../config/imagekit.js';

// @desc    Get all slider items
// @route   GET /api/slider
// @access  Public
export const getSliderItems = async (req, res) => {
    try {
        const items = await SliderItem.find({ active: true }).sort({ order: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch slider items' });
    }
};

// @desc    Add new slider item
// @route   POST /api/slider
// @access  Private
export const createSliderItem = async (req, res) => {
    try {
        const { title } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const uploadResponse = await imagekit.files.upload({
            file: file.buffer.toString('base64'),
            fileName: `slider-${Date.now()}-${file.originalname}`,
            tags: ['stihub', 'slider'],
        });

        // Get max order
        const lastItem = await SliderItem.findOne().sort({ order: -1 });
        const nextOrder = lastItem ? lastItem.order + 10 : 0;

        const newItem = await SliderItem.create({
            imageUrl: uploadResponse.url,
            imageKitFileId: uploadResponse.fileId,
            title: title || '',
            order: nextOrder
        });

        res.status(201).json(newItem);
    } catch (error) {
        console.error("Slider upload error:", error);
        res.status(500).json({ message: 'Failed to add slider item' });
    }
};

// @desc    Delete slider item
// @route   DELETE /api/slider/:id
// @access  Private
export const deleteSliderItem = async (req, res) => {
    try {
        const item = await SliderItem.findById(req.params.id);

        if (item) {
            await imagekit.files.delete(item.imageKitFileId);
            await item.deleteOne();
            res.json({ message: 'Slider item removed' });
        } else {
            res.status(404).json({ message: 'Slider item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete slider item' });
    }
};

// @desc    Update slider item orders
// @route   PUT /api/slider/reorder
// @access  Private
export const reorderSliderItems = async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of IDs in correct order

        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ message: 'orderedIds array is required' });
        }

        const updateOps = orderedIds.map((id, index) => {
            return SliderItem.findByIdAndUpdate(id, { order: index * 10 });
        });

        await Promise.all(updateOps);

        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reorder slider items' });
    }
};
