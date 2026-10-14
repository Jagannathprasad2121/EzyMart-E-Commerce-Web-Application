const express = require('express');

const protect = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

const {
    getDashboardStats
} = require('../controllers/adminDashboardController');

const router = express.Router();

router.get('/dashboard', protect, admin, getDashboardStats);

module.exports = router;