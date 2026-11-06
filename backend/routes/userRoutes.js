const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST /api/users/avatar
// @desc    Upload profile picture
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file.',
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: avatarUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      avatarUrl,
      user,
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/users/public/:id
// @desc    Get public organizer/user info
// @access  Public
router.get('/public/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name college department profileImage role createdAt'
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
