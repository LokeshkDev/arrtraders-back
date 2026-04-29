import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getOrders,
    updateOrderStatus,
    getOrderStats,
    deleteOrder,
    verifyCashfreePayment
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use((req, res, next) => {
    console.log(`[ORDER ROUTE] ${req.method} ${req.originalUrl}`);
    next();
});

router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getOrders);
    
router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, admin, getOrderStats);
router.post('/:id/verify-payment', protect, verifyCashfreePayment);
router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, admin, updateOrderStatus)
    .delete(protect, admin, deleteOrder);

router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
