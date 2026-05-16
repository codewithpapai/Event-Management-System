const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect } = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Home Page
router.get('/', async (req, res) => {
    let events = [];
    if (req.cookies.user || req.cookies.adminToken) {
        events = await Event.find({ status: 'approved' }).limit(6).sort({ date: 1 });
    }
    res.render('home', { events });
});

// Auth Routes
router.get('/login', (req, res) => res.render('login', { error: null }));
router.post('/login', userController.loginUser);
router.get('/register', (req, res) => res.render('register', { error: null }));
router.post('/register', userController.registerUser);
router.get('/logout', userController.logoutUser);

// Dashboard
router.get('/dashboard', protect, userController.getDashboard);

module.exports = router;
