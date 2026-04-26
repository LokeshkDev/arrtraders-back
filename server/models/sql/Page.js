import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';

const Page = sequelize.define('Page', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bannerImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT('long'), // Stores JSON content
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('content');
            if (typeof rawValue === 'string') {
                try {
                    return JSON.parse(rawValue);
                } catch (e) {
                    return rawValue;
                }
            }
            return rawValue;
        },
        set(value) {
            this.setDataValue('content', JSON.stringify(value));
        }
    }
}, {
    timestamps: true
});

export default Page;
