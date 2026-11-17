import LivelihoodItem from '../models/LivelihoodItem.js';
import LivelihoodSetting from '../models/LivelihoodSetting.js';
import imagekit from '../config/imagekit.js';

// Helper to get or create header settings
const getOrCreateHeaderSettings = async () => {
    let setting = await LivelihoodSetting.findOne();
    if (!setting) {
        setting = await LivelihoodSetting.create({
            title: 'Livelihood Capitals',
            subtitle: 'Sustainable livelihood solutions tailored for rural communities',
        });
    }
    return setting;
};

// @desc    Get all active livelihood items and header (Public)
// @route   GET /api/livelihoods
// @access  Public
export const getLivelihoods = async (req, res) => {
    try {
        const header = await getOrCreateHeaderSettings();
        const items = await LivelihoodItem.find({ active: true }).sort({ order: 1, createdAt: 1 });
        res.json({
            header: {
                title: header.title,
                subtitle: header.subtitle,
            },
            items,
        });
    } catch (error) {
        console.error('Fetch livelihoods error:', error);
        res.status(500).json({ message: 'Failed to fetch livelihood capitals' });
    }
};

// @desc    Get all livelihood items including inactive (Admin)
// @route   GET /api/livelihoods/admin
// @access  Private
export const getLivelihoodsAdmin = async (req, res) => {
    try {
        const header = await getOrCreateHeaderSettings();
        const items = await LivelihoodItem.find({}).sort({ order: 1, createdAt: 1 });
        res.json({
            header: {
                title: header.title,
                subtitle: header.subtitle,
            },
            items,
        });
    } catch (error) {
        console.error('Fetch admin livelihoods error:', error);
        res.status(500).json({ message: 'Failed to fetch livelihood capitals for admin' });
    }
};

// @desc    Create new livelihood item
// @route   POST /api/livelihoods
// @access  Private
export const createLivelihoodItem = async (req, res) => {
    try {
        const { title, description, link, target, buttonText, active, imageUrl: directImageUrl } = req.body;
        const file = req.file;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        let imageUrl = directImageUrl || '';
        let imageKitFileId = '';

        if (file) {
            // Upload to ImageKit
            const uploadResponse = await imagekit.files.upload({
                file: file.buffer.toString('base64'),
                fileName: `livelihood-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
                tags: ['stihub', 'livelihood'],
            });
            imageUrl = uploadResponse.url;
            imageKitFileId = uploadResponse.fileId;
        }

        if (!imageUrl) {
            return res.status(400).json({ message: 'Please provide an image for the livelihood card' });
        }

        // Determine next order
        const lastItem = await LivelihoodItem.findOne().sort({ order: -1 });
        const nextOrder = lastItem && typeof lastItem.order === 'number' ? lastItem.order + 10 : 0;

        const newItem = await LivelihoodItem.create({
            title: title.trim(),
            description: description.trim(),
            imageUrl,
            imageKitFileId,
            link: link ? link.trim() : '#',
            target: target === '_blank' ? '_blank' : '_self',
            buttonText: buttonText ? buttonText.trim() : 'Learn More',
            active: active !== undefined ? active === 'true' || active === true : true,
            order: nextOrder,
        });

        res.status(201).json(newItem);
    } catch (error) {
        console.error('Create livelihood item error:', error);
        res.status(500).json({ message: error.message || 'Failed to create livelihood card' });
    }
};

// @desc    Update livelihood item
// @route   PUT /api/livelihoods/:id
// @access  Private
export const updateLivelihoodItem = async (req, res) => {
    try {
        const { title, description, link, target, buttonText, active, order, imageUrl: directImageUrl } = req.body;
        const file = req.file;

        const item = await LivelihoodItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Livelihood card not found' });
        }

        if (file) {
            // New image uploaded, upload to ImageKit
            const uploadResponse = await imagekit.files.upload({
                file: file.buffer.toString('base64'),
                fileName: `livelihood-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
                tags: ['stihub', 'livelihood'],
            });

            // Delete old image from ImageKit if it was stored there
            if (item.imageKitFileId) {
                try {
                    await imagekit.files.delete(item.imageKitFileId);
                } catch (cleanupError) {
                    console.warn('Failed to delete old ImageKit file:', cleanupError.message);
                }
            }

            item.imageUrl = uploadResponse.url;
            item.imageKitFileId = uploadResponse.fileId;
        } else if (directImageUrl) {
            item.imageUrl = directImageUrl;
        }

        if (title !== undefined) item.title = title.trim();
        if (description !== undefined) item.description = description.trim();
        if (link !== undefined) item.link = link.trim();
        if (target !== undefined) item.target = target === '_blank' ? '_blank' : '_self';
        if (buttonText !== undefined) item.buttonText = buttonText.trim();
        if (active !== undefined) item.active = active === 'true' || active === true;
        if (order !== undefined) item.order = Number(order);

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        console.error('Update livelihood item error:', error);
        res.status(500).json({ message: error.message || 'Failed to update livelihood card' });
    }
};

// @desc    Delete livelihood item
// @route   DELETE /api/livelihoods/:id
// @access  Private
export const deleteLivelihoodItem = async (req, res) => {
    try {
        const item = await LivelihoodItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Livelihood card not found' });
        }

        // Delete from ImageKit if fileId exists
        if (item.imageKitFileId) {
            try {
                await imagekit.files.delete(item.imageKitFileId);
            } catch (err) {
                console.warn('ImageKit delete failed or file already missing:', err.message);
            }
        }

        await item.deleteOne();
        res.json({ message: 'Livelihood card removed successfully' });
    } catch (error) {
        console.error('Delete livelihood item error:', error);
        res.status(500).json({ message: 'Failed to delete livelihood card' });
    }
};

// @desc    Reorder livelihood items
// @route   PUT /api/livelihoods/reorder
// @access  Private
export const reorderLivelihoodItems = async (req, res) => {
    try {
        const { orderedIds } = req.body;

        if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
            return res.status(400).json({ message: 'orderedIds array is required' });
        }

        const updateOps = orderedIds.map((id, index) =>
            LivelihoodItem.findByIdAndUpdate(id, { order: index * 10 }, { new: true })
        );

        await Promise.all(updateOps);
        const updatedItems = await LivelihoodItem.find({}).sort({ order: 1 });

        res.json({ message: 'Order updated successfully', items: updatedItems });
    } catch (error) {
        console.error('Reorder livelihood items error:', error);
        res.status(500).json({ message: 'Failed to reorder livelihood items' });
    }
};

// @desc    Get livelihood section header settings
// @route   GET /api/livelihoods/header
// @access  Public
export const getLivelihoodHeader = async (req, res) => {
    try {
        const setting = await getOrCreateHeaderSettings();
        res.json({
            title: setting.title,
            subtitle: setting.subtitle,
        });
    } catch (error) {
        console.error('Get livelihood header error:', error);
        res.status(500).json({ message: 'Failed to get header settings' });
    }
};

// @desc    Update livelihood section header settings
// @route   PUT /api/livelihoods/header
// @access  Private
export const updateLivelihoodHeader = async (req, res) => {
    try {
        const { title, subtitle } = req.body;
        let setting = await LivelihoodSetting.findOne();

        if (!setting) {
            setting = new LivelihoodSetting();
        }

        if (title !== undefined && title.trim()) setting.title = title.trim();
        if (subtitle !== undefined) setting.subtitle = subtitle.trim();

        const updatedSetting = await setting.save();
        res.json({
            title: updatedSetting.title,
            subtitle: updatedSetting.subtitle,
            message: 'Header updated successfully',
        });
    } catch (error) {
        console.error('Update livelihood header error:', error);
        res.status(500).json({ message: 'Failed to update header settings' });
    }
};
