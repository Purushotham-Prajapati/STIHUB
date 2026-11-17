import mongoose from 'mongoose';

const livelihoodItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
    },
    imageKitFileId: {
        type: String,
        default: '',
    },
    link: {
        type: String,
        default: '#',
        trim: true,
    },
    target: {
        type: String,
        enum: ['_self', '_blank'],
        default: '_self',
    },
    buttonText: {
        type: String,
        default: 'Learn More',
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const LivelihoodItem = mongoose.model('LivelihoodItem', livelihoodItemSchema);

export default LivelihoodItem;
