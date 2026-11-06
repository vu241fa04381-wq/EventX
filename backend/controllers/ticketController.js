const Ticket = require('../models/Ticket');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const { emitToUser } = require('../services/socketService');

// @desc    Get user's tickets
// @route   GET /api/tickets/my
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name email profileImage' },
      })
      .populate('registration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name email profileImage' },
      })
      .populate('user', 'name email department college phone profileImage')
      .populate('registration');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Only owner, event organizer, or admin can view
    const isOwner = ticket.user._id.toString() === req.user._id.toString();
    const isOrganizer = ticket.event.organizer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this ticket.',
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and check in a ticket (QR scanner validation)
// @route   POST /api/tickets/checkin
// @access  Private (Organizer, Admin)
const verifyAndCheckInTicket = async (req, res, next) => {
  try {
    const { token, eventId } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'QR token or Ticket ID is required for verification.',
      });
    }

    // Try finding by qrToken or ticketId
    let ticket = await Ticket.findOne({
      $or: [{ qrToken: token }, { ticketId: token }],
    })
      .populate('event')
      .populate('user', 'name email department college phone profileImage')
      .populate('registration');

    // If payload was JSON string from QR
    if (!ticket) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.qrToken || parsed.ticketId) {
          ticket = await Ticket.findOne({
            $or: [{ qrToken: parsed.qrToken }, { ticketId: parsed.ticketId }],
          })
            .populate('event')
            .populate('user', 'name email department college phone profileImage')
            .populate('registration');
        }
      } catch (e) {
        // Not a JSON string, ignore
      }
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Invalid ticket. No matching record found.',
      });
    }

    // Validate if the scanning organizer owns this event (or is admin)
    if (
      ticket.event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        verified: false,
        message: 'You are not authorized to check in tickets for this event.',
      });
    }

    // If eventId was specified, check match
    if (eventId && ticket.event._id.toString() !== eventId.toString()) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: `This ticket is for "${ticket.event.title}", not the selected event.`,
      });
    }

    // Check if registration was cancelled
    if (ticket.registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'This ticket registration was previously cancelled.',
        ticket,
      });
    }

    // Check if already checked in
    if (ticket.checkedIn) {
      return res.status(400).json({
        success: false,
        verified: false,
        alreadyCheckedIn: true,
        message: `Ticket already used! Checked in on ${new Date(
          ticket.checkedInAt
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        ticket,
      });
    }

    // Check-in ticket
    const now = new Date();
    ticket.checkedIn = true;
    ticket.checkedInAt = now;
    ticket.checkedInBy = req.user._id;
    await ticket.save();

    // Update registration status to attended
    await Registration.findByIdAndUpdate(ticket.registration._id, {
      status: 'attended',
      attendedAt: now,
    });

    // Automatically issue Certificate of Participation
    const certId = `CERT-EVTX-${now.getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    let certificate = await Certificate.findOne({
      user: ticket.user._id,
      event: ticket.event._id,
    });

    if (!certificate) {
      certificate = await Certificate.create({
        certificateId: certId,
        user: ticket.user._id,
        event: ticket.event._id,
        ticket: ticket._id,
        recipientName: ticket.user.name,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.startDate,
        organizerName: req.user.name,
        verificationCode,
      });
    }

    // Notify student of successful check-in & certificate readiness
    const checkinNotif = await Notification.create({
      user: ticket.user._id,
      title: 'Checked In Successfully! ✅',
      message: `Welcome to "${ticket.event.title}". Your attendance has been verified, and your Certificate of Participation is now available!`,
      type: 'checkin',
      link: `/my-certificates`,
    });

    emitToUser(ticket.user._id, 'notification', checkinNotif);

    res.status(200).json({
      success: true,
      verified: true,
      message: `Verified! Check-in confirmed for ${ticket.user.name}.`,
      participant: {
        name: ticket.user.name,
        email: ticket.user.email,
        college: ticket.user.college,
        department: ticket.user.department,
        ticketId: ticket.ticketId,
        checkedInAt: ticket.checkedInAt,
      },
      certificateId: certificate.certificateId,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyTickets,
  getTicketById,
  verifyAndCheckInTicket,
};
