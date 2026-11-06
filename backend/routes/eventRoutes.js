const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyOrganizedEvents,
  uploadCoverImage,
  getEventAnnouncements,
  createEventAnnouncement,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth helper to check if a visitor has a token without blocking
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'eventx_super_secret_jwt_key_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Token expired or invalid, proceed as guest
    }
  }
  next();
};

// Public routes
router.get('/', getEvents);
router.get('/my/organized', protect, authorize('organizer', 'admin'), getMyOrganizedEvents);
router.post(
  '/upload-image',
  protect,
  authorize('organizer', 'admin'),
  upload.single('image'),
  uploadCoverImage
);
router.get('/:id', optionalAuth, getEventById);
router.get('/:id/announcements', getEventAnnouncements);

// Protected routes (Organizer & Admin)
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.post(
  '/:id/announcements',
  protect,
  authorize('organizer', 'admin'),
  createEventAnnouncement
);

module.exports = router;
