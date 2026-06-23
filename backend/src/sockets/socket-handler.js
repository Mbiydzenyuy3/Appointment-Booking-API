//sockets/notification.js
import { logError, logInfo } from '../utils/logger.js'
export const socketHandler = (socket) => {
  logInfo('🛜 Client connected:', socket.id)

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    logInfo(`⚡ Client disconnected: ${socket.id} due to ${reason}`)
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
