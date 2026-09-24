const Product = require('../models/product.model');
const cloudinary = require('../config/cloudinary');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products)
    } catch (error) {
        console.error('Get products error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error('Get product error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        let image = req.body.image || '';

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            image = result.secure_url;
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            stock,
            image
        });

        return res.status(201).json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Create product error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const editableFields = ['name', 'description', 'price', 'category', 'stock', 'rating', 'numReviews', 'image'];
        for (const field of editableFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                product[field] = req.body[field];
            }
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            product.image = result.secure_url;
        }

        await product.save();
        return res.status(200).json(product);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Update product error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        return res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID.' });
        }
        console.error('Delete product error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
