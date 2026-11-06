const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide an overall rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },
    aspectRatings: {
      content: { type: Number, min: 1, max: 5, default: 5 },
      organization: { type: Number, min: 1, max: 5, default: 5 },
      venue: { type: Number, min: 1, max: 5, default: 5 },
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ user: 1, event: 1 }, { unique: true });
feedbackSchema.index({ event: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
