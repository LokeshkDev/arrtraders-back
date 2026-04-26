import Order from '../models/sql/Order.js';
import User from '../models/sql/User.js';
import Coupon from '../models/sql/Coupon.js';

// Helper to format ID for responses and parse JSON fields
const parseJson = (val) => {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
    }
    return val;
};

const formatResponse = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => {
            const json = item.toJSON();
            const formatted = { ...json, _id: json.id };
            if (formatted.user) {
                formatted.user = { ...formatted.user, _id: formatted.user.id };
            }
            if (formatted.orderItems) formatted.orderItems = parseJson(formatted.orderItems);
            if (formatted.shippingAddress) formatted.shippingAddress = parseJson(formatted.shippingAddress);
            return formatted;
        });
    }
    const json = data.toJSON();
    const formatted = { ...json, _id: json.id };
    if (formatted.user) {
        formatted.user = { ...formatted.user, _id: formatted.user.id };
    }
    if (formatted.orderItems) formatted.orderItems = parseJson(formatted.orderItems);
    if (formatted.shippingAddress) formatted.shippingAddress = parseJson(formatted.shippingAddress);
    return formatted;
};

const generateMongoId = () => {
    return Math.floor(Date.now() / 1000).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, deliveryPrice, discountAmount, totalPrice, couponCode } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = await Order.create({
            id: generateMongoId(),
            userId: req.user.id || req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            deliveryPrice,
            discountAmount,
            totalPrice,
            couponCode: couponCode || null,
        });

        // Increment coupon usage if a coupon was used
        if (couponCode) {
            try {
                await Coupon.increment('usedCount', { by: 1, where: { code: couponCode.toUpperCase() } });
            } catch (e) {
                console.error('Coupon usage increment error:', e.message);
            }
        }

        res.status(201).json(formatResponse(order));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({ 
            where: { userId: req.user.id || req.user._id },
            order: [['createdAt', 'DESC']]
        });
        res.json(formatResponse(orders));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
        });
        if (order) {
            res.json(formatResponse(order));
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(formatResponse(orders));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            if (req.body.status === 'Delivered') {
                order.deliveredAt = new Date();
            }
            if (req.body.isPaid !== undefined) {
                order.isPaid = req.body.isPaid;
                if (req.body.isPaid) order.paidAt = new Date();
            }
            const updatedOrder = await order.save();
            res.json(formatResponse(updatedOrder));
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order stats (admin)
// @route   GET /api/orders/stats
export const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.count();
        const processingOrders = await Order.count({ where: { status: 'Processing' } });
        const deliveredOrders = await Order.count({ where: { status: 'Delivered' } });
        
        const totalRevenue = await Order.sum('totalPrice', { where: { isPaid: true } });
        
        const recentOrders = await Order.findAll({
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        
        res.json({
            totalOrders,
            processingOrders,
            deliveredOrders,
            totalRevenue: totalRevenue || 0,
            recentOrders: formatResponse(recentOrders),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete order (admin)
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (order) {
            await order.destroy();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
