import NewsReport from '../models/NewsReport.js';

// @desc    Get all news items
// @route   GET /api/news
// @access  Public
export const getNews = async (req, res) => {
    try {
        const news = await NewsReport.find({}).sort({ order: 1, createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch news' });
    }
};

// @desc    Create new news item
// @route   POST /api/news
// @access  Private
export const createNews = async (req, res) => {
    try {
        const { title, category, date, description, link, target, order } = req.body;
        
        const newNews = await NewsReport.create({
            title,
            category,
            date,
            description,
            link,
            target: target || '_blank',
            order: order || 0
        });

        res.status(201).json(newNews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create news item' });
    }
};

// @desc    Update news item
// @route   PUT /api/news/:id
// @access  Private
export const updateNews = async (req, res) => {
    try {
        const { title, category, date, description, link, target, order } = req.body;
        const news = await NewsReport.findById(req.params.id);

        if (news) {
            news.title = title || news.title;
            news.category = category || news.category;
            news.date = date || news.date;
            news.description = description || news.description;
            news.link = link !== undefined ? link : news.link;
            news.target = target || news.target;
            if (order !== undefined) news.order = order;

            const updatedNews = await news.save();
            res.json(updatedNews);
        } else {
            res.status(404).json({ message: 'News item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update news item' });
    }
};

// @desc    Delete news item
// @route   DELETE /api/news/:id
// @access  Private
export const deleteNews = async (req, res) => {
    try {
        const news = await NewsReport.findById(req.params.id);

        if (news) {
            await news.deleteOne();
            res.json({ message: 'News item removed' });
        } else {
            res.status(404).json({ message: 'News item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete news item' });
    }
};
