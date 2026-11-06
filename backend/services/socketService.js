let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Join personal user notification room
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join event room for live announcements / updates
    socket.on('join_event', (eventId) => {
      if (eventId) {
        socket.join(`event_${eventId}`);
      }
    });

    // Leave event room
    socket.on('leave_event', (eventId) => {
      if (eventId) {
        socket.leave(`event_${eventId}`);
      }
    });

    // Join admin room
    socket.on('join_admin', () => {
      socket.join('admin_channel');
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
};

const getIO = () => {
  return ioInstance;
};

const emitToUser = (userId, eventName, payload) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId.toString()}`).emit(eventName, payload);
  }
};

const emitToEvent = (eventId, eventName, payload) => {
  if (ioInstance && eventId) {
    ioInstance.to(`event_${eventId.toString()}`).emit(eventName, payload);
  }
};

const emitToAdmins = (eventName, payload) => {
  if (ioInstance) {
    ioInstance.to('admin_channel').emit(eventName, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToEvent,
  emitToAdmins,
};
