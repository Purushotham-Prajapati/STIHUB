import dotenv from 'dotenv';
dotenv.config();
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// List files in the STIHUB folder to see what's actually there
imagekit.listFiles({
    path: '/STIHUB',
    limit: 5,
}, (error, result) => {
    if (error) {
        console.error("Error:", JSON.stringify(error));
    } else {
        result.forEach(file => {
            console.log(`Name: ${file.name}`);
            console.log(`URL: ${file.url}`);
            console.log(`FileId: ${file.fileId}`);
            console.log('---');
        });
    }
    process.exit(0);
});
