import { pool } from "../config/db.js";
import {
  CreateAppointment,
  cancelAppointment, // renamed from deleteAppointment
  findAppointmentsByUser
} from "../models/appointment-model.js";

import {
  emitAppointmentBooked,
  emitAppointmentCancelled
} from "../sockets/socket.js";

import { logError, logInfo } from "../utils/logger.js";

// Book a new appointment
export async function book({
  userId,
  timeslotId,
  appointment_date,
  appointment_time
}) {
  try {
    const appointment = await CreateAppointment({
      userId,
      timeslotId,
      appointment_date,
      appointment_time
    });

    // Emit targeted socket notification (assumes this function does targeting internally)
    emitAppointmentBooked(appointment);

    logInfo(` Appointment booked:`, appointment.appointment_id);
    return appointment;
  } catch (err) {
    logError(" Error booking appointment:", err);
    throw new Error(err.message || "Failed to create appointment");
  }
}

// Cancel appointment
export async function cancel(appointmentId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const apptRes = await client.query(
      "SELECT * FROM appointments WHERE appointment_id = $1 FOR UPDATE",
      [appointmentId]
    );

    const appointment = apptRes.rows[0];
    if (!appointment) throw new Error("Appointment not found");

    await client.query("DELETE FROM appointments WHERE appointment_id = $1", [
      appointmentId
    ]);
    await client.query(
      "UPDATE time_slots SET is_booked = false, is_available = true WHERE timeslot_id = $1",
      [appointment.timeslot_id]
    );

    await client.query("COMMIT");

    emitAppointmentCancelled(appointment);

    logInfo(`Appointment cancelled:`, appointment.id);
    return appointment;
  } catch (err) {
    logError(" Error cancelling appointment:", err);
    throw new Error(err.message || "Failed to cancel appointment");
  }
}

// List appointments for a specific user
export async function list(
  userId,
  { status, startDate, endDate, limit = 10, offset = 0 }
) {
  let query = `SELECT * FROM appointments WHERE user_id = $1`;
  const params = [userId];
  let paramIndex = 2;

  if (status) {
    query += ` AND status = $${paramIndex++}`;
    params.push(status);
  }

  if (startDate) {
    query += ` AND appointment_date >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND appointment_date <= $${paramIndex++}`;
    params.push(endDate);
  }

  query += ` ORDER BY appointment_date DESC, appointment_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  logInfo(`Appointments fetched for user:`, userId);
  return result.rows;
}
