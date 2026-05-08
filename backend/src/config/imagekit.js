import Imagekit from '@imagekit/nodejs';
import dotenv from 'dotenv';
dotenv.config();

const imagekit = new Imagekit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export default imagekit;
