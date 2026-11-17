import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '../src/assets');

const MAX_WIDTH = 1920;
const QUALITY = 80;

const processImages = async () => {
    try {
        const files = fs.readdirSync(assetsDir);

        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png)$/i)) {
                const inputPath = path.join(assetsDir, file);
                const filename = path.parse(file).name;
                const outputPath = path.join(assetsDir, `${filename}.webp`);

                // Skip if webp already exists (optional, keeping it simple for now I will overwrite or just create new)
                // Actually, let's create new .webp files so we can change imports safely.

                console.log(`Processing: ${file}`);

                await sharp(inputPath)
                    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                    .webp({ quality: QUALITY })
                    .toFile(outputPath);

                const originalSize = fs.statSync(inputPath).size / 1024 / 1024;
                const newSize = fs.statSync(outputPath).size / 1024 / 1024;

                console.log(`Saved: ${filename}.webp (${newSize.toFixed(2)} MB) - Reduced by ${((1 - newSize / originalSize) * 100).toFixed(0)}%`);
            }
        }
    } catch (error) {
        console.error('Error processing images:', error);
    }
};

processImages();
