import nodemailer from 'nodemailer';
import { getEmailTemplate } from './emailTemplates.js';

const sendEmail = async ({ to, subject, type, data }) => {
    try {
        // Create transporter using environment variables
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false // Helps with some hosting provider restrictions
            }
        });

        // Get HTML content from template helper
        const html = getEmailTemplate(type, data);

        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"AR Rahman Traders" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`[EMAIL] Message sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EMAIL ERROR]:', error.message);
        // We don't throw here to avoid breaking the main request flow if email fails
        return null;
    }
};

export default sendEmail;
