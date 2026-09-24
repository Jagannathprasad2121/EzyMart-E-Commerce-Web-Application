const express = require('express')
const protect = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware')
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController')
const multer = require('multer');
const upload = multer({ dest:"uploads/" });

const router = express.Router()

router.get("/",getProducts);
router.get("/:id",getProductById);
router.post("/",protect, admin, upload.single('image'), createProduct);
router.put("/:id",protect, admin, upload.single('image'), updateProduct);
router.delete("/:id",protect, admin, deleteProduct);

module.exports = router;
