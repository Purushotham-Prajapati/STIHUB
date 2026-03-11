import dotenv from 'dotenv';
dotenv.config();
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Get details of one file to see its exact URL and metadata
imagekit.getFileDetails('69af13155c7cd75eb85e0d0b', (error, result) => {
    if (error) console.error("Error:", JSON.stringify(error));
    else {
        console.log("url:", result.url);
        console.log("filePath:", result.filePath);
        console.log("fileType:", result.fileType);
        console.log("customCoordinates:", result.customCoordinates);
        console.log("Full result:", JSON.stringify(result, null, 2));
    }
    process.exit(0);
});
