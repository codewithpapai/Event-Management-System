const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');
const upload = require('../middlewares/upload');

// Admin Auth
router.get('/login', (req, res) => res.render('admin/login', { error: null }));
router.post('/login', adminController.loginAdmin);

// Dashboard & Management
router.get('/dashboard', adminProtect, adminController.getDashboard);
router.get('/manage-events', adminProtect, adminController.manageEvents);
router.get('/manage-users', adminProtect, adminController.manageUsers);

// Event Operations
router.get('/create-event', adminProtect, (req, res) => res.render('admin/create-event', { error: null }));
router.post('/create-event', adminProtect, upload, adminController.createEvent);
router.get('/delete-event/:id', adminProtect, adminController.deleteEvent);
router.get('/approve-event/:id', adminProtect, adminController.approveEvent);
router.get('/event-registrations/:id', adminProtect, adminController.getEventRegistrations);

module.exports = router;
