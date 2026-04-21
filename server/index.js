import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { initializeFirebaseAdmin } from './config/firebaseAdmin.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { verifyAppCheck } from './middleware/authMiddleware.js';

// Route imports
import productRoutes from './routes/productRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

// Initialize Firebase Admin
initializeFirebaseAdmin();

const app = express();

// Trust proxy for Render load balancer (necessary for Secure cookies)
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
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Trust any Render subdomain or localhost
        const isRender = origin.endsWith('.onrender.com');
        const isLocal = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
        
        if (isRender || isLocal || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
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

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[SERVER ERROR] ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Internal Server Error', 
        error: process.env.NODE_ENV === 'production' ? 'See server logs' : err.message 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
