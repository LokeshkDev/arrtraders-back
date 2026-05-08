import dotenv from 'dotenv';
import sendEmail from './utils/sendEmail.js';

// Load environment variables
dotenv.config();

const testMail = async () => {
    console.log('--- Starting Email Test ---');
    console.log('Target User Email:', process.env.ADMIN_EMAIL || 'Not Set');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('ERROR: SMTP_USER or SMTP_PASS is missing in .env');
        return;
    }

    const testData = {
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
        subject: 'Test Email: AR Rahman Traders System',
        type: 'WELCOME',
        data: {
            name: 'Test Admin',
            shopUrl: 'https://arrahmantraders.com'
        }
    };

    console.log('Sending test email...');
    const result = await sendEmail(testData);

    if (result) {
        console.log('✅ Success! Check your inbox.');
    } else {
        console.log('❌ Failed. Check the error message above.');
    }
};

testMail();
