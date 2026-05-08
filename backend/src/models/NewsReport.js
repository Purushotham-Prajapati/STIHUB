import mongoose from 'mongoose';

const newsReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        default: '',
    },
    target: {
        type: String,
        default: '_blank',
    },
    order: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

const NewsReport = mongoose.model('NewsReport', newsReportSchema);

export default NewsReport;
