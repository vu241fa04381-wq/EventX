const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const { generateSecureToken, generateQRDataUrl } = require('../services/qrService');
const { emitToUser, emitToEvent } = require('../services/socketService');

// @desc    Register for an event or join waitlist
// @route   POST /api/registrations/:eventId
// @access  Private (Student, Organizer, Admin)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Registration is only available for approved events.',
      });
    }

    // Check registration deadline
    const now = new Date();
    if (new Date(event.registrationDeadline) < now) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed for this event.',
      });
    }

    // Check if user already has an active registration
    const existingReg = await Registration.findOne({
      user: userId,
      event: eventId,
      status: { $in: ['confirmed', 'waitlisted', 'attended'] },
    });

    if (existingReg) {
      return res.status(400).json({
        success: false,
        message: `You are already registered for this event (Status: ${existingReg.status}).`,
        registration: existingReg,
      });
    }

    // Atomic update check for capacity
    // If registeredCount < capacity -> confirmed; else -> waitlist
    let status = 'confirmed';
    let waitlistPosition = null;

    if (event.registeredCount >= event.capacity) {
      status = 'waitlisted';
      waitlistPosition = (event.waitlistCount || 0) + 1;

      // Create waitlist registration
      const registration = await Registration.create({
        user: userId,
        event: eventId,
        status: 'waitlisted',
        waitlistPosition,
      });

      // Increment waitlist count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { waitlistCount: 1 },
      });

      // Notification
      const notification = await Notification.create({
        user: userId,
        title: 'Joined Event Waitlist',
        message: `You are #${waitlistPosition} on the waitlist for "${event.title}". We will notify you immediately if a seat opens up!`,
        type: 'registration',
        link: `/my-registrations`,
      });

      emitToUser(userId, 'notification', notification);

      return res.status(200).json({
        success: true,
        message: `Event is currently at full capacity. You have been added to the waitlist at position #${waitlistPosition}.`,
        registration,
      });
    }

    // Otherwise, capacity is available: confirm registration
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        registeredCount: { $lt: event.capacity },
      },
      {
        $inc: { registeredCount: 1 },
      },
      { new: true }
    );

    // If race condition happened and event filled in between
    if (!updatedEvent) {
      // Add to waitlist instead
      const waitPos = (event.waitlistCount || 0) + 1;
      const regWaitlist = await Registration.create({
        user: userId,
        event: eventId,
        status: 'waitlisted',
        waitlistPosition: waitPos,
      });

      await Event.findByIdAndUpdate(eventId, { $inc: { waitlistCount: 1 } });

      return res.status(200).json({
        success: true,
        message: `The last seat was just claimed. You are now placed on the waitlist (#${waitPos}).`,
        registration: regWaitlist,
      });
    }

    // Create confirmed registration
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      status: 'confirmed',
    });

    // Generate Ticket with QR code
    const ticketId = `EVTX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrToken = generateSecureToken();

    // Data encoded inside the QR payload
    const qrPayload = {
      ticketId,
      qrToken,
      eventId: event._id.toString(),
      eventTitle: event.title,
      userId: userId.toString(),
      userName: req.user.name,
      issueTimestamp: Date.now(),
    };

    const qrCodeDataUrl = await generateQRDataUrl(qrPayload);

    const ticket = await Ticket.create({
      ticketId,
      registration: registration._id,
      event: eventId,
      user: userId,
      qrToken,
      qrCodeDataUrl,
    });

    // Send notification
    const notification = await Notification.create({
      user: userId,
      title: 'Registration Confirmed! 🎉',
      message: `You are successfully registered for "${event.title}". Your digital ticket is ready.`,
      type: 'registration',
      link: `/my-tickets`,
    });

    emitToUser(userId, 'notification', notification);

    res.status(201).json({
      success: true,
      message: 'Registration confirmed! Digital ticket has been generated.',
      registration,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an event registration with automatic waitlist promotion
// @route   PUT /api/registrations/:registrationId/cancel
// @access  Private
const cancelRegistration = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { reason = 'Cancelled by participant' } = req.body;

    const registration = await Registration.findById(registrationId).populate('event');
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.',
      });
    }

    // Check ownership or admin
    if (
      registration.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this registration.',
      });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This registration is already cancelled.',
      });
    }

    if (registration.status === 'attended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a registration that has already been checked in as attended.',
      });
    }

    const previousStatus = registration.status;
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    registration.cancelReason = reason;
    await registration.save();

    const event = await Event.findById(registration.event._id);

    // If a confirmed registration was cancelled, free up a seat
    if (previousStatus === 'confirmed') {
      // Find the next eligible waitlisted user (lowest waitlistPosition or earliest registration)
      const nextWaitlisted = await Registration.findOne({
        event: event._id,
        status: 'waitlisted',
      })
        .sort({ waitlistPosition: 1, createdAt: 1 })
        .populate('user');

      if (nextWaitlisted) {
        // Promote next user from waitlist to confirmed!
        nextWaitlisted.status = 'confirmed';
        nextWaitlisted.waitlistPosition = null;
        await nextWaitlisted.save();

        // Decrement waitlist count
        await Event.findByIdAndUpdate(event._id, {
          $inc: { waitlistCount: -1 },
        });

        // Re-number remaining waitlist positions
        const remainingWaitlist = await Registration.find({
          event: event._id,
          status: 'waitlisted',
        }).sort({ waitlistPosition: 1, createdAt: 1 });

        for (let i = 0; i < remainingWaitlist.length; i++) {
          remainingWaitlist[i].waitlistPosition = i + 1;
          await remainingWaitlist[i].save();
        }

        // Generate Ticket for the promoted user
        const ticketId = `EVTX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const qrToken = generateSecureToken();
        const qrPayload = {
          ticketId,
          qrToken,
          eventId: event._id.toString(),
          eventTitle: event.title,
          userId: nextWaitlisted.user._id.toString(),
          userName: nextWaitlisted.user.name,
          issueTimestamp: Date.now(),
        };
        const qrCodeDataUrl = await generateQRDataUrl(qrPayload);

        await Ticket.create({
          ticketId,
          registration: nextWaitlisted._id,
          event: event._id,
          user: nextWaitlisted.user._id,
          qrToken,
          qrCodeDataUrl,
        });

        // Notify the promoted user!
        const promoNotification = await Notification.create({
          user: nextWaitlisted.user._id,
          title: 'Great News! Waitlist Seat Confirmed! 🎉',
          message: `A seat opened up for "${event.title}" and you have been promoted from the waitlist. Your ticket is ready!`,
          type: 'waitlist_promoted',
          link: `/my-tickets`,
        });

        emitToUser(nextWaitlisted.user._id, 'notification', promoNotification);
      } else {
        // No waitlisted users, decrement registered count
        await Event.findByIdAndUpdate(event._id, {
          $inc: { registeredCount: -1 },
        });
      }
    } else if (previousStatus === 'waitlisted') {
      // Decrement waitlist count
      await Event.findByIdAndUpdate(event._id, {
        $inc: { waitlistCount: -1 },
      });

      // Re-number remaining waitlist positions
      const remainingWaitlist = await Registration.find({
        event: event._id,
        status: 'waitlisted',
      }).sort({ waitlistPosition: 1, createdAt: 1 });

      for (let i = 0; i < remainingWaitlist.length; i++) {
        remainingWaitlist[i].waitlistPosition = i + 1;
        await remainingWaitlist[i].save();
      }
    }

    // Notify user of cancellation
    await Notification.create({
      user: registration.user,
      title: 'Registration Cancelled',
      message: `Your registration for "${event.title}" has been cancelled.`,
      type: 'cancellation',
      link: `/events/${event._id}`,
    });

    res.status(200).json({
      success: true,
      message: 'Registration successfully cancelled.',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name email profileImage' },
      })
      .sort({ createdAt: -1 });

    // Attach tickets for confirmed/attended registrations
    const registrationIds = registrations.map((r) => r._id);
    const tickets = await Ticket.find({ registration: { $in: registrationIds } });

    const ticketMap = {};
    tickets.forEach((t) => {
      ticketMap[t.registration.toString()] = t;
    });

    const enriched = registrations.map((r) => ({
      ...r.toObject(),
      ticket: ticketMap[r._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      registrations: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get participants for an event (Organizer/Admin)
// @route   GET /api/registrations/event/:eventId
// @access  Private (Organizer, Admin)
const getEventParticipants = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Check ownership or admin
    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view participants for this event.',
      });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'name email department college phone profileImage')
      .sort({ createdAt: -1 });

    const registrationIds = registrations.map((r) => r._id);
    const tickets = await Ticket.find({ registration: { $in: registrationIds } });

    const ticketMap = {};
    tickets.forEach((t) => {
      ticketMap[t.registration.toString()] = t;
    });

    const enriched = registrations.map((r) => ({
      ...r.toObject(),
      ticket: ticketMap[r._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        waitlistCount: event.waitlistCount,
      },
      count: enriched.length,
      participants: enriched,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventParticipants,
};
