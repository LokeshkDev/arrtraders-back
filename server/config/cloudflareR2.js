import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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
            // Convert to WebP with high compression effort and optimized quality
            const optimized = await sharp(fileBuffer)
                .webp({ 
                    quality: 75, // Optimized for size vs quality
                    effort: 6,   // Maximum compression effort
                    smartSubsample: true
                }) 
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

/**
 * Deletes a file from Cloudflare R2 given its public URL.
 * @param {string} publicUrl - The public URL of the file to delete
 */
export const deleteFromR2 = async (publicUrl) => {
    if (!publicUrl || typeof publicUrl !== 'string') return;

    try {
        // Extract the key from the public URL
        // Example: https://pub-xxxx.r2.dev/products/123.webp -> products/123.webp
        const baseUrl = process.env.R2_PUBLIC_URL;
        let key = '';
        
        if (publicUrl.startsWith(baseUrl)) {
            key = publicUrl.replace(`${baseUrl}/`, '');
        } else {
            // Fallback: take everything after the last '/' if baseUrl mismatch
            const urlParts = publicUrl.split('/');
            // If it's a structured URL like folder/file, we might need more than just last part
            // But usually the key is the path after the domain
            const urlObj = new URL(publicUrl);
            key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        }

        if (!key) return;

        console.log(`[R2] Deleting object with key: ${key}`);
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        await r2Client.send(command);
    } catch (error) {
        console.error('[R2] Delete failed:', error);
    }
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
