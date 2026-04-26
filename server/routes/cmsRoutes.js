import express from 'express';
import { 
    getCategories, createCategory, updateCategory, deleteCategory,
    getNews, createNews, deleteNews,
    getGallery, createGallery, deleteGallery,
    getHomePageCMS, updateHomePageCMS,
    uploadHeroBgImage,
    getPages, getPageBySlug, updatePage, uploadPageImage
} from '../controllers/cmsController.js';
import upload, { memoryUpload } from '../config/multer.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// HomePage
router.get('/homepage', getHomePageCMS);
router.put('/homepage', protect, admin, updateHomePageCMS);
router.post('/hero-bg', protect, admin, memoryUpload.single('image'), uploadHeroBgImage);

// Categories
router.get('/categories', getCategories);
router.post('/categories', protect, admin, memoryUpload.single('image'), createCategory);
router.put('/categories/:id', protect, admin, memoryUpload.single('image'), updateCategory);
router.delete('/categories/:id', protect, admin, deleteCategory);

// News
router.get('/news', getNews);
router.post('/news', protect, admin, memoryUpload.single('image'), createNews);
router.delete('/news/:id', protect, admin, deleteNews);

// Gallery
router.get('/gallery', getGallery);
router.post('/gallery', protect, admin, memoryUpload.single('image'), createGallery);
router.delete('/gallery/:id', protect, admin, deleteGallery);

// Pages
router.get('/pages', getPages);
router.get('/pages/:slug', getPageBySlug);
router.put('/pages/:slug', protect, admin, memoryUpload.single('image'), updatePage);
router.post('/pages/upload', protect, admin, memoryUpload.single('image'), uploadPageImage);

export default router;
