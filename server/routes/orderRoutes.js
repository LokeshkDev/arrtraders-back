import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getOrders,
    updateOrderStatus,
    getOrderStats,
    deleteOrder
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createOrder)
    .get(protect, admin, getOrders);
    
router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, admin, getOrderStats);
router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, admin, updateOrderStatus)
    .delete(protect, admin, deleteOrder);

router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
