import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        await User.deleteMany(); // Clear existing
        
        // Ensure Admin exists
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@arrahman.com',
            password: 'password123',
            isAdmin: true
        });

        // 2 Dummy Customers
        const customer1 = new User({
            name: 'Sarah Jenkins',
            email: 'sarah@example.com',
            password: 'password123',
            isAdmin: false
        });

        const customer2 = new User({
            name: 'David Sharma',
            email: 'david@example.com',
            password: 'password123',
            isAdmin: false
        });

        await User.insertMany([adminUser, customer1, customer2]);
        console.log('Dummy users added!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedUsers();
