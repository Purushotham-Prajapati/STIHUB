import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Imagekit from '@imagekit/nodejs';
import LivelihoodItem from '../src/models/LivelihoodItem.js';
import LivelihoodSetting from '../src/models/LivelihoodSetting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const imagekit = new Imagekit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const assetsDir = path.join(__dirname, '../../frontend/src/assets');

const initialCards = [
    {
        title: 'Backyard Poultry',
        description: 'Sustainable poultry farming for rural communities',
        fileName: 'img1.webp',
        order: 0,
        buttonText: 'Learn More',
        link: '#',
        target: '_self',
    },
    {
        title: 'Feed and Fodder',
        description: 'Quality nutrition for livestock development',
        fileName: 'img2.webp',
        order: 10,
        buttonText: 'Learn More',
        link: '#',
        target: '_self',
    },
    {
        title: 'Banjara Art',
        description: 'Empowering the village through collaboration',
        fileName: 'img3.webp',
        order: 20,
        buttonText: 'Learn More',
        link: '#',
        target: '_self',
    },
    {
        title: 'TKS - Seed Bank',
        description: 'Preserving traditional knowledge and seeds',
        fileName: 'img4.webp',
        order: 30,
        buttonText: 'Learn More',
        link: '#',
        target: '_self',
    },
];

const seedLivelihoods = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for livelihood seeding.');

        // 1. Ensure Header Setting exists
        let setting = await LivelihoodSetting.findOne();
        if (!setting) {
            setting = await LivelihoodSetting.create({
                title: 'Livelihood Capitals',
                subtitle: 'Sustainable livelihood solutions tailored for rural communities',
            });
            console.log('Created default LivelihoodSetting.');
        } else {
            console.log('LivelihoodSetting already exists:', setting.title);
        }

        // 2. Check if items already exist
        const count = await LivelihoodItem.countDocuments();
        if (count > 0) {
            console.log(`LivelihoodItem collection already has ${count} items. Skipping seeding to prevent overwrite.`);
            process.exit(0);
        }

        console.log('Seeding initial 4 livelihood cards to ImageKit and MongoDB...');

        for (const item of initialCards) {
            const filePath = path.join(assetsDir, item.fileName);
            let imageUrl = '';
            let imageKitFileId = '';

            if (fs.existsSync(filePath)) {
                try {
                    const fileBuffer = fs.readFileSync(filePath);
                    const uploadRes = await imagekit.files.upload({
                        file: fileBuffer.toString('base64'),
                        fileName: `livelihood-seed-${item.fileName}`,
                        tags: ['stihub', 'livelihood', 'seed'],
                    });
                    imageUrl = uploadRes.url;
                    imageKitFileId = uploadRes.fileId;
                    console.log(`Uploaded ${item.fileName} to ImageKit: ${imageUrl}`);
                } catch (uploadErr) {
                    console.error(`Failed to upload ${item.fileName} to ImageKit:`, uploadErr.message);
                    imageUrl = `https://ik.imagekit.io/6odkn6h4q/livelihood-${item.fileName}`;
                }
            } else {
                console.warn(`Local file ${filePath} not found.`);
                imageUrl = `https://ik.imagekit.io/6odkn6h4q/livelihood-${item.fileName}`;
            }

            await LivelihoodItem.create({
                title: item.title,
                description: item.description,
                imageUrl,
                imageKitFileId,
                link: item.link,
                target: item.target,
                buttonText: item.buttonText,
                order: item.order,
                active: true,
            });
            console.log(`Created LivelihoodItem: "${item.title}"`);
        }

        console.log('Livelihood seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedLivelihoods();
