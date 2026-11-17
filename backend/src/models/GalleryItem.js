import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        default: '',
    },
    imageKitFileId: {
        type: String,
        default: '',
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
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image',
    },
    videoUrl: {
        type: String,
        default: '',
    },
    videoDuration: {
        type: String,
        default: '',
    },
    thumbnailUrl: {
        type: String,
        default: '',
    },
    thumbnailKitFileId: {
        type: String,
        default: '',
    },
    googleDriveFileId: {
        type: String,
        default: '',
    },
    storageProvider: {
        type: String,
        enum: ['imagekit', 'google-drive', 'external'],
        default: 'imagekit',
    },
}, {
    timestamps: true
});

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);

export default GalleryItem;
