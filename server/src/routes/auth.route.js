const express = require('express')
const {registerUser, loginUser, getUser, getCurrentUser, verifyEmail, requestPasswordReset, resetPassword } = require('../controllers/authController')
const protect = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware')

const router = express.Router()

/* POST /api/auth/register */
router.post("/register",registerUser)
/* POST /api/auth/login */
router.post("/login",loginUser)
/* POST /api/auth/verify-email */
router.post("/verify-email", verifyEmail)
/* POST /api/auth/forgot-password */
router.post("/forgot-password", requestPasswordReset)
/* POST /api/auth/reset-password */
router.post("/reset-password", resetPassword)
/* GET /api/auth/me */
router.get("/me", protect, getCurrentUser)
/* GET /api/auth/users */
router.get("/users", protect, admin, getUser)

module.exports = router
