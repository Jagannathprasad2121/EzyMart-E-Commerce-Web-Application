const Order = require('../models/order.model');
const User = require('../models/user.model');

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalOrders,
            pendingOrders,
            shippedOrders,
            deliveredOrders,
            totalCustomers,
            revenueResult
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'shipped' }),
            Order.countDocuments({ status: 'delivered' }),
            User.countDocuments({ role: 'user' }),

            Order.aggregate([
                {
                    $match: {
                        status: { $in: ['shipped', 'delivered'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalAmount' }
                    }
                }
            ])
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                shippedOrders,
                deliveredOrders,
                totalCustomers,
                totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getDashboardStats };