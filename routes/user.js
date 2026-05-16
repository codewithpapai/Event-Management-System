const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const userController = require('../controllers/userController');

router.get('/profile', protect, userController.getProfile);
router.post('/profile', protect, userController.updateProfile);

module.exports = router;
