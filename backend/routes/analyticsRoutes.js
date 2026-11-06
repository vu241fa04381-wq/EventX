const express = require('express');
const router = express.Router();
const {
  getStudentAnalytics,
  getOrganizerAnalytics,
  getAdminAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/student', protect, getStudentAnalytics);
router.get(
  '/organizer',
  protect,
  authorize('organizer', 'admin'),
  getOrganizerAnalytics
);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
