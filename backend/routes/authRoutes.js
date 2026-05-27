const express = require('express');
const { register, login, logout, me } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiters');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/register', authLimiter, asyncHandler(register));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/logout', authMiddleware, asyncHandler(logout));
router.get('/me', authMiddleware, asyncHandler(me));

module.exports = router;
