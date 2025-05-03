// src/services/appointment-service.js
import {
  CreateAppointment,
  deleteAppointment,
  findAppointmentsByUser,
} from "../models/appointment-model.js";

import {
  emitAppointmentBooked,
  emitAppointmentCancelled,
} from "../sockets/socket.js";

import { logError, logInfo } from "../utils/logger.js";

// Book a new appointment
export async function book({
  userId,
  timeslotId,
  providerId,
  serviceId,
  appointmentDate,
  appointmentTime,
}) {
  try {
    const appointment = await CreateAppointment({
      userId,
      timeslotId,
      providerId,
      serviceId,
      appointmentDate,
      appointmentTime,
    });

    emitAppointmentBooked(appointment);
    logInfo(`✅ Appointment booked:`, appointment.id);
    return appointment;
  } catch (err) {
    logError("❌ Error booking appointment:", err);
    throw new Error("Failed to create appointment");
  }
}

// Cancel an appointment
export async function cancel(appointmentId) {
  try {
    const appointment = await deleteAppointment(appointmentId);
    if (!appointment) return null;

    emitAppointmentCancelled(appointment);
    logInfo(`🗑️ Appointment cancelled:`, appointment.id);
    return appointment;
  } catch (err) {
    logError("❌ Error cancelling appointment:", err);
    throw new Error("Failed to cancel appointment");
  }
}

// List appointments for a specific user
export async function list(userId) {
  try {
    const appointments = await findAppointmentsByUser(userId);
    logInfo(`📄 Appointments fetched for user:`, userId);
    return appointments;
  } catch (err) {
    logError("❌ Error listing appointments:", err);
    throw new Error("Failed to list appointments");
  }
}
