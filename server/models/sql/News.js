import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';

const News = sequelize.define('News', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING
    },
    author: {
        type: DataTypes.STRING,
        defaultValue: 'Admin'
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    category: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

export default News;
