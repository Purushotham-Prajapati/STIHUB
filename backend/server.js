import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import app from './src/app.js';

dotenv.config();

// Connect to database (with catch so cold start never crashes Lambda)
connectDB().catch(err => {
    console.warn('Initial background DB connection attempt:', err.message);
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

// Export the app for Vercel Serverless Functions
export default app;

