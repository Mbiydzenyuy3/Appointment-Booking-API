import * as appointmentService from "../services/appointment-service.js";
import { logError } from "../utils/logger.js";
import { query } from "../config/db.js";

export async function CreateGuestAppointment(req, res) {
  try {
    const {
      timeslotId,
      appointment_date,
      appointment_time,
      guest_name,
      guest_email,
      guest_phone
    } = req.body;

    // Validate required fields for guest booking
    if (
      !timeslotId ||
      !appointment_date ||
      !appointment_time ||
      !guest_name ||
      !guest_email
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide your name, email, and select a time slot to book your appointment."
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guest_email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    // Check if slot is available and within business hours
    const slotCheck = await query(
      `
      SELECT ts.*, s.duration_minutes
      FROM time_slots ts
      JOIN services s ON ts.service_id = s.service_id
      WHERE ts.timeslot_id = $1 AND ts.is_booked = false
    `,
      [timeslotId]
    );

    if (slotCheck.rowCount === 0) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is no longer available. Please choose another time."
      });
    }

    const slot = slotCheck.rows[0];
    const appointmentEnd = new Date(`1970-01-01T${slot.end_time}`);
    const appointmentStart = new Date(`1970-01-01T${slot.start_time}`);
    const appointmentTime = new Date(`1970-01-01T${appointment_time}`);
    const durationMs = slot.duration_minutes * 60 * 1000;

    if (appointmentEnd.getTime() - appointmentStart.getTime() < durationMs) {
      return res.status(400).json({
        success: false,
        message: "This time slot is too short for the selected service."
      });
    }

    // Check if appointment time is within slot hours
    if (
      appointmentTime < appointmentStart ||
      appointmentTime >= appointmentEnd
    ) {
      return res.status(400).json({
        success: false,
        message: "Appointment time must be within the available slot hours."
      });
    }

    // Check for double booking
    const existingBooking = await query(
      `
      SELECT 1 FROM appointments
      WHERE timeslot_id = $1 AND (
        (user_id IS NOT NULL) OR
        (is_guest_booking = true AND guest_email = $2)
      )
    `,
      [timeslotId, guest_email]
    );

    if (existingBooking.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "You already have a booking for this time slot."
      });
    }

    const appointment = await appointmentService.bookAsGuest({
      timeslotId,
      appointment_date,
      appointment_time,
      guest_name,
      guest_email,
      guest_phone
    });

    return res.status(201).json({
      success: true,
      message:
        "Your appointment has been booked successfully! Check your email for confirmation details.",
      data: appointment
    });
  } catch (err) {
    logError("Create guest appointment failed", err);

    // Handle specific error cases
    if (
      err.message.includes("already booked") ||
      err.message.includes("unavailable")
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is no longer available. Please choose another time."
      });
    }

    if (err.message.includes("Slot not found")) {
      return res.status(404).json({
        success: false,
        message:
          "The selected time slot could not be found. It may have been removed."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while booking. Please try again."
    });
  }
}

export async function CreateAppointment(req, res) {
  try {
    const { timeslotId, appointment_date, appointment_time } = req.body;
    const userId = req.user?.user_id;

    // Validate required fields
    if (!userId || !timeslotId || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: "Please select a time slot to book your appointment."
      });
    }

    // Check if slot is available and within business hours
    const slotCheck = await query(
      `
      SELECT ts.*, s.duration_minutes
      FROM time_slots ts
      JOIN services s ON ts.service_id = s.service_id
      WHERE ts.timeslot_id = $1 AND ts.is_booked = false
    `,
      [timeslotId]
    );

    if (slotCheck.rowCount === 0) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is no longer available. Please choose another time."
      });
    }

    const slot = slotCheck.rows[0];
    const appointmentEnd = new Date(`1970-01-01T${slot.end_time}`);
    const appointmentStart = new Date(`1970-01-01T${slot.start_time}`);
    const appointmentTime = new Date(`1970-01-01T${appointment_time}`);
    const durationMs = slot.duration_minutes * 60 * 1000;

    if (appointmentEnd.getTime() - appointmentStart.getTime() < durationMs) {
      return res.status(400).json({
        success: false,
        message: "This time slot is too short for the selected service."
      });
    }

    // Check if appointment time is within slot hours
    if (
      appointmentTime < appointmentStart ||
      appointmentTime >= appointmentEnd
    ) {
      return res.status(400).json({
        success: false,
        message: "Appointment time must be within the available slot hours."
      });
    }

    // Check for double booking by same user
    const existingBooking = await query(
      `
      SELECT 1 FROM appointments
      WHERE timeslot_id = $1 AND user_id = $2
    `,
      [timeslotId, userId]
    );

    if (existingBooking.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "You already have a booking for this time slot."
      });
    }

    const appointment = await appointmentService.book({
      userId,
      timeslotId,
      appointment_date,
      appointment_time
    });

    return res.status(201).json({
      success: true,
      message: "Your appointment has been booked successfully!",
      data: appointment
    });
  } catch (err) {
    logError("Create appointment failed", err);

    // Handle specific error cases
    if (
      err.message.includes("already booked") ||
      err.message.includes("unavailable")
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is no longer available. Please choose another time."
      });
    }

    if (err.message.includes("Slot not found")) {
      return res.status(404).json({
        success: false,
        message:
          "The selected time slot could not be found. It may have been removed."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while booking. Please try again."
    });
  }
}

/**
 * Controller function for canceling an appointment
 */
export async function cancelAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const userId = req.user?.user_id;
    const userType = req.user?.user_type;
    const result = await appointmentService.cancel(
      appointmentId,
      userId,
      userType
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found."
      });
    }

    return res.json({
      success: true,
      message: "Your appointment has been cancelled successfully.",
      data: result
    });
  } catch (err) {
    if (err.message === "Not authorized") {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own appointments."
      });
    }
    logError("Cancel appointment failed", err);
    next(err);
  }
}

export async function listAppointments(req, res, next) {
  try {
    const userId = req.user?.user_id;
    const userType = req.user?.user_type;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const filters = {
      startDate,
      endDate,
      limit: Number(limit),
      offset
    };

    const appointments = await appointmentService.list(
      userId,
      userType,
      filters
    );

    return res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      data: appointments
    });
  } catch (err) {
    logError("List appointments failed", err);
    next(err);
  }
}
