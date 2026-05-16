const User = require('../models/User');
const Registration = require('../models/Registration');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── Register ──────────────────────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password)
            return res.redirect('/register?msg=All+fields+are+required&type=error');

        if (password.length < 6)
            return res.redirect('/register?msg=Password+must+be+at+least+6+characters&type=error');

        const userExists = await User.findOne({ email });
        if (userExists)
            return res.redirect('/register?msg=This+email+is+already+registered&type=error');

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.cookie('user', JSON.stringify({ name: user.name, id: user._id }), { maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.redirect('/dashboard?msg=Welcome+to+Eventify!&type=success');
    } catch (err) {
        console.error('registerUser error:', err.message);
        res.redirect('/register?msg=Registration+failed.+Try+again.&type=error');
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password)
            return res.redirect('/login?msg=Email+and+password+are+required&type=error');

        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
            res.cookie('user', JSON.stringify({ name: user.name, id: user._id }), { maxAge: 30 * 24 * 60 * 60 * 1000 });
            return res.redirect('/dashboard?msg=Welcome+back!&type=success');
        }
        res.redirect('/login?msg=Invalid+email+or+password&type=error');
    } catch (err) {
        console.error('loginUser error:', err.message);
        res.redirect('/login?msg=Login+failed.+Try+again.&type=error');
    }
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logoutUser = (req, res) => {
    res.clearCookie('token');
    res.clearCookie('user');
    res.clearCookie('adminToken');
    res.clearCookie('admin');
    res.redirect('/?msg=You+have+been+logged+out&type=info');
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user._id, status: 'registered' })
            .populate('event')
            .sort({ registrationDate: -1 });
        res.render('dashboard', { user: req.user, registrations });
    } catch (err) {
        console.error('getDashboard error:', err.message);
        res.redirect('/?msg=Could+not+load+dashboard&type=error');
    }
};

// ── Profile ───────────────────────────────────────────────────────────────────
exports.getProfile = (req, res) => {
    res.render('profile', { user: req.user });
};

// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await User.findById(req.user._id);
        user.name  = name  || user.name;
        user.email = email || user.email;
        await user.save();
        res.cookie('user', JSON.stringify({ name: user.name, id: user._id }), { maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.redirect('/user/profile?msg=Profile+updated+successfully&type=success');
    } catch (err) {
        console.error('updateProfile error:', err.message);
        res.redirect('/user/profile?msg=Update+failed.+Try+again.&type=error');
    }
};
