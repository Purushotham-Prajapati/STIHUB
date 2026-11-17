import mongoose from 'mongoose';

const engagementCardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    iconUrl: {
        type: String,
        required: true,
    },
    imageKitIconId: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        unique: true, // Each card should link to a unique category
    },
    bgGradient: {
        type: String,
        default: 'from-blue-500 to-purple-600',
    },
    order: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

const EngagementCard = mongoose.model('EngagementCard', engagementCardSchema);

export default EngagementCard;
