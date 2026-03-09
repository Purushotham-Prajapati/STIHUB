import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import GalleryItem from './models/GalleryItem.js';

await mongoose.connect(process.env.MONGODB_URI);
const items = await GalleryItem.find({}).limit(5);
items.forEach(i => console.log(i.imageUrl));
await mongoose.disconnect();
