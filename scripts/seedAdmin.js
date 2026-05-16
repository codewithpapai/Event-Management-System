const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Remove existing admin if any
        await Admin.deleteMany({ username: 'admin' });

        const admin = new Admin({
            username: 'admin',
            password: 'admin123' // Password will be hashed by the model
        });

        await admin.save();
        console.log('--- ADMIN CREDENTIALS ---');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('-------------------------');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
