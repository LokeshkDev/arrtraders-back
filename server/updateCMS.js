import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import HomePage from './models/HomePage.js';
import Category from './models/Category.js';

const newCategories = [
  { name: 'Spices', img: '/images/categories/category_spices_1776768471130.png', count: '12 Items' },
  { name: 'Beverages', img: '/images/categories/category_beverages_1776768514479.png', count: '10 Items' },
  { name: 'Light Lamps', img: '/images/categories/category_lamps_1776768540786.png', count: '8 Items' },
  { name: 'Chocolate', img: '/images/categories/category_chocolate_1776768559836.png', count: '15 Items' },
  { name: 'Honey', img: '/images/categories/category_honey_1776768705340.png', count: '6 Items' },
  { name: 'Summer Essentials', img: '/images/categories/category_summer_essentials_1776768784168.png', count: '20 Items' },
  { name: 'Grocery', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400', count: '50 Items' },
  { name: 'Daily Needs', img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400', count: '30 Items' },
  { name: 'Dairy Foods & More', img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=400', count: '12 Items' },
  { name: 'Baking Supplies', img: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=400', count: '18 Items' },
  { name: 'Gift Hampers', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400', count: '10 Items' },
  { name: 'Dry Fruits', img: '/images/reference/category-thumb-2.jpg', count: '15 Items' }
];

async function updateCMS() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update HomePage CMS Data
    const home = await HomePage.findOne();
    if (home) {
      home.categoryItems = newCategories;
      await home.save();
      console.log('HomePage categoryItems updated successfully');
    } else {
      await HomePage.create({ categoryItems: newCategories });
      console.log('HomePage document created with categoryItems');
    }

    // Also ensures these exist in the Category collection for product linking
    for (const cat of newCategories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        { name: cat.name, image: cat.img },
        { upsert: true, new: true }
      );
    }
    console.log('Categories synced to Category collection');

    process.exit(0);
  } catch (error) {
    console.error('Error updating CMS:', error);
    process.exit(1);
  }
}

updateCMS();
