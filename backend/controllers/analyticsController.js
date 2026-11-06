const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Ticket = require('../models/Ticket');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// @desc    Get Student Analytics
// @route   GET /api/analytics/student
// @access  Private (Student)
const getStudentAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [registrations, certificates] = await Promise.all([
      Registration.find({ user: userId }).populate('event'),
      Certificate.find({ user: userId }),
    ]);

    const totalRegistrations = registrations.length;
    const attendedCount = registrations.filter((r) => r.status === 'attended').length;
    const now = new Date();
    const upcomingCount = registrations.filter(
      (r) => r.status === 'confirmed' && r.event && new Date(r.event.startDate) >= now
    ).length;
    const certificatesCount = certificates.length;

    // Category breakdown
    const categoryCounts = {};
    registrations.forEach((r) => {
      if (r.event && r.event.category) {
        categoryCounts[r.event.category] = (categoryCounts[r.event.category] || 0) + 1;
      }
    });

    const categoryData = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      value: categoryCounts[cat],
    }));

    // Monthly activity over past 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = registrations.filter((r) => {
        const regDate = new Date(r.registeredAt);
        return regDate.getMonth() === m && regDate.getFullYear() === y;
      }).length;
      monthlyActivity.push({
        month: monthNames[m],
        registrations: count,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalRegistrations,
        attendedCount,
        upcomingCount,
        certificatesCount,
      },
      categoryData,
      monthlyActivity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Organizer Analytics
// @route   GET /api/analytics/organizer
// @access  Private (Organizer, Admin)
const getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user._id;

    // Fetch organizer's events
    const events = await Event.find({ organizer: organizerId });
    const eventIds = events.map((e) => e._id);

    const [registrations, tickets] = await Promise.all([
      Registration.find({ event: { $in: eventIds } }),
      Ticket.find({ event: { $in: eventIds } }),
    ]);

    const totalEvents = events.length;
    const totalRegistrations = registrations.filter(
      (r) => r.status === 'confirmed' || r.status === 'attended'
    ).length;
    const totalWaitlisted = registrations.filter((r) => r.status === 'waitlisted').length;
    const totalCheckedIn = tickets.filter((t) => t.checkedIn).length;
    const attendanceRate =
      totalRegistrations > 0
        ? Math.round((totalCheckedIn / totalRegistrations) * 100)
        : 0;

    // Event-wise registrations & attendance comparison (top 6 recent events)
    const eventWiseStats = events.slice(0, 6).map((e) => {
      const eventRegs = registrations.filter(
        (r) => r.event.toString() === e._id.toString() && (r.status === 'confirmed' || r.status === 'attended')
      ).length;
      const eventAttended = tickets.filter(
        (t) => t.event.toString() === e._id.toString() && t.checkedIn
      ).length;

      return {
        name: e.title.length > 16 ? e.title.slice(0, 16) + '...' : e.title,
        registered: eventRegs,
        attended: eventAttended,
        capacity: e.capacity,
      };
    });

    // Category distribution of events
    const categoryCounts = {};
    events.forEach((e) => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      value: categoryCounts[cat],
    }));

    // Monthly registration trend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const count = registrations.filter((r) => {
        const regDate = new Date(r.registeredAt);
        return regDate.getMonth() === m && regDate.getFullYear() === y;
      }).length;
      monthlyTrend.push({
        month: monthNames[m],
        registrations: count,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalRegistrations,
        totalWaitlisted,
        totalCheckedIn,
        attendanceRate,
      },
      eventWiseStats,
      categoryDistribution,
      monthlyTrend,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Platform Analytics for Admin
// @route   GET /api/analytics/admin
// @access  Private (Admin)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [users, events, registrations, tickets] = await Promise.all([
      User.find({}),
      Event.find({}),
      Registration.find({}),
      Ticket.find({}),
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyGrowth = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();

      const newUsers = users.filter((u) => {
        const dt = new Date(u.createdAt);
        return dt.getMonth() === m && dt.getFullYear() === y;
      }).length;

      const newEvents = events.filter((e) => {
        const dt = new Date(e.createdAt);
        return dt.getMonth() === m && dt.getFullYear() === y;
      }).length;

      const newRegs = registrations.filter((r) => {
        const dt = new Date(r.registeredAt || r.createdAt);
        return dt.getMonth() === m && dt.getFullYear() === y;
      }).length;

      monthlyGrowth.push({
        month: monthNames[m],
        users: newUsers,
        events: newEvents,
        registrations: newRegs,
      });
    }

    // Category distribution across all events
    const categoryMap = {};
    events.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: categoryMap[cat],
    }));

    // User role breakdown
    const roleBreakdown = [
      { name: 'Students', value: users.filter((u) => u.role === 'student').length },
      { name: 'Organizers', value: users.filter((u) => u.role === 'organizer').length },
      { name: 'Admins', value: users.filter((u) => u.role === 'admin').length },
    ];

    res.status(200).json({
      success: true,
      monthlyGrowth,
      categoryDistribution,
      roleBreakdown,
      totals: {
        users: users.length,
        events: events.length,
        registrations: registrations.length,
        tickets: tickets.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentAnalytics,
  getOrganizerAnalytics,
  getAdminAnalytics,
};
