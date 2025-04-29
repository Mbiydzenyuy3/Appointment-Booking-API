// src/services/appointment-service.js
import { CreateAppointment, deleteAppointment, findAppointmentsByUser } from "../models/appointment-model.js";
import {
  emitAppointmentBooked,
  emitAppointmentCancelled,
} from "../sockets/socket.js";
import { logError, logInfo } from "../utils/logger.js";

// Book a new appointment
export async function book({
  userId,
  slotId,
  providerId,
  appointmentDate,
  appointmentTime,
}) {
  try {
    const appointment = await CreateAppointment({
      userId,
      slotId,
      providerId,
      appointmentDate,
      appointmentTime,
    });

    emitAppointmentBooked(appointment);
    logInfo("Appointment booked", appointment.id);
    return appointment;
  } catch (err) {
    logError("Error booking appointment", err);
    throw err;
  }
}


// Cancel an appointment
export async function cancel(appointmentId) {
  try {
    const appointment = await deleteAppointment(appointmentId);
    if (!appointment) return null;
    emitAppointmentCancelled(appointment);
    logInfo("Appointment cancelled", appointment.id);
    return appointment;
  } catch (err) {
    logError("Error cancelling appointment", err);
    throw err;
  }
}

// List appointments for a specific user
export async function list(userId) {
  try {
    return await findAppointmentsByUser(userId);
  } catch (err) {
    logError("Error listing appointments", err);
    throw err;
  }
}
