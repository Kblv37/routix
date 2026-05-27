const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getOverview } = require('../controllers/analyticsController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);
router.get('/overview', asyncHandler(getOverview));

module.exports = router;
