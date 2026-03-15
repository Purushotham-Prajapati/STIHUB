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

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? true // Allows the origin specified in the request (e.g. your vercel domain)
        : 'http://localhost:5173',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for JWT
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/slider-items', sliderRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/news', newsRoutes);


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
