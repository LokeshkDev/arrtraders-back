import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let isFirebaseInitialized = false;

const initializeFirebaseAdmin = () => {
    try {
        if (admin.apps.length > 0) {
            isFirebaseInitialized = true;
            return admin.app();
        }

        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        
        let serviceAccount;
        
        // 1. Try to load from environment variable (JSON string) - Best for Production
        if (serviceAccountJson) {
            try {
                serviceAccount = JSON.parse(serviceAccountJson);
            } catch (parseError) {
                console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON environment variable. Ensure it is a valid JSON string.');
            }
        }
        
        // 2. Fallback to local file path - Good for Local Development
        if (!serviceAccount && serviceAccountPath) {
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
            isFirebaseInitialized = true;
            console.log('Firebase Admin initialized successfully using', serviceAccountJson ? 'Environment Variable' : 'File Path');
        } else {
            console.error('Firebase Admin could not be initialized: No credentials provided via Environment Variable or File Path.');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error.message);
    }
};

export { admin, initializeFirebaseAdmin, isFirebaseInitialized };
