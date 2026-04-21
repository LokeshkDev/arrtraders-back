import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const initializeFirebaseAdmin = () => {
    try {
        if (admin.apps.length > 0) return admin.app();

        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        
        let serviceAccount;
        
        if (serviceAccountPath) {
            const absolutePath = path.resolve(serviceAccountPath);
            if (fs.existsSync(absolutePath)) {
                serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
            } else {
                console.warn(`Firebase service account file not found at ${absolutePath}. Google login might fail.`);
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized successfully.');
        } else {
            console.error('Firebase Admin could not be initialized: Path not found or invalid.');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error.message);
    }
};

export { admin, initializeFirebaseAdmin };
