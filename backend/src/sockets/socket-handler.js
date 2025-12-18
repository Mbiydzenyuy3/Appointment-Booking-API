//sockets/notification.js
import { logError, logInfo } from '../utils/logger.js'
export const socketHandler = (socket) => {
  logInfo('🛜 Client connected:', socket.id)

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    logInfo(`⚡ Client disconnected: ${socket.id} due to ${reason}`)
  })

  // (Optional) Handle appointment booking event from client (if needed later)
  socket.on('bookAppointment', (data) => {
    logInfo('🗓️ Appointment booking event received:', data)
    // You could emit to others, save to DB, etc.
  })

  // (Optional) Handle appointment cancel event
  socket.on('cancelAppointment', (data) => {
    logInfo('❌ Appointment cancellation event received:', data)
    // Similar action if needed
  })

  // Error handling
  socket.on('error', (err) => {
    logError('Socket error:', err.message)
  })
}
