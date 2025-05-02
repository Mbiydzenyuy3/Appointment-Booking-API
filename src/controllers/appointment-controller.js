//src/controllers/appointment.js
import * as appointmentService from "../services/appointment-service.js";
import { logError } from "../utils/logger.js";

/**
 * Controller function for booking an appointment
 *
 */
export async function CreateAppointment(req, res) {
  try {
    const { slotId } = req.body;
    const userId = req.user.id;

    const appointment = await appointmentService.book({
      slotId,
      // appointmentDate,
      // appointmentTime,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (err) {
    logError("Create appointment failed", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Controller function for canceling an appointment
 *
 */
export async function cancelAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const result = await appointmentService.cancel(appointmentId);

    if (!result) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json({ message: "Appointment cancelled", data: result });
  } catch (err) {
    logError("Cancel appointment failed", err);
    next(err);
  }
}


/**
 * Controller function for listing all appointments for the authenticated user
 *
 */
// List user appointments
export async function listAppointments(req, res, next) {
  try {
    const userId = req.user.id;
    const appointments = await appointmentService.list(userId);

    return res.json({ appointments });
  } catch (err) {
    logError("List appointments failed", err);
    next(err);
  }
}
