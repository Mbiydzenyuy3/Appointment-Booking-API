// src/services/appointment-service.js
import { CreateAppointment } from "../models/appointment-model.js";
import {
  emitAppointmentBooked,
  emitAppointmentCancelled,
} from "../sockets/socket.js";
import { logError, logInfo } from "../utils/logger.js";

// Book a new appointment
export async function book({ userId, slotId }) {
  try {
    const appointment = await CreateAppointment({
      userId,
      slotId,
    });

    emitAppointmentBooked(appointment); // Real-time emit
    logInfo("Appointment booked", appointment.id);
    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (err) {
    logError("Error booking appointment", err);
    throw err;
  }
}

// Cancel an appointment
export async function cancel(appointmentId) {
  try {
    const appointment = await CreateAppointment.cancelById(appointmentId);
    if (!appointment) throw new Error("Appointment not found.");

    emitAppointmentCancelled(appointment); // Real-time emit
    logInfo("Appointment cancelled", appointment.id);

    return appointment;
  } catch (err) {
    logError("Error cancelling appointment", err);
    next(err);
  }
}

// List appointments for a specific user
export async function list(userId) {
  try {
    const appointments = await CreateAppointment.findByUserId(userId);
    return appointments;
  } catch (err) {
    logError("Error listing appointments", err);
    next(err);
  }
}
