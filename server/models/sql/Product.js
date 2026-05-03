import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalPrice: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    color: {
        type: DataTypes.STRING
    },
    weight: {
        type: DataTypes.FLOAT
    },
    unit: {
        type: DataTypes.STRING,
        defaultValue: 'gram'
    },
    availableWeights: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    flashSale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    reviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isBestSeller: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isTopRated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    nutrition: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

export default Product;
