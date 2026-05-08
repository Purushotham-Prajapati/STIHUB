import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    imageKitFileId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    sectionName: {
        type: String,
        default: 'Project Gallery',
    },
    description: {
        type: String,
        default: '',
    },
    date: {
        type: String,
        default: '',
    }
}, {
    timestamps: true
});

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);

export default GalleryItem;
