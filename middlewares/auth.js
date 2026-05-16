const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.redirect('/login');
        }
        next();
    } catch (err) {
        res.redirect('/login');
    }
};

const adminProtect = async (req, res, next) => {
    let token = req.cookies.adminToken;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = await Admin.findById(decoded.id).select('-password');
        if (!req.admin) {
            return res.redirect('/admin/login');
        }
        next();
    } catch (err) {
        res.redirect('/admin/login');
    }
};

module.exports = { protect, adminProtect };
