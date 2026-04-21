import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const migratePasswords = async () => {
    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users. Checking for plain-text passwords...`);

        let updatedCount = 0;
        for (const user of users) {
             // Bcrypt hashes usually start with $2a$ or $2b$ and are 60 chars long
             const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

             if (!isHashed) {
                  console.log(`Hashing plain-text password for user: ${user.email}`);
                  // Note: User.js has a pre('save') hook, but we want to be explicit here
                  // because we might not want to re-hash if it's already hashed.
                  // Actually, just calling save() on a modified password triggers the pre-save hook.
                  user.password = user.password; // trigger change? No.
                  
                  // Let's just manally hash and save directly to update the record.
                  const salt = await bcrypt.genSalt(10);
                  user.password = await bcrypt.hash(user.password, salt);
                  await user.save();
                  updatedCount++;
             }
        }

        console.log(`Migration completed. Hashed ${updatedCount} plain-text passwords.`);
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

migratePasswords();
