import Order from '../models/sql/Order.js';
import User from '../models/sql/User.js';
import Coupon from '../models/sql/Coupon.js';
import { DataTypes } from 'sequelize';
import { createCashfreeOrder, getCashfreeMode, getCashfreeOrder } from '../utils/cashfree.js';

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

export const ensureOrderPaymentSchema = async () => {
    try {
        const queryInterface = Order.sequelize.getQueryInterface();
        const table = await queryInterface.describeTable(Order.getTableName());

        const columns = {
            cashfreeOrderId: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            cashfreePaymentSessionId: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            paymentStatus: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'PENDING'
            },
            paymentDetails: {
                type: DataTypes.JSON,
                allowNull: true
            }
        };

        for (const [name, definition] of Object.entries(columns)) {
            if (!table[name]) {
                await queryInterface.addColumn(Order.getTableName(), name, definition);
            }
        }
    } catch (error) {
        console.error('Error ensuring order payment schema:', error);
    }
};

export const ensureOrderTrackingSchema = async () => {
    try {
        const queryInterface = Order.sequelize.getQueryInterface();
        const table = await queryInterface.describeTable(Order.getTableName());

        if (!table['trackingNumber']) {
            await queryInterface.addColumn(Order.getTableName(), 'trackingNumber', {
                type: DataTypes.STRING,
                allowNull: true
            });
        }
    } catch (error) {
        console.error('Error ensuring order tracking schema:', error);
    }
};

const getClientUrl = (req) => {
    if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
    if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
    if (req && req.headers.origin) return req.headers.origin;
    if (process.env.ALLOWED_ORIGINS) return process.env.ALLOWED_ORIGINS.split(',')[0];
    if (req && req.get('host')) return `${req.protocol}://${req.get('host')}`;
    return '';
};

const normalizePhone = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    const last10 = digits.slice(-10);
    if (!last10 || last10.length < 10) return '+919999999999';
    return `+91${last10}`;
};

const formatAmount = (amount) => {
    return Math.max(1, Math.round(Number(amount || 0) * 100) / 100);
};

const buildCashfreePayload = (order, user, req) => {
    const address = parseJson(order.shippingAddress) || {};
    const clientUrl = getClientUrl(req).replace(/\/$/, '');
    const returnUrl = `${clientUrl}/order-success/${order.id}?cashfree_order_id={order_id}`;
    const notifyUrl = process.env.CASHFREE_NOTIFY_URL;

    return {
        order_id: order.id,
        order_amount: formatAmount(order.totalPrice),
        order_currency: 'INR',
        customer_details: {
            customer_id: String(user.id || user._id || order.userId),
            customer_name: address.name || user.name || 'Customer',
            customer_email: user.email || undefined,
            customer_phone: normalizePhone(address.phone || user.phone)
        },
        order_meta: {
            return_url: returnUrl,
            ...(notifyUrl ? { notify_url: notifyUrl } : {})
        },
        order_note: `AR Rahman order ${order.id}`
    };
};

const incrementCouponUsage = async (couponCode) => {
    if (!couponCode) return;
    try {
        await Coupon.increment('usedCount', { by: 1, where: { code: couponCode.toUpperCase() } });
    } catch (e) {
        console.error('Coupon usage increment error:', e.message);
    }
};

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, deliveryPrice, discountAmount, totalPrice, couponCode } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const orderData = {
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
            paymentStatus: paymentMethod === 'COD' ? 'COD' : 'PENDING',
        };

        console.log('[DEBUG] Attempting to create order with data:', JSON.stringify(orderData, null, 2));
        
        const order = await Order.create(orderData);

        if (paymentMethod === 'CASHFREE') {
            let cashfreeOrder;

            try {
                cashfreeOrder = await createCashfreeOrder(
                    buildCashfreePayload(order, req.user, req),
                    order.id
                );
            } catch (error) {
                await order.destroy();
                throw error;
            }

            order.cashfreeOrderId = cashfreeOrder.order_id;
            order.cashfreePaymentSessionId = cashfreeOrder.payment_session_id;
            order.paymentDetails = cashfreeOrder;
            await order.save();

            return res.status(201).json({
                ...formatResponse(order),
                paymentSessionId: cashfreeOrder.payment_session_id,
                cashfreeOrderId: cashfreeOrder.order_id,
                cashfreeMode: getCashfreeMode()
            });
        }

        await incrementCouponUsage(couponCode);

        res.status(201).json(formatResponse(order));
    } catch (error) {
        console.error('[ORDER CREATE ERROR]:', error);
        res.status(500).json({ 
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
    }
};

// @desc    Verify Cashfree payment and mark order paid
// @route   POST /api/orders/:id/verify-payment
export const verifyCashfreePayment = async (req, res) => {
    try {
        await ensureOrderPaymentSchema();
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if ((req.user.id || req.user._id) !== order.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to verify this order' });
        }

        if (order.paymentMethod !== 'CASHFREE') {
            return res.json(formatResponse(order));
        }

        const expectedCashfreeOrderId = order.cashfreeOrderId || order.id;
        const requestedCashfreeOrderId = req.body.cashfreeOrderId;

        if (requestedCashfreeOrderId && requestedCashfreeOrderId !== expectedCashfreeOrderId) {
            return res.status(400).json({ message: 'Payment verification order mismatch' });
        }

        const cashfreeOrderId = expectedCashfreeOrderId;
        const cashfreeOrder = await getCashfreeOrder(cashfreeOrderId);
        const isPaid = cashfreeOrder.order_status === 'PAID';

        order.cashfreeOrderId = cashfreeOrder.order_id || order.cashfreeOrderId;
        order.paymentStatus = cashfreeOrder.order_status || order.paymentStatus;
        order.paymentDetails = cashfreeOrder;

        if (isPaid) {
            if (!order.isPaid) {
                order.isPaid = true;
                order.paidAt = new Date();
                order.status = 'Confirmed';
                await incrementCouponUsage(order.couponCode);
            }
        } else if (cashfreeOrder.order_status === 'FAILED') {
            order.status = 'Failed';
            order.isPaid = false;
        } else if (['CANCELLED', 'EXPIRED'].includes(cashfreeOrder.order_status)) {
            order.status = 'Cancelled';
            order.isPaid = false;
        }

        await order.save();

        res.json({
            ...formatResponse(order),
            paid: order.isPaid,
            paymentStatus: order.paymentStatus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
    try {
        await ensureOrderPaymentSchema();
        await ensureOrderTrackingSchema();
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
        await ensureOrderPaymentSchema();
        await ensureOrderTrackingSchema();
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
        await ensureOrderPaymentSchema();
        await ensureOrderTrackingSchema();
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
        await ensureOrderPaymentSchema();
        await ensureOrderTrackingSchema();
        const order = await Order.findByPk(req.params.id);
        if (order) {
            const nextStatus = req.body.status || order.status;
            const trackingNumber = typeof req.body.trackingNumber === 'string'
                ? req.body.trackingNumber.trim()
                : req.body.trackingNumber;

            if (nextStatus === 'Shipped' && !trackingNumber && !order.trackingNumber) {
                return res.status(400).json({ message: 'Tracking number is required before marking an order as shipped' });
            }

            order.status = nextStatus;
            if (trackingNumber !== undefined && trackingNumber !== null) {
                order.trackingNumber = trackingNumber;
            }
            if (nextStatus === 'Delivered') {
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
        await ensureOrderPaymentSchema();
        await ensureOrderTrackingSchema();
        
        const totalOrders = await Order.count();
        const processingOrders = await Order.count({ where: { status: 'Processing' } });
        const deliveredOrders = await Order.count({ where: { status: 'Delivered' } });
        
        const totalRevenue = await Order.sum('totalPrice', { where: { isPaid: true } });
        
        // Fetch all orders to calculate monthly stats and top products
        // (For high traffic, this should be optimized with SQL aggregations, but for current scale this is more flexible)
        const allOrders = await Order.findAll({
            where: { isPaid: true },
            attributes: ['totalPrice', 'orderItems', 'createdAt']
        });

        const projectStartDate = new Date(2026, 4, 1); // May 1, 2026
        const toDateKey = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const toMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const getProjectYearKey = (date) => {
            const startYear = date.getMonth() >= 4 ? date.getFullYear() : date.getFullYear() - 1;
            return `${startYear}-${startYear + 1}`;
        };

        // Project reports start from May 2026.
        const dailyStats = {};
        const monthlyStats = {};
        const yearlyStats = {};
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        const now = new Date();
        for (let d = new Date(projectStartDate); d <= now; d.setDate(d.getDate() + 1)) {
            const key = toDateKey(d);
            dailyStats[key] = {
                key,
                label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                total: 0,
                count: 0
            };
        }

        for (let d = new Date(projectStartDate.getFullYear(), projectStartDate.getMonth(), 1); d <= now; d.setMonth(d.getMonth() + 1)) {
            const key = toMonthKey(d);
            monthlyStats[key] = {
                key,
                label: `${months[d.getMonth()]} ${d.getFullYear()}`,
                shortLabel: months[d.getMonth()],
                total: 0,
                count: 0
            };
        }

        const startProjectYear = getProjectYearKey(projectStartDate);
        const currentProjectYear = getProjectYearKey(now);
        const [startYear] = startProjectYear.split('-').map(Number);
        const [endYear] = currentProjectYear.split('-').map(Number);
        for (let year = startYear; year <= endYear; year++) {
            const key = `${year}-${year + 1}`;
            yearlyStats[key] = {
                key,
                label: `${year}-${year + 1}`,
                period: `May ${year} - Apr ${year + 1}`,
                total: 0,
                count: 0
            };
        }

        const productStats = {};

        allOrders.forEach(order => {
            const date = new Date(order.createdAt);
            if (date < projectStartDate) return;

            const dayKey = toDateKey(date);
            const monthKey = toMonthKey(date);
            const yearKey = getProjectYearKey(date);
            const orderTotal = Number(order.totalPrice) || 0;

            if (dailyStats[dayKey]) {
                dailyStats[dayKey].total += orderTotal;
                dailyStats[dayKey].count += 1;
            }
            
            if (monthlyStats[monthKey]) {
                monthlyStats[monthKey].total += orderTotal;
                monthlyStats[monthKey].count += 1;
            }

            if (yearlyStats[yearKey]) {
                yearlyStats[yearKey].total += orderTotal;
                yearlyStats[yearKey].count += 1;
            }

            // Top Products
            const items = parseJson(order.orderItems) || [];
            items.forEach(item => {
                const pid = item.id || item.product;
                if (!pid) return;
                
                if (!productStats[pid]) {
                    productStats[pid] = {
                        name: item.name,
                        category: item.category || 'General',
                        price: item.price,
                        img: item.image || item.img,
                        sold: 0,
                        revenue: 0
                    };
                }
                productStats[pid].sold += (item.qty || 1);
                productStats[pid].revenue += (item.price * (item.qty || 1));
            });
        });

        const dailySales = Object.values(dailyStats);
        const salesChart = Object.values(monthlyStats);
        const monthlyReport = salesChart;
        const yearlyReport = Object.values(yearlyStats);

        // Format Top Products
        const topProducts = Object.values(productStats)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 4)
            .map(p => ({
                ...p,
                sold: `${p.sold} Sold`,
                price: `₹${p.price.toLocaleString()}`,
                tag: p.sold > 50 ? 'BEST SELLER' : 'TRENDING'
            }));

        res.json({
            totalOrders,
            processingOrders,
            deliveredOrders,
            totalRevenue: totalRevenue || 0,
            dailySales,
            salesChart,
            monthlyReport,
            yearlyReport,
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete order (admin)
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
    try {
        await ensureOrderPaymentSchema();
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
