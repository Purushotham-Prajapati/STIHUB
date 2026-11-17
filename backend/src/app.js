import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import sliderRoutes from './routes/sliderRoutes.js';
import engagementRoutes from './routes/engagementRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import livelihoodRoutes from './routes/livelihoodRoutes.js';
import { getGoogleAuthUrl, googleOAuthCallback } from './controllers/galleryController.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? true // Allows the origin specified in the request (e.g. your vercel domain)
        : 'http://localhost:5173',
    credentials: true
}));

// Rate limiting — configured to allow chunked uploads without false-positive 429 throttling
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // 10,000 requests per 15 minutes to support chunked file uploads & admin use
    skip: (req) => {
        // Always bypass rate limiter for file upload chunks and status checks
        return req.originalUrl?.includes('/gallery/upload-') ||
               req.originalUrl?.includes('/gallery/cancel-upload') ||
               req.originalUrl?.includes('/gallery/finalize-upload');
    },
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Cookie parser for JWT
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/slider-items', sliderRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/livelihoods', livelihoodRoutes);

// Direct Google Drive OAuth aliases
app.get('/api/google-auth-url', getGoogleAuthUrl);
app.get('/api/google-oauth-callback', googleOAuthCallback);


// Base route
app.get('/', (req, res) => {
    res.send('STIHUB API is running...');
});

// Error handlers
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

export default app;
