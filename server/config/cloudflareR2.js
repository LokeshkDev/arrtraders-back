import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import sharp from 'sharp';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Uploads a file buffer to Cloudflare R2 with image optimization.
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} originalName - Original filename
 * @param {string} folder - Folder path inside the bucket
 * @returns {string} Public URL of the uploaded file
 */
export const uploadToR2 = async (fileBuffer, originalName, folder = 'hero') => {
    let finalBuffer = fileBuffer;
    let extension = path.extname(originalName).toLowerCase();
    let contentType = getContentType(extension);

    // Image Optimization Logic
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    if (imageExtensions.includes(extension)) {
        try {
            // Resize if too large and convert to WebP for best compression
            const optimized = await sharp(fileBuffer)
                .resize({ width: 1920, withoutEnlargement: true }) // Prevent stretching smaller images
                .webp({ quality: 80 }) // High quality but small footprint
                .toBuffer();
            
            finalBuffer = optimized;
            extension = '.webp'; // Force webp for optimized images
            contentType = 'image/webp';
        } catch (error) {
            console.error('Sharp optimization failed, uploading original:', error);
        }
    }

    const uniqueName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueName,
        Body: finalBuffer,
        ContentType: contentType,
    });

    await r2Client.send(command);

    // Return the public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${uniqueName}`;
    return publicUrl;
};

function getContentType(ext) {
    const types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };
    return types[ext.toLowerCase()] || 'application/octet-stream';
}

export default r2Client;
