import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Imagekit from '@imagekit/nodejs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import GalleryItem from './models/GalleryItem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize with new SDK (only needs privateKey)
const imagekit = new Imagekit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const imagesDir = path.join(__dirname, '../frontend/src/assets');

const galleryItemsData = Array.from({ length: 18 }).map((_, i) => ({
    title: `Community Initiative ${i + 1}`,
    category: i % 2 === 0 ? 'Outreach' : 'Training',
    description: i % 3 === 0
        ? "Empowering local communities through sustainable technology interventions and capacity building workshops."
        : "Showcasing the impact of our science and technology hub in rural development and skill enhancement.",
    date: "2023-2024",
}));

const migrateImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for migration.');

        await GalleryItem.deleteMany({});
        console.log('Cleared existing Gallery items from DB.');

        if (!fs.existsSync(imagesDir)) {
            console.error(`Images directory not found at: ${imagesDir}`);
            process.exit(1);
        }

        const files = fs.readdirSync(imagesDir).filter(file =>
            file.startsWith('gallery-') && ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
        );

        console.log(`Found ${files.length} images to migrate.`);

        files.sort((a, b) => {
            const numA = parseInt(a.replace('gallery-', '').split('.')[0]) || 0;
            const numB = parseInt(b.replace('gallery-', '').split('.')[0]) || 0;
            return numA - numB;
        });

        for (let i = 0; i < files.length; i++) {
            const fileName = files[i];
            const filePath = path.join(imagesDir, fileName);
            const fileBuffer = fs.readFileSync(filePath);

            const metadata = galleryItemsData[i] || {
                title: `Migrated Image ${i + 1}`,
                category: 'General',
                description: 'Migrated from local storage.',
                date: new Date().toISOString().split('T')[0]
            };

            console.log(`Uploading ${fileName} to ImageKit...`);

            // Use new @imagekit/nodejs SDK - upload to root (no subfolder) so CDN URLs work
            const uploadResponse = await imagekit.files.upload({
                file: fileBuffer.toString('base64'),
                fileName: `stihub-${fileName}`,
                tags: ['stihub', 'migration'],
            });

            console.log(`Uploaded. URL: ${uploadResponse.url}`);

            await GalleryItem.create({
                title: metadata.title,
                category: metadata.category,
                description: metadata.description,
                date: metadata.date,
                imageUrl: uploadResponse.url,
                imageKitFileId: uploadResponse.fileId,
            });

            console.log(`Saved ${fileName} to database.\n`);
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateImages();
