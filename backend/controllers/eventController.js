const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const { emitToEvent, emitToUser } = require('../services/socketService');

// @desc    Get all events with filters, search, pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      timeframe,
      priceType,
      status,
      page = 1,
      limit = 12,
      sortBy = 'startDate',
      sortOrder = 'asc',
    } = req.query;

    const query = {};

    // By default, public only sees 'approved' events
    // Admins and organizers can query other statuses if authenticated
    if (status) {
      query.status = status;
    } else {
      query.status = 'approved';
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Price type filter
    if (priceType && priceType !== 'all') {
      query.priceType = priceType;
    }

    // Search query across title, description, and venue
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Timeframe filter
    const now = new Date();
    if (timeframe === 'upcoming') {
      query.startDate = { $gte: now };
    } else if (timeframe === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.startDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (timeframe === 'this_week') {
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      query.startDate = { $gte: now, $lte: endOfWeek };
    } else if (timeframe === 'past') {
      query.endDate = { $lt: now };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email college profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizer',
      'name email college department profileImage'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check if current user is registered (if auth token was sent)
    let userRegistration = null;
    if (req.user) {
      userRegistration = await Registration.findOne({
        event: event._id,
        user: req.user._id,
        status: { $in: ['confirmed', 'waitlisted', 'attended'] },
      });
    }

    // Get recent announcements for this event
    const announcements = await Announcement.find({ event: event._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      event,
      userRegistration,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      shortDescription,
      description,
      category,
      image,
      startDate,
      endDate,
      venue,
      isOnline,
      meetingLink,
      capacity,
      registrationDeadline,
      priceType,
      price,
      tags,
      agenda,
      contactEmail,
      contactPhone,
    } = req.body;

    if (!title || !description || !startDate || !endDate || !venue || !capacity || !registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.',
      });
    }

    if (new Date(registrationDeadline) > new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline cannot be after the event start date.',
      });
    }

    // Organizers submit events as 'pending' for Admin approval.
    // Admins can create immediately approved events.
    const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

    const event = await Event.create({
      title,
      shortDescription: shortDescription || description.slice(0, 160),
      description,
      category,
      image: image || '',
      organizer: req.user._id,
      startDate,
      endDate,
      venue,
      isOnline: Boolean(isOnline),
      meetingLink: meetingLink || '',
      capacity: Number(capacity),
      registrationDeadline,
      status: initialStatus,
      priceType: priceType || 'free',
      price: priceType === 'paid' ? Number(price || 0) : 0,
      tags: Array.isArray(tags) ? tags : [],
      agenda: Array.isArray(agenda) ? agenda : [],
      contactEmail: contactEmail || req.user.email,
      contactPhone: contactPhone || '',
    });

    res.status(201).json({
      success: true,
      message:
        initialStatus === 'approved'
          ? 'Event published successfully.'
          : 'Event submitted for review and approval.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer, Admin)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check ownership unless admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this event.',
      });
    }

    // Do not allow capacity to be reduced below current registered count
    if (req.body.capacity && Number(req.body.capacity) < event.registeredCount) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be lower than the current registered participants (${event.registeredCount}).`,
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Notify registered participants of update
    emitToEvent(event._id, 'event_updated', {
      title: event.title,
      message: 'Event details have been updated.',
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer, Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event.',
      });
    }

    // Mark as cancelled or remove
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events organized by the current user
// @route   GET /api/events/my/organized
// @access  Private (Organizer, Admin)
const getMyOrganizedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload event cover image
// @route   POST /api/events/upload-image
// @access  Private (Organizer, Admin)
const uploadCoverImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.',
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get announcements for an event
// @route   GET /api/events/:id/announcements
// @access  Public
const getEventAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ event: req.params.id })
      .populate('organizer', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an announcement for an event
// @route   POST /api/events/:id/announcements
// @access  Private (Organizer, Admin)
const createEventAnnouncement = async (req, res, next) => {
  try {
    const { title, message, priority = 'normal' } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to post announcements for this event.',
      });
    }

    const announcement = await Announcement.create({
      event: event._id,
      organizer: req.user._id,
      title,
      message,
      priority,
    });

    // Find all confirmed registrations and notify them
    const registrations = await Registration.find({
      event: event._id,
      status: { $in: ['confirmed', 'attended'] },
    });

    const notifications = registrations.map((reg) => ({
      user: reg.user,
      title: `Announcement: ${event.title}`,
      message: `${title} - ${message.slice(0, 80)}...`,
      type: 'announcement',
      link: `/events/${event._id}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      // Emit socket event to the event room
      emitToEvent(event._id, 'new_announcement', {
        announcement,
        eventTitle: event.title,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published and participants notified.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyOrganizedEvents,
  uploadCoverImage,
  getEventAnnouncements,
  createEventAnnouncement,
};
