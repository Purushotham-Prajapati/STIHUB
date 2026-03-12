import mongoose from 'mongoose';

const sliderItemSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    imageKitFileId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const SliderItem = mongoose.model('SliderItem', sliderItemSchema);

export default SliderItem;
