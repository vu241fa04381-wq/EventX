const Feedback = require('../models/Feedback');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Submit feedback for an event
// @route   POST /api/feedback/:eventId
// @access  Private (Participants who registered/attended)
const submitFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { rating, comment, aspectRatings, isAnonymous } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5.',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check if user attended or registered
    const registration = await Registration.findOne({
      event: eventId,
      user: req.user._id,
      status: { $in: ['attended', 'confirmed'] },
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: 'You can only leave feedback for events you have registered for or attended.',
      });
    }

    // Check if feedback already submitted
    const existingFeedback = await Feedback.findOne({
      event: eventId,
      user: req.user._id,
    });

    if (existingFeedback) {
      existingFeedback.rating = rating;
      existingFeedback.comment = comment || '';
      if (aspectRatings) existingFeedback.aspectRatings = aspectRatings;
      existingFeedback.isAnonymous = Boolean(isAnonymous);
      await existingFeedback.save();

      return res.status(200).json({
        success: true,
        message: 'Feedback updated successfully.',
        feedback: existingFeedback,
      });
    }

    const feedback = await Feedback.create({
      event: eventId,
      user: req.user._id,
      rating,
      comment: comment || '',
      aspectRatings: aspectRatings || { content: 5, organization: 5, venue: 5 },
      isAnonymous: Boolean(isAnonymous),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for an event
// @route   GET /api/feedback/event/:eventId
// @access  Public
const getEventFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const feedbacks = await Feedback.find({ event: eventId })
      .populate('user', 'name profileImage college')
      .sort({ createdAt: -1 });

    const totalReviews = feedbacks.length;
    let avgRating = 0;

    if (totalReviews > 0) {
      const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
      avgRating = Number((sum / totalReviews).toFixed(1));
    }

    // Format for privacy if anonymous
    const sanitized = feedbacks.map((f) => {
      const obj = f.toObject();
      if (obj.isAnonymous) {
        obj.user = { name: 'Anonymous Attendee', profileImage: '' };
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      totalReviews,
      averageRating: avgRating,
      feedback: sanitized,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getEventFeedback,
};
