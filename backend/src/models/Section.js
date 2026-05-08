import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    targetPage: {
        type: String,
        required: true,
        enum: ['gallery', 'home'],
        default: 'gallery'
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Section = mongoose.model('Section', sectionSchema);

export default Section;
