import { DataTypes } from 'sequelize';
import sequelize from '../../config/mysql.js';

const HomePage = sequelize.define('HomePage', {
    id: {
        type: DataTypes.STRING(24),
        primaryKey: true,
        allowNull: false
    },
    heroSlides: { type: DataTypes.JSON },
    featuredBtnText: { type: DataTypes.STRING },
    featuredBtnLink: { type: DataTypes.STRING },
    bestSellersBtnText: { type: DataTypes.STRING },
    bestSellersBtnLink: { type: DataTypes.STRING },
    features: { type: DataTypes.JSON },
    categoryItems: { type: DataTypes.JSON },
    experienceBanners: { type: DataTypes.JSON },
    promos: { type: DataTypes.JSON },
    heritage: { type: DataTypes.JSON },
    couponBanners: { type: DataTypes.JSON },
    shippingInfo: { type: DataTypes.JSON },
    testimonials: { type: DataTypes.JSON },
    showHero: { type: DataTypes.BOOLEAN, defaultValue: true },
    showFeatures: { type: DataTypes.BOOLEAN, defaultValue: true },
    showCategories: { type: DataTypes.BOOLEAN, defaultValue: true },
    showBestSellers: { type: DataTypes.BOOLEAN, defaultValue: true },
    showFeatured: { type: DataTypes.BOOLEAN, defaultValue: true },
    showFlashSale: { type: DataTypes.BOOLEAN, defaultValue: true },
    showExperience: { type: DataTypes.BOOLEAN, defaultValue: true },
    showTestimonials: { type: DataTypes.BOOLEAN, defaultValue: true },
    flashSaleEndTime: { type: DataTypes.DATE },
    freeShippingThreshold: { type: DataTypes.FLOAT, defaultValue: 1999 },
    deliveryCharge: { type: DataTypes.FLOAT, defaultValue: 50 }
}, {
    timestamps: true
});

export default HomePage;
