const Order = require('../models/order.model');
const Address = require('../models/address.model');

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getOrders = async (req, res) => {
    try {
        // Admin can view all orders; users can view their own
        const filter = req.user.role === 'admin'
            ? {}
            : { user: req.user._id };

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('items.productId')
            .populate('address')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.productId')
            .populate('address');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Users can only access their own orders
        if (
            req.user.role !== 'admin' &&
            order.user._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: 'Not authorized to access this order'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid order ID'
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
};


// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            'pending',
            'shipped',
            'delivered'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid order status'
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('items.productId')
            .populate('address');

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid order ID'
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    getOrders,
    getOrderById,
    updateOrderStatus
};