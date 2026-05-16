const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Auto-create admin if not exists
const Admin = require('./models/Admin');
const autoSeedAdmin = async () => {
    try {
        const exists = await Admin.findOne({ username: 'admin' });
        if (!exists) {
            await Admin.create({ username: 'admin', password: 'admin123' });
            console.log('✅ Admin account created: admin / admin123');
        } else {
            console.log('✅ Admin account already exists.');
        }
    } catch (err) {
        console.error('❌ Admin seed error:', err.message);
    }
};
// Run after DB connection is ready
setTimeout(autoSeedAdmin, 3000);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global variables for templates — verify JWT so stale cookies don't linger
app.use((req, res, next) => {
    res.locals.user = null;
    res.locals.admin = null;

    // Verify user token
    const userToken = req.cookies.token;
    if (userToken) {
        try {
            const jwt = require('jsonwebtoken');
            jwt.verify(userToken, process.env.JWT_SECRET);
            // Token valid — parse display cookie
            const userCookie = req.cookies.user;
            if (userCookie && userCookie !== 'undefined') {
                const parsed = JSON.parse(userCookie);
                if (parsed && parsed.name) res.locals.user = parsed;
            }
        } catch (e) {
            // Token invalid/expired — wipe cookies
            res.clearCookie('token');
            res.clearCookie('user');
        }
    }

    // Verify admin token
    const adminToken = req.cookies.adminToken;
    if (adminToken) {
        try {
            const jwt = require('jsonwebtoken');
            jwt.verify(adminToken, process.env.JWT_SECRET);
            const adminCookie = req.cookies.admin;
            if (adminCookie && adminCookie !== 'undefined') {
                const parsed = JSON.parse(adminCookie);
                if (parsed && parsed.username) res.locals.admin = parsed;
            }
        } catch (e) {
            res.clearCookie('adminToken');
            res.clearCookie('admin');
        }
    }

    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));
app.use('/admin', require('./routes/admin'));
app.use('/events', require('./routes/event'));

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
