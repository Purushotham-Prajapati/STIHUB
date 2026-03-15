import EngagementCard from '../models/EngagementCard.js';
import imagekit from '../config/imagekit.js';

const normalizeCategory = (cat) => {
    if (!cat) return '';
    return cat.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

// @desc    Get all engagement cards
// @route   GET /api/engagement
// @access  Public
export const getEngagementCards = async (req, res) => {
    try {
        const cards = await EngagementCard.find({}).sort({ order: 1 });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch engagement cards' });
    }
};

// @desc    Create new engagement card
// @route   POST /api/engagement
// @access  Private
export const createEngagementCard = async (req, res) => {
    try {
        const { title, description, category, bgGradient } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Please upload an icon' });
        }

        const uploadResponse = await imagekit.files.upload({
            file: file.buffer.toString('base64'),
            fileName: `icon-${Date.now()}-${file.originalname}`,
            tags: ['stihub', 'icon', 'engagement'],
        });

        // Get max order
        const lastCard = await EngagementCard.findOne().sort({ order: -1 });
        const nextOrder = lastCard ? lastCard.order + 10 : 0;

        const newCard = await EngagementCard.create({
            title,
            description,
            iconUrl: uploadResponse.url,
            imageKitIconId: uploadResponse.fileId,
            category: normalizeCategory(category),
            bgGradient: bgGradient || 'from-blue-500 to-purple-600',
            order: nextOrder
        });

        res.status(201).json(newCard);
    } catch (error) {
        console.error("Card creation error:", error);
        res.status(500).json({ message: 'Failed to create engagement card' });
    }
};

// @desc    Update engagement card
// @route   PUT /api/engagement/:id
// @access  Private
export const updateEngagementCard = async (req, res) => {
    try {
        const { title, description, category, bgGradient, order } = req.body;
        const card = await EngagementCard.findById(req.params.id);

        if (card) {
            card.title = title || card.title;
            card.description = description || card.description;
            card.category = category ? normalizeCategory(category) : card.category;
            card.bgGradient = bgGradient || card.bgGradient;
            if (order !== undefined) card.order = order;

            const updatedCard = await card.save();
            res.json(updatedCard);
        } else {
            res.status(404).json({ message: 'Card not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update engagement card' });
    }
};

// @desc    Delete engagement card
// @route   DELETE /api/engagement/:id
// @access  Private
export const deleteEngagementCard = async (req, res) => {
    try {
        const card = await EngagementCard.findById(req.params.id);

        if (card) {
            // Delete icon from ImageKit
            await imagekit.files.delete(card.imageKitIconId);
            await card.deleteOne();
            res.json({ message: 'Engagement card removed' });
        } else {
            res.status(404).json({ message: 'Card not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete engagement card' });
    }
};
