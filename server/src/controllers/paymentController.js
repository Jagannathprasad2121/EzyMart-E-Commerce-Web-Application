const Order = require('../models/order.model');
const Address = require('../models/address.model');
const Product = require('../models/product.model');

// @desc    Simulate payment order creation
// @route   POST /api/payment/order
const createOrder = async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Order items are required'
            });
        }

        let totalAmount = 0;
        const verifiedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }

            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    message: 'Invalid quantity'
                });
            }

            verifiedItems.push({
                productId: product._id,
                quantity,
                price: product.price
            });

            totalAmount += product.price * quantity;
        }

        // Generate a mock payment ID
        const mockPaymentId =
            'MOCK_' + Date.now();

        res.status(200).json({
            success: true,
            message: 'Mock payment order created',
            paymentId: mockPaymentId,
            items: verifiedItems,
            totalAmount
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// @desc    Simulate successful payment and save order
// @route   POST /api/payment/verify
const verifyPayment = async (req, res) => {
    try {
        const {
            paymentId,
            items,
            address
        } = req.body;

        if (!paymentId || !Array.isArray(items) ||
            items.length === 0 || !address) {
            return res.status(400).json({
                message: 'Payment, items and address are required'
            });
        }

        // Prevent duplicate orders for the same mock payment
        const existingOrder = await Order.findOne({
            paymentId
        });

        if (existingOrder) {
            return res.status(200).json({
                success: true,
                message: 'Order already exists',
                order: existingOrder
            });
        }

        let totalAmount = 0;
        const verifiedItems = [];

        // Recalculate prices from the database
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }

            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    message: 'Invalid quantity'
                });
            }

            verifiedItems.push({
                productId: product._id,
                quantity,
                price: product.price
            });

            totalAmount += product.price * quantity;
        }

        // Save delivery address in Address collection
        const savedAddress = await Address.create({
            user: req.user._id,
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country || 'India'
        });

        // Save order in Order collection
        const order = await Order.create({
            user: req.user._id,
            items: verifiedItems,
            totalAmount,
            address: savedAddress._id,
            paymentId,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Mock payment successful. Order placed!',
            order
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};