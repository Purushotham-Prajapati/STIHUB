import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    let rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!rawUri) {
        throw new Error('Neither MONGODB_URI nor MONGO_URI is defined in environment variables');
    }

    // Strip accidental surrounding quotes or whitespace from dashboard copy-paste
    const uri = rawUri.replace(/^["']|["']$/g, '').trim();

    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 8000,
        };
        cached.promise = mongoose.connect(uri, opts).then((m) => {
            console.log(`MongoDB Connected: ${m.connection.host}`);
            return m;
        }).catch((err) => {
            console.error(`MongoDB connection error: ${err.message}`);
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

export default connectDB;
