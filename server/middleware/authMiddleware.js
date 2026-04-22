import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { admin as firebaseAdmin, isFirebaseInitialized } from '../config/firebaseAdmin.js';

export const verifyAppCheck = async (req, res, next) => {
    const appCheckToken = req.header('X-Firebase-AppCheck');

    // Skip verification if not enforced (useful for local development)
    const isEnforced = process.env.ENFORCE_APP_CHECK === 'true';

    // Safety guard: If Firebase is not initialized, skip verification to prevent 500 error
    if (!isFirebaseInitialized) {
        if (isEnforced) {
            return res.status(503).json({ message: 'Authentication service temporarily unavailable' });
        }
        return next();
    }

    if (!appCheckToken) {
        if (isEnforced) return res.status(401).json({ message: 'App Check token missing' });
        console.warn('App Check token missing (Enforcement off)');
        return next();
    }

    try {
        await firebaseAdmin.appCheck().verifyToken(appCheckToken);
        return next();
    } catch (err) {
        console.error('App Check Verification Error:', err.message);
        if (isEnforced) return res.status(401).json({ message: 'Invalid App Check token' });
        return next();
    }
};

export const protect = async (req, res, next) => {
    let token;

    // 1. Check cookie
    token = req.cookies.jwt;

    // 2. Fallback to Authorization header (Bearer token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ message: 'Not authorized, no token' });
};

export const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};
