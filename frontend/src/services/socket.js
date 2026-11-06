import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server with ID:', socket.id);
      if (userId) {
        socket.emit('join-user', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });
  } else if (userId) {
    socket.emit('join-user', userId);
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

