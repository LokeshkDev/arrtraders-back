import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';

const Gallery = sequelize.define('Gallery', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

export default Gallery;
