//sockets/notification.js
import { logError, logInfo } from '../utils/logger.js'

// Track online users: userId → Set of socketIds
const onlineUsers = new Map();

export function isUserOnline(userId) {
  const sockets = onlineUsers.get(userId);
  return sockets ? sockets.size > 0 : false;
}

export const socketHandler = (socket) => {
  logInfo('🛜 Client connected:', socket.id)

  if (socket.user?.sub) {
    const userId = socket.user.sub;
    socket.join(`user:${userId}`);
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
  }

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    logInfo(`⚡ Client disconnected: ${socket.id} due to ${reason}`)
    if (socket.user?.sub) {
      const userId = socket.user.sub;
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) onlineUsers.delete(userId);
      }
    }
  })

  socket.on('bookAppointment', (data) => {
    logInfo('🗓️ Appointment booking event received:', data)
  })

  socket.on('cancelAppointment', (data) => {
    logInfo('❌ Appointment cancellation event received:', data)
  })

  // Error handling
  socket.on('error', (err) => {
    logError('Socket error:', err.message)
  })
}
