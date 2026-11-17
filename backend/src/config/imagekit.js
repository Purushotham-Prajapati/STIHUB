import Imagekit from '@imagekit/nodejs';
import dotenv from 'dotenv';
dotenv.config();

let imagekitInstance = null;

const getImageKit = () => {
    if (!imagekitInstance) {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'stihub_fallback_key';
        imagekitInstance = new Imagekit({
            privateKey,
        });
    }
    return imagekitInstance;
};

// Lazy proxy so missing env key never crashes module initialization on Vercel cold starts
const imagekit = new Proxy({}, {
    get(target, prop) {
        const ik = getImageKit();
        const value = ik[prop];
        if (typeof value === 'function') {
            return value.bind(ik);
        }
        return value;
    }
});

export default imagekit;
