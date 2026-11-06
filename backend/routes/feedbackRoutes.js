const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getEventFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.get('/event/:eventId', getEventFeedback);
router.post('/:eventId', protect, submitFeedback);

module.exports = router;
