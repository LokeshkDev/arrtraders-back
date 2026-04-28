import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';

const DeliveryZone = sequelize.define('DeliveryZone', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // e.g., "Tamil Nadu", "Chennai Central"
    },
    type: {
        type: DataTypes.ENUM('State', 'City', 'Pincode'),
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false // The actual state name, city name, or pincode
    },
    deliveryCharge: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 50
    },
    minOrderForFreeDelivery: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    estimatedDeliveryDays: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '2-4 Days'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true
});

export default DeliveryZone;
