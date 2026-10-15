const express = require('express')
const {registerUser, loginUser, getUser, getCurrentUser, verifyEmail } = require('../controllers/authController')
const protect = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware')

const router = express.Router()

/* POST /api/auth/register */
router.post("/register",registerUser)
/* POST /api/auth/login */
router.post("/login",loginUser)
/* POST /api/auth/verify-email */
router.post("/verify-email", verifyEmail)
/* GET /api/auth/me */
router.get("/me", protect, getCurrentUser)
/* GET /api/auth/users */
router.get("/users", protect, admin, getUser)

module.exports = router
