const Admin  = require('../models/Admin');
const Event  = require('../models/Event');
const User   = require('../models/User');
const Registration = require('../models/Registration');
const jwt    = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

function extractEventFields(body, file) {
    const image    = file ? file.filename : 'default-event.jpg';
    const maxSeats = parseInt(body.maxSeats) || 1;
    return {
        title:                body.title,
        category:             body.category,
        description:          body.description,
        date:                 body.date,
        startTime:            body.startTime            || '',
        endTime:              body.endTime              || '',
        registrationDeadline: body.registrationDeadline || null,
        location:             body.location,
        organizerName:        body.organizerName        || '',
        contactEmail:         body.contactEmail         || '',
        contactPhone:         body.contactPhone         || '',
        speakerName:          body.speakerName          || '',
        maxSeats,
        availableSeats:       maxSeats,
        eventStatus:          body.eventStatus          || 'Upcoming',
        image
    };
}

// ── Admin Login ───────────────────────────────────────────────────────────────
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password)
            return res.redirect('/admin/login?msg=Username+and+password+are+required&type=error');

        const admin = await Admin.findOne({ username });
        if (admin && (await admin.matchPassword(password))) {
            const token = generateToken(admin._id);
            res.cookie('adminToken', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
            res.cookie('admin', JSON.stringify({ username: admin.username, id: admin._id }), { maxAge: 30 * 24 * 60 * 60 * 1000 });
            return res.redirect('/admin/dashboard?msg=Welcome+Admin!&type=success');
        }
        res.redirect('/admin/login?msg=Invalid+username+or+password&type=error');
    } catch (err) {
        console.error('adminLogin error:', err.message);
        res.redirect('/admin/login?msg=Server+error.+Try+again.&type=error');
    }
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
    try {
        const [eventCount, userCount, regCount, pendingCount, events] = await Promise.all([
            Event.countDocuments(),
            User.countDocuments(),
            Registration.countDocuments({ status: 'registered' }),
            Event.countDocuments({ status: 'pending' }),
            Event.find().sort({ createdAt: -1 }).limit(8)
        ]);
        res.render('admin/dashboard', { eventCount, userCount, regCount, pendingCount, events });
    } catch (err) {
        console.error('getDashboard error:', err.message);
        res.redirect('/admin/login?msg=Could+not+load+dashboard&type=error');
    }
};

// ── Manage Events ─────────────────────────────────────────────────────────────
exports.manageEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.render('admin/manage-events', { events });
    } catch (err) {
        console.error('manageEvents error:', err.message);
        res.redirect('/admin/dashboard?msg=Could+not+load+events&type=error');
    }
};

// ── Admin: Create Event ────────────────────────────────────────────────────────
exports.createEvent = async (req, res) => {
    try {
        const data  = extractEventFields(req.body, req.file);
        data.status = 'approved';
        await Event.create(data);
        res.redirect('/admin/manage-events?msg=Event+created+successfully!&type=success');
    } catch (err) {
        console.error('admin createEvent error:', err.message);
        res.redirect('/admin/create-event?msg=Failed+to+create+event.+Check+all+fields.&type=error');
    }
};

// ── Delete Event ──────────────────────────────────────────────────────────────
exports.deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        await Registration.deleteMany({ event: req.params.id });
        res.redirect('/admin/manage-events?msg=Event+deleted+successfully&type=success');
    } catch (err) {
        console.error('deleteEvent error:', err.message);
        res.redirect('/admin/manage-events?msg=Could+not+delete+event&type=error');
    }
};

// ── Approve Event ─────────────────────────────────────────────────────────────
exports.approveEvent = async (req, res) => {
    try {
        await Event.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.redirect('/admin/manage-events?msg=Event+approved+and+is+now+live!&type=success');
    } catch (err) {
        console.error('approveEvent error:', err.message);
        res.redirect('/admin/manage-events?msg=Could+not+approve+event&type=error');
    }
};

// ── Get Registrations for a specific Event ────────────────────────────────────
exports.getEventRegistrations = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.redirect('/admin/manage-events?msg=Event+not+found&type=error');

        const registrations = await Registration.find({ event: req.params.id, status: 'registered' })
            .populate('user', 'name email createdAt')
            .sort({ registrationDate: -1 });

        res.render('admin/event-registrations', { event, registrations });
    } catch (err) {
        console.error('getEventRegistrations error:', err.message);
        res.redirect('/admin/manage-events?msg=Could+not+load+registrations&type=error');
    }
};

// ── Manage Users ──────────────────────────────────────────────────────────────
exports.manageUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.render('admin/manage-users', { users });
    } catch (err) {
        console.error('manageUsers error:', err.message);
        res.redirect('/admin/dashboard?msg=Could+not+load+users&type=error');
    }
};
