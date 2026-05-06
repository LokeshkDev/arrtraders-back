import Coupon from '../models/sql/Coupon.js';
import { DataTypes, Op } from 'sequelize';

// Helper to generate Mongo-style ID
const generateMongoId = () => {
    return Math.floor(Date.now() / 1000).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

const formatResponse = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => {
            const json = item.toJSON();
            return { ...json, _id: json.id };
        });
    }
    const json = data.toJSON();
    return { ...json, _id: json.id };
};

const ensureCouponSchema = async () => {
    const queryInterface = Coupon.sequelize.getQueryInterface();
    const table = await queryInterface.describeTable(Coupon.getTableName());

    if (!table.freeShipping) {
        await queryInterface.addColumn(Coupon.getTableName(), 'freeShipping', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    }
};

// @desc    Get all active coupons (public)
// @route   GET /api/coupons/active
export const getActiveCoupons = async (req, res) => {
    try {
        await ensureCouponSchema();
        const now = new Date();
        const coupons = await Coupon.findAll({ 
            where: { 
                isActive: true,
                [Op.or]: [
                    { expiresAt: null },
                    { expiresAt: { [Op.gt]: now } }
                ]
            },
            order: [['createdAt', 'DESC']]
        });
        res.json(formatResponse(coupons));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
export const getCoupons = async (req, res) => {
    try {
        await ensureCouponSchema();
        const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
        res.json(formatResponse(coupons));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a coupon (admin)
// @route   POST /api/coupons
export const createCoupon = async (req, res) => {
    try {
        await ensureCouponSchema();
        const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt, isActive, freeShipping } = req.body;

        if (!code || (!freeShipping && discountType !== 'shipping' && !discountValue)) {
            return res.status(400).json({ message: 'Code and discount value are required unless free shipping or shipping discount is enabled' });
        }

        // Check for duplicate code
        const exists = await Coupon.findOne({ where: { code: code.toUpperCase() } });
        if (exists) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            id: generateMongoId(),
            code: code.toUpperCase(),
            discountType: discountType || 'percentage',
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount: maxDiscount || null,
            usageLimit: usageLimit || 0,
            expiresAt: expiresAt || null,
            freeShipping: !!freeShipping,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(formatResponse(coupon));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a coupon (admin)
// @route   PUT /api/coupons/:id
export const updateCoupon = async (req, res) => {
    try {
        await ensureCouponSchema();
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiresAt, isActive, freeShipping } = req.body;

        // If code is changing, check for duplicates
        if (code && code.toUpperCase() !== coupon.code) {
            const exists = await Coupon.findOne({ where: { code: code.toUpperCase() } });
            if (exists) {
                return res.status(400).json({ message: 'Coupon code already exists' });
            }
            coupon.code = code.toUpperCase();
        }

        if (discountType !== undefined) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = discountValue;
        if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
        if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
        if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
        if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
        if (freeShipping !== undefined) coupon.freeShipping = !!freeShipping;
        if (isActive !== undefined) coupon.isActive = isActive;

        const updated = await coupon.save();
        res.json(formatResponse(updated));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a coupon (admin)
// @route   DELETE /api/coupons/:id
export const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        await coupon.destroy();
        res.json({ message: 'Coupon removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate a coupon code (customer-facing)
// @route   POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
    try {
        await ensureCouponSchema();
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Please enter a coupon code' });
        }

        const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is no longer active' });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'This coupon has expired' });
        }

        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'This coupon has reached its usage limit' });
        }

        if (cartTotal < coupon.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
        }

        // Calculate discount
        let itemDiscount = 0;
        let shippingDiscount = 0;
        let isFreeShipping = coupon.freeShipping;

        if (coupon.discountType === 'percentage') {
            itemDiscount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && itemDiscount > coupon.maxDiscount) {
                itemDiscount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === 'fixed') {
            itemDiscount = coupon.discountValue;
        } else if (coupon.discountType === 'shipping') {
            shippingDiscount = coupon.discountValue;
        }

        // Ensure item discount doesn't exceed cart total
        itemDiscount = Math.min(itemDiscount, cartTotal);
        itemDiscount = Math.round(itemDiscount * 100) / 100;

        let message = `Coupon applied!`;
        if (itemDiscount > 0) message += ` You save ₹${itemDiscount}`;
        if (shippingDiscount > 0) message += ` + ₹${shippingDiscount} off shipping`;
        if (isFreeShipping) message += ` + Free Shipping`;

        res.json({
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discount: itemDiscount,
            shippingDiscount: shippingDiscount,
            freeShipping: isFreeShipping,
            message
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
