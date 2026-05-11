import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { connectMySQL } from './config/mysql.js';
import { initializeFirebaseAdmin } from './config/firebaseAdmin.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { verifyAppCheck } from './middleware/authMiddleware.js';

// Route imports
import productRoutes from './routes/productRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import './models/sql/index.js'; // Ensure models are registered for sync
import { ensureOrderPaymentSchema } from './controllers/orderController.js';

// Connect to Database & Initialize services
const initializeApp = async () => {
    try {
        await connectMySQL();
        await initializeFirebaseAdmin();
        await ensureOrderPaymentSchema();
        console.log('Core services initialized successfully');
    } catch (error) {
        console.error('Initialization Error:', error.message);
    }
};

initializeApp();

const app = express();

// Trust the reverse proxy on Lightsail/Nginx so secure cookies and client IPs work correctly.
app.set('trust proxy', 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rate Limiting - only on auth routes to prevent brute force
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 login/register requests per hour
    message: 'Too many accounts created or login attempts from this IP, please try again after an hour'
});

// Middleware
const normalizeOrigin = (origin) => {
    if (!origin) return '';
    try {
        const url = new URL(origin.trim());
        return url.origin;
    } catch {
        return origin.trim().replace(/\/+$/, '');
    }
};

const parseOrigins = (value) => (value || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

const allowedOrigins = [...new Set([
    ...parseOrigins(process.env.ALLOWED_ORIGINS),
    ...parseOrigins(process.env.CLIENT_URL),
    ...parseOrigins(process.env.FRONTEND_URL)
])];

const isProduction = process.env.NODE_ENV === 'production';

app.use(cors((req, callback) => {
    const origin = normalizeOrigin(req.header('Origin'));

    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, { origin: true, credentials: true });

    const isLocal = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const requestHost = req.hostname || req.get('host')?.split(':')[0];
    const isLocalServer = requestHost === 'localhost' || requestHost === '127.0.0.1' || requestHost === '::1';
    const sameOrigin = req.get('host') && origin === `${req.protocol}://${req.get('host')}`;

    if (sameOrigin || (isLocal && (!isProduction || isLocalServer)) || allowedOrigins.includes(origin)) {
        return callback(null, { origin: true, credentials: true });
    }

    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(null, {
        origin: false,
        credentials: true
    });
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://sdk.cashfree.com",
                "https://*.cashfree.com",
                "https://fonts.googleapis.com",
                "https://cdn.jsdelivr.net"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdn.jsdelivr.net"
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
            connectSrc: [
                "'self'",
                "https://sdk.cashfree.com",
                "https://*.cashfree.com",
                "https://sandbox.cashfree.com",
                "https://api.cashfree.com"
            ],
            frameSrc: [
                "'self'",
                "https://sdk.cashfree.com",
                "https://*.cashfree.com",
                "https://sandbox.cashfree.com",
                "https://api.cashfree.com"
            ],
            formAction: [
                "'self'",
                "https://sdk.cashfree.com",
                "https://*.cashfree.com",
                "https://sandbox.cashfree.com",
                "https://api.cashfree.com"
            ],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"]
        }
    }
}));
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global Firebase App Check Verification for all API requests
app.use('/api', verifyAppCheck);

// Static folder for images
app.use('/images', express.static(path.join(__dirname, '/images')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads'))); // keep uploads for backwards compatibility

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/delivery', deliveryRoutes);

app.get('/api/health', (req, res) => {
    res.send('API is running...');
});

const clientDistPath = path.resolve(__dirname, '../client/dist');
const clientDistExists = fs.existsSync(clientDistPath);
console.log(`Client dist path: ${clientDistPath} — exists: ${clientDistExists}`);

if (clientDistExists) {
    // Serve static assets from the built client (JS, CSS, images, etc.)
    app.use(express.static(clientDistPath));

    // SPA catch-all: any GET request that doesn't match an API or static
    // route gets index.html so React Router can handle the route.
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running... (client not built)');
    });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : 'same-origin only'}`);
});
