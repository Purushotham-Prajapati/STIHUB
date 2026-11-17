import dotenv from 'dotenv';
dotenv.config();
import ImageKit from 'imagekit';
import mongoose from 'mongoose';
import GalleryItem from '../src/models/GalleryItem.js';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

await mongoose.connect(process.env.MONGODB_URI);
console.log('MongoDB connected.');

const items = await GalleryItem.find({});
console.log(`Found ${items.length} items to patch.`);

for (const item of items) {
    await new Promise((resolve, reject) => {
        imagekit.getFileDetails(item.imageKitFileId, async (error, result) => {
            if (error) {
                console.error(`Failed to get details for ${item.imageKitFileId}:`, error);
                resolve();
            } else {
                const fullUrl = result.url; // Full URL with ?updatedAt param
                await GalleryItem.updateOne({ _id: item._id }, { imageUrl: fullUrl });
                console.log(`Patched: ${item.title} => ${fullUrl}`);
                resolve();
            }
        });
    });
}

console.log('All URLs patched!');
await mongoose.disconnect();
