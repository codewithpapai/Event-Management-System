const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const sendTokenResponse = (user, statusCode, res, redirectUrl) => {
    const token = generateToken(user._id);
    
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    
    res.status(statusCode)
       .cookie('token', token, options)
       .redirect(redirectUrl);
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.render('register', { error: 'User already exists' });
        }
        
        // Count users, if 0 make the first one an admin
        const count = await User.countDocuments();
        const role = count === 0 ? 'admin' : 'user';

        user = await User.create({
            name,
            email,
            password,
            role
        });

        const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        sendTokenResponse(user, 201, res, redirectUrl);

    } catch (error) {
        res.render('register', { error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.render('login', { error: 'Please provide email and password' });
        }
        
        const user = await User.findOne({ email });
        
        if (!user || !(await user.matchPassword(password))) {
            return res.render('login', { error: 'Invalid credentials' });
        }
        
        const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        sendTokenResponse(user, 200, res, redirectUrl);

    } catch (error) {
        res.render('login', { error: error.message });
    }
};

exports.logoutUser = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.redirect('/');
};

exports.getRegisterPage = (req, res) => {
    if (req.cookies.token) return res.redirect('/');
    res.render('register', { error: null });
};

exports.getLoginPage = (req, res) => {
    if (req.cookies.token) return res.redirect('/');
    res.render('login', { error: null });
};
