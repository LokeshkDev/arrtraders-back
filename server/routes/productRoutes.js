import express from 'express';
import { 
    getProducts, getProductById, createProduct, updateProduct, deleteProduct,
    getProductBySlug, createMultipleProducts
} from '../controllers/productController.js';
import upload, { memoryUpload } from '../config/multer.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/bulk', protect, admin, createMultipleProducts);
router.get('/slug/:categorySlug/:productSlug', getProductBySlug);
router.get('/:id', getProductById);
router.post('/', protect, admin, memoryUpload.array('images', 8), createProduct);
router.put('/:id', protect, admin, memoryUpload.array('images', 8), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
