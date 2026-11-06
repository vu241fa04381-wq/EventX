const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const { emitToUser } = require('../services/socketService');

// @desc    Get complete platform stats for Admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalOrganizers,
      totalEvents,
      pendingEvents,
      approvedEvents,
      totalRegistrations,
      totalCheckedIn,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'organizer' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'approved' }),
      Registration.countDocuments(),
      Ticket.countDocuments({ checkedIn: true }),
    ]);

    const attendanceRate =
      totalRegistrations > 0
        ? Math.round((totalCheckedIn / totalRegistrations) * 100)
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalOrganizers,
        totalEvents,
        pendingEvents,
        approvedEvents,
        totalRegistrations,
        totalCheckedIn,
        attendanceRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search, role filters, pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 15 } = req.query;

    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status !== undefined && status !== 'all') {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own admin account.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `User role changed to ${role}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending event approvals
// @route   GET /api/admin/events/pending
// @access  Private (Admin)
const getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('organizer', 'name email college department profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve an event
// @route   PUT /api/admin/events/:id/approve
// @access  Private (Admin)
const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    event.status = 'approved';
    event.rejectionReason = '';
    await event.save();

    // Send notification to organizer
    const notification = await Notification.create({
      user: event.organizer._id,
      title: 'Event Approved! 🎉',
      message: `Your event "${event.title}" has been approved by the administrators and is now live for registrations!`,
      type: 'approval',
      link: `/events/${event._id}`,
    });

    emitToUser(event.organizer._id, 'notification', notification);

    res.status(200).json({
      success: true,
      message: 'Event approved successfully and published to public catalog.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject an event
// @route   PUT /api/admin/events/:id/reject
// @access  Private (Admin)
const rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id).populate('organizer');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    event.status = 'rejected';
    event.rejectionReason = reason || 'Does not meet platform guidelines.';
    await event.save();

    // Send notification to organizer
    const notification = await Notification.create({
      user: event.organizer._id,
      title: 'Event Submission Update',
      message: `Your event "${event.title}" could not be approved: ${event.rejectionReason}`,
      type: 'rejection',
      link: `/organizer/events`,
    });

    emitToUser(event.organizer._id, 'notification', notification);

    res.status(200).json({
      success: true,
      message: 'Event rejected.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events for Admin management
// @route   GET /api/admin/events
// @access  Private (Admin)
const getAllEventsAdmin = async (req, res, next) => {
  try {
    const { search, status, category, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email college')
      .sort({ createdAt: -1 })
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

module.exports = {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAllEventsAdmin,
};
