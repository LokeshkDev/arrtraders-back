import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

// Self-reference for parent category
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

export default Category;
