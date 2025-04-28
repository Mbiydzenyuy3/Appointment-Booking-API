//src/controllers/appointment.js
import * as appointmentService from "../services/appointment-service.js";
import { logError } from "../utils/logger.js";
/**
 * Controller function for booking an appointment
 *
 */

//Book a new appointment
export async function CreateAppointment(req, res) {
  try {
     req.user = { id: 1 };

     const { slotId } = req.body.slotId;
     const userId = req.user.id;

    const appointment = await appointmentService.book({
      userId,
      slotId,
      date: new Date(), // or from body if needed
    });

    if (!appointment) {
      return res.status(400).json({ message: "Failed to create appointment" });
    }

    return res.status(201).json({
      message: "Appointment created successfully",
      appointmentId: appointment.id,
    });
  } catch (err) {
    console.error(err);
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
    const appointment = await appointmentService.cancel(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller function for listing all appointments for the authenticated user
 *
 */
export async function listAppointments(req, res, next) {
  try {
    const { user } = req; // Destructure to get user from req
    const appointments = await appointmentService.list(req.user.id); //
    return res.json({ appointments });
  } catch (err) {
    logError("Error fetching list appointments, try again later", err);
    next(err);
  }
}
