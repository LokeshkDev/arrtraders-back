import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const list = async () => {
    try {
        const users = await User.find({});
        console.log('--- USER LIST ---');
        users.forEach(u => console.log(`Email: "${u.email}", isAdmin: ${u.isAdmin}, Password (hashed): ${u.password.substring(0, 10)}...`));
        console.log('-----------------');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

list();
