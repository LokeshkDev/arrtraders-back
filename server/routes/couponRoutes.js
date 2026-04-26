import express from 'express';
import {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.route('/')
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

router.route('/:id')
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

// Customer route
router.post('/validate', protect, validateCoupon);

export default router;
