import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany({ email: 'admin@arrahman.com' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'Super Admin',
            email: 'admin@arrahman.com',
            password: 'admin123', // the pre-save hook will hash it again if we use create 
            // BUT wait, User.js has a pre-save hook.
            // Let's just create it directly.
            isAdmin: true
        });

        console.log('Admin User Created/Reset successfully!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
