import { pool } from "../config/db.js";

// Create and book an appointment
export const CreateAppointment = async ({
  timeslotId,
  userId,
  appointment_date,
  appointment_time,
  guest_name,
  guest_email,
  guest_phone,
  is_guest_booking = false
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the timeslot for safe concurrent access
    const slotRes = await client.query(
      `SELECT * FROM time_slots WHERE timeslot_id = $1 FOR UPDATE`,
      [timeslotId]
    );

    const slot = slotRes.rows[0];
    if (!slot) throw new Error("Slot not found");
    if (slot.is_booked) {
      throw new Error("Slot is already booked");
    }

    const {
      provider_id,
      service_id,
      day: slot_day,
      start_time: slot_start_time
    } = slot;

    // Use provided date/time or fallback to slot data
    const finalAppointmentDate = appointment_date || slot_day;
    const finalAppointmentTime = appointment_time || slot_start_time;

    // Create the appointment
    const appointmentRes = await client.query(
      `
      INSERT INTO appointments (
        timeslot_id, user_id, provider_id, service_id, appointment_date, appointment_time,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
      `,
      [
        timeslotId,
        userId,
        provider_id,
        service_id,
        finalAppointmentDate,
        finalAppointmentTime
      ]
    );

    // Mark the slot as booked
    await client.query(
      `UPDATE time_slots SET is_booked = true WHERE timeslot_id = $1`,
      [timeslotId]
    );

    await client.query("COMMIT");
    return appointmentRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ CreateAppointment transaction failed:", err);
    throw err;
  } finally {
    client.release();
  }
};

// Cancel appointment and reopen the timeslot
export const cancelAppointment = async (appointmentId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const apptRes = await client.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 FOR UPDATE`,
      [appointmentId]
    );

    const appointment = apptRes.rows[0];
    if (!appointment) throw new Error("Appointment not found");

    const { timeslot_id } = appointment;

    // Delete the appointment
    await client.query(`DELETE FROM appointments WHERE appointment_id = $1`, [
      appointmentId
    ]);

    // Reopen the time slot
    await client.query(
      `UPDATE time_slots SET is_booked = false WHERE timeslot_id = $1`,
      [timeslot_id]
    );

    await client.query("COMMIT");
    return appointment;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ cancelAppointment transaction failed:", err);
    throw err;
  } finally {
    client.release();
  }
};

// Find all appointments for a specific user
export const findAppointmentsByUser = async (
  userId,
  { startDate, endDate, limit = 10, offset = 0 }
) => {
  let query = `SELECT * FROM appointments WHERE user_id = $1`;
  const params = [userId];
  let i = 2;

  if (startDate) {
    query += ` AND appointment_date >= $${i++}`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND appointment_date <= $${i++}`;
    params.push(endDate);
  }

  query += ` ORDER BY appointment_date DESC, appointment_time DESC LIMIT $${i++} OFFSET $${i++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};
