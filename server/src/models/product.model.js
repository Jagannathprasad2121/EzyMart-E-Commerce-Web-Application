const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true
    },
    image: {
        type: String,
        trim: true,
        default: ''
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be below 0'],
        max: [5, 'Rating cannot exceed 5']
    },
    numReviews: {
        type: Number,
        default: 0,
        min: [0, 'Number of reviews cannot be negative']
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
