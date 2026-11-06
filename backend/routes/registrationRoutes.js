const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMyRegistrations);
router.post('/:eventId', protect, registerForEvent);
router.put('/:registrationId/cancel', protect, cancelRegistration);
router.get(
  '/event/:eventId',
  protect,
  authorize('organizer', 'admin'),
  getEventParticipants
);

module.exports = router;
