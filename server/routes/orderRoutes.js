import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getOrders,
    updateOrderStatus,
    getOrderStats,
    deleteOrder,
    verifyCashfreePayment,
    confirmUPIPayment,
    failOrder
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin stats
router.get('/stats', protect, admin, getOrderStats);

// User's own orders
router.get('/myorders', protect, getMyOrders);

// Payment & Lifecycle Sub-routes (MUST be above /:id)
router.post('/:id/verify-payment', protect, verifyCashfreePayment);
router.post('/:id/confirm-upi', protect, confirmUPIPayment);
router.post('/:id/fail', protect, failOrder);

// Base route operations
router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getOrders);

// Individual order operations
router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, admin, updateOrderStatus)
    .delete(protect, admin, deleteOrder);

router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
