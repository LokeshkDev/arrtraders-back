import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadFolder = 'uploads/';
        if (req.originalUrl.includes('/api/products')) {
            uploadFolder = 'images/products/';
        } else if (req.originalUrl.includes('/api/cms/categories')) {
            uploadFolder = 'images/category/';
        } else if (req.originalUrl.includes('/api/cms/news')) {
            uploadFolder = 'images/news/';
        } else if (req.originalUrl.includes('/api/cms/gallery')) {
            uploadFolder = 'images/gallery/';
        } else if (req.originalUrl.includes('/api/cms/hero-bg')) {
            uploadFolder = 'images/hero/';
        }

        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder, { recursive: true });
        }
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG and WebP are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB limit
    },
    fileFilter: fileFilter
});

// Memory storage for cloud uploads (Cloudflare R2)
const memoryStorage = multer.memoryStorage();
export const memoryUpload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB limit
    },
    fileFilter: fileFilter
});

export default upload;
