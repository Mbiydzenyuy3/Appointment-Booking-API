// src/services/appointment-service.js
import AppointmentModel from "../models/appointment-model.js";
import {
  emitAppointmentBooked,
  emitAppointmentCancelled,
} from "../sockets/socket.js";
import { logError, logInfo } from "../utils/logger.js";

// Book a new appointment
export async function book({ userId, providerId, slotId, date }) {
  try {
    const appointment = await AppointmentModel.create({
      userId,
      providerId,
      slotId,
      date,
    });

    emitAppointmentBooked(appointment); // Real-time emit
    logInfo("Appointment booked", appointment.id);

    return appointment;
  } catch (err) {
    logError("Error booking appointment", err);
    throw new Error("Unable to book appointment.");
  }
}

// Cancel an appointment
export async function cancel(appointmentId) {
  try {
    const appointment = await AppointmentModel.cancelById(appointmentId);
    if (!appointment) throw new Error("Appointment not found.");

    emitAppointmentCancelled(appointment); // Real-time emit
    logInfo("Appointment cancelled", appointment.id);

    return appointment;
  } catch (err) {
    logError("Error cancelling appointment", err);
    throw new Error("Unable to cancel appointment.");
  }
}

// List appointments for a specific user
export async function list(userId) {
  try {
    const appointments = await AppointmentModel.findByUserId(userId);
    return appointments;
  } catch (err) {
    logError("Error listing appointments", err);
    throw new Error("Unable to list appointments.");
  }
}
