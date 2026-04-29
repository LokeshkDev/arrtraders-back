import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';
import User from './User.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING(24),
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    orderItems: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    shippingAddress: {
        type: DataTypes.JSON,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'COD'
    },
    itemsPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    deliveryPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    discountAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    paidAt: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.ENUM('Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Processing'
    },
    deliveredAt: {
        type: DataTypes.DATE
    },
    couponCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null
    },
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
}, {
    timestamps: true
});

Order.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

export default Order;
