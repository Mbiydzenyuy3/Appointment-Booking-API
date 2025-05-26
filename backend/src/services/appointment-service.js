import {
  CreateAppointment,
  cancelAppointment,
  findAppointmentsByUser,
} from '../models/appointment-model.js'

import {
  emitAppointmentBooked,
  emitAppointmentCancelled,
} from '../sockets/socket.js'

import { logError, logInfo } from '../utils/logger.js'

// Book a new appointment
export async function book({
  userId,
  timeslotId,
  appointment_date,
  appointment_time,
}) {
  try {
    const appointment = await CreateAppointment({
      userId,
      timeslotId,
      appointment_date,
      appointment_time,
    })

    emitAppointmentBooked(appointment)
    logInfo(`✅ Appointment booked:`, appointment.appointment_id)
    return appointment
  } catch (err) {
    logError(' Error booking appointment:', err)
    throw new Error(err.message || 'Failed to create appointment')
  }
}
// Cancel an appointment
export async function cancel(appointmentId) {
  try {
    const appointment = await cancelAppointment(appointmentId)
    if (!appointment) return null

    // Emit targeted socket notification
    emitAppointmentCancelled(appointment)

    logInfo(`Appointment cancelled:`, appointment.id)
    return appointment
  } catch (err) {
    logError(' Error cancelling appointment:', err)
    throw new Error(err.message || 'Failed to cancel appointment')
  }
}

// List appointments for a specific user with filters
export async function list(userId, filters) {
  try {
    const appointments = await findAppointmentsByUser(userId, filters)
    logInfo(` Appointments fetched for user:`, userId)
    return appointments
  } catch (err) {
    logError(' Error listing appointments:', err)
    throw new Error(err.message || 'Failed to list appointments')
  }
}
