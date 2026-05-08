import Section from '../models/Section.js';

// @desc    Get all sections for a specific page (or all)
// @route   GET /api/sections
// @access  Public
export const getSections = async (req, res) => {
    try {
        const query = req.query.targetPage ? { targetPage: req.query.targetPage } : {};
        const sections = await Section.find(query).sort({ order: 1, createdAt: -1 });
        res.json(sections);
    } catch (error) {
        console.error("Section fetch error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new section
// @route   POST /api/sections
// @access  Private
// Body: { title, content, targetPage, insertBeforeId? }
//   - If insertBeforeId is provided, insert before that section (shift orders)
//   - Otherwise, append at the end
export const createSection = async (req, res) => {
    try {
        const { title, content, targetPage, insertBeforeId } = req.body;
        const page = targetPage || 'gallery';

        // Get all existing sections for this page, sorted
        const existing = await Section.find({ targetPage: page }).sort({ order: 1 });

        let newOrder;

        if (!insertBeforeId || insertBeforeId === 'end') {
            // Append at end: strictly higher than any existing order
            newOrder = existing.length > 0
                ? Math.max(...existing.map(s => typeof s.order === 'number' ? s.order : 0)) + 10
                : 0;
        } else {
            let targetIndex = -1;

            if (insertBeforeId === 'first') {
                targetIndex = 0;
            } else {
                // Insert before a specific section ID
                targetIndex = existing.findIndex(s => s._id.toString() === insertBeforeId);
            }

            if (targetIndex === -1 || existing.length === 0) {
                // Section not found or list is empty — fall back to appending at end
                newOrder = existing.length > 0
                    ? Math.max(...existing.map(s => typeof s.order === 'number' ? s.order : 0)) + 10
                    : 0;
            } else {
                // Re-normalize all existing sections to clean sequential orders first,
                // then insert at the target position
                const normalizeOps = existing.map((s, i) =>
                    Section.findByIdAndUpdate(s._id, { order: i * 10 })
                );
                await Promise.all(normalizeOps);

                // targetIndex * 10 is the new order of the target section
                const targetOrder = targetIndex * 10;

                // Shift all at or after target up by 10
                await Section.updateMany(
                    { targetPage: page, order: { $gte: targetOrder } },
                    { $inc: { order: 10 } }
                );

                newOrder = targetOrder;
            }
        }

        const section = await Section.create({
            title,
            content,
            targetPage: page,
            order: newOrder,
        });

        res.status(201).json(section);
    } catch (error) {
        console.error("Section create error:", error);
        res.status(500).json({ message: 'Section creation failed' });
    }
};

// @desc    Update a section
// @route   PUT /api/sections/:id
// @access  Private
export const updateSection = async (req, res) => {
    try {
        const { title, content, targetPage, order } = req.body;
        const section = await Section.findById(req.params.id);

        if (section) {
            section.title = title || section.title;
            section.content = content || section.content;
            section.targetPage = targetPage || section.targetPage;
            if (order !== undefined) section.order = order;

            const updatedSection = await section.save();
            res.json(updatedSection);
        } else {
            res.status(404).json({ message: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
};

// @desc    Delete a section
// @route   DELETE /api/sections/:id
// @access  Private
export const deleteSection = async (req, res) => {
    try {
        const section = await Section.findById(req.params.id);

        if (section) {
            await section.deleteOne();
            res.json({ message: 'Section removed' });
        } else {
            res.status(404).json({ message: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};
