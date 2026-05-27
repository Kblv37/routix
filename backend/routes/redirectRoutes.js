const express = require('express');
const { redirectLimiter } = require('../middleware/rateLimiters');
const { redirectByCode } = require('../controllers/redirectController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/:code', redirectLimiter, asyncHandler(redirectByCode));

module.exports = router;
