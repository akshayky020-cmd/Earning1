import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from './utils/compatMongoSanitize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Fail-fast checks for required environment secrets
const requiredEnv = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
const missingEnv  = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
    console.error(`CRITICAL STARTUP ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

// Force reliable DNS resolution for MongoDB SRV records when local DNS fails.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// ── Import Routes ────────────────────────────────────────────────────────────
const authRoutes    = (await import('./routes/authRoutes.js')).default;
const userRoutes    = (await import('./routes/userRoutes.js')).default;
const planRoutes    = (await import('./routes/planRoutes.js')).default;
const walletRoutes  = (await import('./routes/walletRoutes.js')).default;
const adminRoutes   = (await import('./routes/adminRoutes.js')).default;
const imageRoutes   = (await import('./routes/imageRoutes.js')).default;
const settingRoutes = (await import('./routes/settingRoutes.js')).default;

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc:  ["'self'"],
            styleSrc:   ["'self'", "'unsafe-inline'"],
            imgSrc:     ["'self'", "data:", "https:"],
            fontSrc:    ["'self'"],
            connectSrc: ["'self'", "https://earning1-eta.vercel.app", "https://earning1.onrender.com"],
        },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts:           { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard:     { action: 'DENY' },
    noSniff:        true,
    xssFilter:      true,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'https://earning1-eta.vercel.app'
];

app.use(cors({
    origin:         function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge:         86400,
}));

// ── Body Parsers ──────────────────────────────────────────────────────────────
// 25 MB limit to allow base64 QR-code images in plan payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ── NoSQL Injection Protection ────────────────────────────────────────────────
app.use(mongoSanitize());

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      300,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { message: 'Too many requests from this IP. Please try again after 15 minutes.' },
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      10,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { message: 'Too many auth attempts from this IP. Please try again after 15 minutes.' },
});
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      5,
    standardHeaders:        true,
    legacyHeaders:          false,
    skipSuccessfulRequests: true,
    message: { message: 'Too many admin login attempts. Please try again after 15 minutes.' },
});

app.use('/api',               globalLimiter);
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/admin/login',   adminLimiter);
app.use('/api/admin/withdrawals', rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }));

// ── Static Uploads ────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ── API Routes (MUST be registered before listen) ─────────────────────────────
app.get('/', (req, res) => res.send('Hello World'));
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/plans',    planRoutes);
app.use('/api/wallet',   walletRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/image',    imageRoutes);
app.use('/api/settings', settingRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('UNHANDLED EXCEPTION LOG:', err);
    const statusCode = err.status || err.statusCode || 500;
    const message    = process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred.'
        : err.message || 'An internal server error occurred.';
    res.status(statusCode).json({ message });
});

// ── Database + Listen ─────────────────────────────────────────────────────────
mongoose.set('bufferCommands', false);
const mongoUri = process.env.MONGODB_URI;

if (mongoUri.includes('<username>') || mongoUri.includes('<password>') || mongoUri.includes('<dbname>')) {
    console.error('CRITICAL: MONGODB_URI must be updated with your actual credentials.');
    process.exit(1);
}

console.log('Connecting to MongoDB…');

mongoose.connect(mongoUri)
    .then(() => {
        console.log('MongoDB Connected Successfully');
        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    });

mongoose.connection.on('error', (err) => console.error('MongoDB runtime error:', err));