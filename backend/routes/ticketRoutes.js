const express = require('express');
const router = express.Router();
const {
  getMyTickets,
  getTicketById,
  verifyAndCheckInTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMyTickets);
router.post('/checkin', protect, authorize('organizer', 'admin'), verifyAndCheckInTicket);
router.get('/:id', protect, getTicketById);

module.exports = router;
