import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import AdminUser from './models/AdminUser.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const generateAdmin = async () => {
    try {
        // Clear all existing admins to start fresh
        await AdminUser.deleteMany();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('StiHubAdmin123!', salt);

        // Create initial admin
        const admin = await AdminUser.create({
            email: 'admin@stihub.in',
            password: hashedPassword
        });

        console.log(`Admin securely created with email: ${admin.email}`);
        process.exit();

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

generateAdmin();
