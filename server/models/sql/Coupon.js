import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage'
    },
    discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    minOrderAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    maxDiscount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0 // 0 = unlimited
    },
    usedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true
});

export default Coupon;
