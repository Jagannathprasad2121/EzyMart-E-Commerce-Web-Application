const express = require('express');
const protect = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

const {
    getOrders,
    getOrderById,
    updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

// Get logged-in user's orders
router.get('/myorders', protect, getOrders);

// Admin: Get all orders
router.get('/', protect, admin, getOrders);

// Get a single order by ID
router.get('/:id', protect, getOrderById);

// Admin: Update order status
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;