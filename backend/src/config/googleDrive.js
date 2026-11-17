import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const REDIRECT_URI = 'http://localhost:5000/api/gallery/google-oauth-callback';

/**
 * Returns an authenticated Google Drive client:
 * 1. Uses OAuth2 with Refresh Token if available (uses user's 15GB quota).
 * 2. Falls back to Service Account if OAuth2 is not configured.
 */
export const getDriveClient = () => {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    // Prefer OAuth2 with Refresh Token (bypasses service account 0-byte quota)
    if (clientId && clientSecret && refreshToken) {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        return google.drive({ version: 'v3', auth: oauth2Client });
    }

    // Fallback: Service account
    const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    if (clientEmail && rawPrivateKey) {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: rawPrivateKey.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        return google.drive({ version: 'v3', auth });
    }

    throw new Error('Google Drive credentials not configured. Please authorize Google Drive in .env.');
};

/**
 * Generates the OAuth2 Authorization URL
 */
export const getOAuth2AuthUrl = () => {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET must be set in .env');
    }
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
    });
};

/**
 * Exchanges auth code for refresh token and saves to .env
 */
export const exchangeCodeForTokens = async (code) => {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
        const envPath = path.resolve('.env');
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf-8');
        }

        if (envContent.includes('GOOGLE_DRIVE_REFRESH_TOKEN=')) {
            envContent = envContent.replace(
                /GOOGLE_DRIVE_REFRESH_TOKEN=.*/g,
                `GOOGLE_DRIVE_REFRESH_TOKEN="${tokens.refresh_token}"`
            );
        } else {
            envContent += `\nGOOGLE_DRIVE_REFRESH_TOKEN="${tokens.refresh_token}"\n`;
        }
        fs.writeFileSync(envPath, envContent, 'utf-8');
        process.env.GOOGLE_DRIVE_REFRESH_TOKEN = tokens.refresh_token;
        console.log('Saved GOOGLE_DRIVE_REFRESH_TOKEN to .env successfully.');
    }

    return tokens;
};

/**
 * Uploads a local file stream to Google Drive, sets public read permission,
 * and returns the embeddable preview URL and file ID.
 */
export const uploadFileToGoogleDrive = async (filePath, fileName, mimeType = 'video/mp4') => {
    const drive = getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const requestBody = {
        name: fileName,
    };

    if (folderId) {
        requestBody.parents = [folderId];
    }

    const media = {
        mimeType,
        body: fs.createReadStream(filePath),
    };

    // 1. Upload file into target folder
    const uploadRes = await drive.files.create({
        requestBody,
        media,
        fields: 'id, name, webViewLink, webContentLink',
        supportsAllDrives: true,
    });

    const fileId = uploadRes.data.id;

    // 2. Grant public read permission so website visitors can stream the video
    try {
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });
    } catch (permErr) {
        console.warn('Could not set public permission on Google Drive file:', permErr.message);
    }

    return {
        fileId,
        videoUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        webViewLink: uploadRes.data.webViewLink,
    };
};

/**
 * Deletes a file from Google Drive by its file ID.
 */
export const deleteFileFromGoogleDrive = async (fileId) => {
    if (!fileId) return;
    try {
        const drive = getDriveClient();
        await drive.files.delete({ fileId, supportsAllDrives: true });
        console.log(`Deleted Google Drive file: ${fileId}`);
    } catch (err) {
        console.warn(`Failed to delete Google Drive file ${fileId}:`, err.message);
    }
};

export default getDriveClient;
