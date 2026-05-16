const express = require('express');
const router  = express.Router();
const { protect, adminProtect } = require('../middlewares/auth');
const eventController = require('../controllers/eventController');

// A middleware that allows EITHER a logged-in user OR admin to access
function protectAny(req, res, next) {
    // If user token is valid, req.user will be set by auth middleware in server.js
    if (req.cookies.token) {
        return protect(req, res, next);
    }
    // If admin token present, allow through (admin can view event details)
    if (req.cookies.adminToken) {
        return adminProtect(req, res, next);
    }
    return res.redirect('/login');
}

router.get('/',       protect,    eventController.getAllEvents);
router.get('/create', protect,    (req, res) => res.render('create-event', { error: null, user: req.user }));
router.post('/create', protect,   require('../middlewares/upload'), eventController.createEvent);
router.get('/:id',    protectAny, eventController.getEventDetails);   // admin & user both
router.post('/:id/register', protect, eventController.registerForEvent);
router.post('/:id/cancel',   protect, eventController.cancelRegistration);

module.exports = router;
