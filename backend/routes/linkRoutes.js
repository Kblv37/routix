const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  listLinks,
  createTrackedLink,
  removeLink,
  recentActivity
} = require('../controllers/linkController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware);
router.get('/', asyncHandler(listLinks));
router.post('/', asyncHandler(createTrackedLink));
router.delete('/:id', asyncHandler(removeLink));
router.get('/activity/recent', asyncHandler(recentActivity));

module.exports = router;
