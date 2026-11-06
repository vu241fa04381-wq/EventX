const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter an event title'],
      trim: true,
      maxlength: [120, 'Event title cannot exceed 120 characters'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [240, 'Short description cannot exceed 240 characters'],
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Technical',
        'Workshop',
        'Hackathon',
        'Seminar',
        'Conference',
        'Cultural',
        'Sports',
        'Other',
      ],
      default: 'Technical',
    },
    image: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify the start date and time'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify the end date and time'],
    },
    venue: {
      type: String,
      required: [true, 'Please specify the venue or location'],
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify total participant capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    waitlistCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please set a registration deadline'],
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    priceType: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    agenda: [
      {
        time: String,
        session: String,
        speaker: String,
      },
    ],
    contactEmail: {
      type: String,
      trim: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for active event queries
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema);
