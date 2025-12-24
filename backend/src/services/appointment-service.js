import { pool } from "../config/db.js";
import { CreateAppointment } from "../models/appointment-model.js";

import {
  emitAppointmentBooked,
  emitAppointmentCancelled
} from "../sockets/socket.js";

import { sendAppointmentCancellationEmail } from "./email-service.js";
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
export async function cancel(appointmentId, userId, userType) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get appointment with service and provider info
    const apptRes = await client.query(
      `
      SELECT a.*, s.provider_id, u.name as client_name, u.email as client_email, p.name as provider_name, p.email as provider_email
      FROM appointments a
      JOIN time_slots ts ON a.timeslot_id = ts.timeslot_id
      JOIN services s ON ts.service_id = s.service_id
      JOIN users u ON a.user_id = u.user_id
      JOIN users p ON s.provider_id = p.user_id
      WHERE a.appointment_id = $1 FOR UPDATE
    `,
      [appointmentId]
    );

    let appointment = apptRes.rows[0];
    if (!appointment) throw new Error("Appointment not found");

    // Check authorization: client can cancel their own, provider can cancel their service appointments
    const isClientCancelling =
      userType === "client" && appointment.user_id === userId;
    const isProviderCancelling =
      userType === "provider" && appointment.provider_id === userId;

    if (!isClientCancelling && !isProviderCancelling) {
      throw new Error("Not authorized");
    }

    await client.query("DELETE FROM appointments WHERE appointment_id = $1", [
      appointmentId
    ]);
    await client.query(
      "UPDATE time_slots SET is_booked = false, is_available = true WHERE timeslot_id = $1",
      [appointment.timeslot_id]
    );

    await client.query("COMMIT");

    // Send notification if provider cancelled
    if (isProviderCancelling) {
      try {
        await sendAppointmentCancellationEmail(
          appointment.client_email,
          appointment.client_name,
          appointment.provider_name,
          appointment.service_name,
          appointment.appointment_date,
          appointment.appointment_time
        );
        logInfo(
          `Cancellation email sent to client: ${appointment.client_email}`
        );
      } catch (emailError) {
        logError("Failed to send cancellation email", emailError);
        // Don't fail the cancellation if email fails
      }
    }

    emitAppointmentCancelled(appointment);

    logInfo(`Appointment cancelled:`, appointment.appointment_id);
    return appointment;
  } catch (err) {
    await client.query("ROLLBACK");
    logError(" Error cancelling appointment:", err);
    throw new Error(err.message || "Failed to cancel appointment");
  } finally {
    client.release();
  }
}

// List appointments for a specific user
export async function list(
  userId,
  userType,
  { status, startDate, endDate, limit = 10, offset = 0 }
) {
  let query;
  const params = [];
  let paramIndex = 1;

  if (userType === "provider") {
    // For providers, list appointments for their services
    query = `
      SELECT
        a.*,
        s.service_name,
        s.price,
        s.duration_minutes,
        u.name as client_name,
        u.email as client_email
      FROM appointments a
      JOIN time_slots ts ON a.timeslot_id = ts.timeslot_id
      JOIN services s ON ts.service_id = s.service_id
      JOIN users u ON a.user_id = u.user_id
      WHERE s.provider_id = $1
    `;
    params.push(userId);
  } else {
    // For clients, list their booked appointments
    query = `
      SELECT
        a.*,
        s.service_name,
        s.price,
        s.duration_minutes,
        u.name as provider_name,
        u.email as provider_email
      FROM appointments a
      JOIN time_slots ts ON a.timeslot_id = ts.timeslot_id
      JOIN services s ON ts.service_id = s.service_id
      JOIN users u ON s.provider_id = u.user_id
      WHERE a.user_id = $1
    `;
    params.push(userId);
  }

  if (status) {
    query += ` AND a.status = $${paramIndex++}`;
    params.push(status);
  }

  if (startDate) {
    query += ` AND a.appointment_date >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND a.appointment_date <= $${paramIndex++}`;
    params.push(endDate);
  }

  query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  logInfo(`Appointments fetched for ${userType}:`, userId);
  return result.rows;
}
