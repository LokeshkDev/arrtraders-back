import mongoose from 'mongoose';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import sequelize from '../config/mysql.js';

// Mongoose Models
import UserMongo from '../models/User.js';
import ProductMongo from '../models/Product.js';
import CategoryMongo from '../models/Category.js';
import OrderMongo from '../models/Order.js';
import NewsMongo from '../models/News.js';
import GalleryMongo from '../models/Gallery.js';
import HomePageMongo from '../models/HomePage.js';

// Sequelize Models
import UserSql from '../models/sql/User.js';
import ProductSql from '../models/sql/Product.js';
import CategorySql from '../models/sql/Category.js';
import OrderSql from '../models/sql/Order.js';
import NewsSql from '../models/sql/News.js';
import GallerySql from '../models/sql/Gallery.js';
import HomePageSql from '../models/sql/HomePage.js';

dotenv.config();

const migrate = async () => {
    try {
        // 0. Ensure MySQL database exists
        console.log('Ensuring MySQL database exists...');
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE || 'arr_rahman'}\`;`);
        await connection.end();
        console.log('Database checked/created.');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Sync MySQL
        await sequelize.sync({ force: true }); // WARNING: This drops existing tables in MySQL
        console.log('MySQL Tables Synced (Recreated)');

        // 1. Migrate Users
        const users = await UserMongo.find({});
        console.log(`Migrating ${users.length} Users...`);
        for (const user of users) {
            await UserSql.create({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                password: user.password,
                phone: user.phone,
                isAdmin: user.isAdmin,
                addresses: user.addresses,
                wishlist: user.wishlist,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }, { hooks: false });
        }

        // 2. Migrate Categories
        const categories = await CategoryMongo.find({});
        console.log(`Migrating ${categories.length} Categories...`);
        for (const cat of categories) {
            await CategorySql.create({
                id: cat._id.toString(),
                name: cat.name,
                slug: cat.slug,
                image: cat.image,
                description: cat.description,
                parentId: cat.parent ? cat.parent.toString() : null,
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt
            });
        }

        // 3. Migrate Products
        const products = await ProductMongo.find({});
        console.log(`Migrating ${products.length} Products...`);
        for (const prod of products) {
            await ProductSql.create({
                id: prod._id.toString(),
                name: prod.name,
                slug: prod.slug,
                description: prod.description,
                price: prod.price,
                originalPrice: prod.originalPrice,
                category: prod.category,
                image: prod.image,
                images: prod.images,
                color: prod.color,
                weight: prod.weight,
                unit: prod.unit,
                availableWeights: prod.availableWeights,
                flashSale: prod.flashSale,
                discount: prod.discount,
                rating: prod.rating,
                reviews: prod.reviews,
                isBestSeller: prod.isBestSeller,
                isTopRated: prod.isTopRated,
                isFeatured: prod.isFeatured,
                stock: prod.stock,
                nutrition: prod.nutrition ? Object.fromEntries(prod.nutrition) : {},
                createdAt: prod.createdAt,
                updatedAt: prod.updatedAt
            });
        }

        // 4. Migrate Orders
        const orders = await OrderMongo.find({});
        console.log(`Migrating ${orders.length} Orders...`);
        for (const order of orders) {
            await OrderSql.create({
                id: order._id.toString(),
                userId: order.user.toString(),
                orderItems: order.orderItems,
                shippingAddress: order.shippingAddress,
                paymentMethod: order.paymentMethod,
                itemsPrice: order.itemsPrice,
                deliveryPrice: order.deliveryPrice,
                discountAmount: order.discountAmount,
                totalPrice: order.totalPrice,
                isPaid: order.isPaid,
                paidAt: order.paidAt,
                status: order.status,
                deliveredAt: order.deliveredAt,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            });
        }

        // 5. Migrate News
        const newsList = await NewsMongo.find({});
        console.log(`Migrating ${newsList.length} News items...`);
        for (const news of newsList) {
            await NewsSql.create({
                id: news._id.toString(),
                title: news.title,
                content: news.content,
                image: news.image,
                author: news.author,
                date: news.date,
                category: news.category,
                createdAt: news.createdAt,
                updatedAt: news.updatedAt
            });
        }

        // 6. Migrate Gallery
        const galleryItems = await GalleryMongo.find({});
        console.log(`Migrating ${galleryItems.length} Gallery items...`);
        for (const item of galleryItems) {
            await GallerySql.create({
                id: item._id.toString(),
                title: item.title,
                image: item.image,
                description: item.description,
                category: item.category,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            });
        }

        // 7. Migrate HomePage
        const homePages = await HomePageMongo.find({});
        console.log(`Migrating ${homePages.length} HomePage documents...`);
        for (const hp of homePages) {
            await HomePageSql.create({
                id: hp._id.toString(),
                heroSlides: hp.heroSlides,
                featuredBtnText: hp.featuredBtnText,
                featuredBtnLink: hp.featuredBtnLink,
                bestSellersBtnText: hp.bestSellersBtnText,
                bestSellersBtnLink: hp.bestSellersBtnLink,
                features: hp.features,
                categoryItems: hp.categoryItems,
                experienceBanners: hp.experienceBanners,
                promos: hp.promos,
                heritage: hp.heritage,
                couponBanners: hp.couponBanners,
                shippingInfo: hp.shippingInfo,
                testimonials: hp.testimonials,
                showHero: hp.showHero,
                showFeatures: hp.showFeatures,
                showCategories: hp.showCategories,
                showBestSellers: hp.showBestSellers,
                showFeatured: hp.showFeatured,
                showFlashSale: hp.showFlashSale,
                showExperience: hp.showExperience,
                showTestimonials: hp.showTestimonials,
                flashSaleEndTime: hp.flashSaleEndTime,
                createdAt: hp.createdAt,
                updatedAt: hp.updatedAt
            });
        }

        console.log('Migration Completed Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration Failed:', error);
        process.exit(1);
    }
};

migrate();
