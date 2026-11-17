import mongoose from 'mongoose';

const livelihoodSettingSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Livelihood Capitals',
        trim: true,
    },
    subtitle: {
        type: String,
        default: 'Sustainable livelihood solutions tailored for rural communities',
        trim: true,
    },
}, {
    timestamps: true,
});

const LivelihoodSetting = mongoose.model('LivelihoodSetting', livelihoodSettingSchema);

export default LivelihoodSetting;
