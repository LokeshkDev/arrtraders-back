import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';

dotenv.config();

const createSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ slug: { $exists: false } });
        console.log(`Found ${products.length} products to migrate`);

        for (const p of products) {
            p.slug = createSlug(p.name);
            await p.save();
            console.log(`Migrated product: ${p.name}`);
        }

        const categories = await Category.find({ slug: { $exists: false } });
        console.log(`Found ${categories.length} categories to migrate`);

        for (const c of categories) {
            c.slug = createSlug(c.name);
            await c.save();
            console.log(`Migrated category: ${c.name}`);
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
