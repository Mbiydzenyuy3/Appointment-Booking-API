import { pool } from "../config/db.js";

export const CreateAppointment = async ({ timeslotId, userId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the slot row for update
    const slotRes = await client.query(
      `SELECT * FROM time_slots WHERE id = $1 FOR UPDATE`,
      [timeslotId]
    );

    const slot = slotRes.rows[0];
    if (!slot) throw new Error("Slot not found");
    if (slot.is_booked || !slot.is_available)
      throw new Error("Slot already booked");

    // Create appointment (derive providerId, serviceId, date, time from slot)
    const { provider_id, service_id, slot_date, slot_time } = slot;

    const appointmentRes = await client.query(
      `INSERT INTO appointments (
        timeslot_id, user_id, provider_id, service_id, appointment_date, appointment_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        timeslotId,
        userId,
        provider_id,
        service_id,
        slot_date,
        slot_time,
        "booked",
      ]
    );

    // Mark slot as booked
    await client.query(
      `UPDATE time_slots SET is_booked = true, is_available = false WHERE id = $1`,
      [timeslotId]
    );

    await client.query("COMMIT");
    return appointmentRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ CreateAppointment transaction failed:", err);
    throw err; // re-throw the original error for better debugging upstream
  } finally {
    client.release();
  }
};

export const cancelAppointment = async (appointmentId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock appointment row to prevent race conditions
    const apptRes = await client.query(
      `SELECT * FROM appointments WHERE id = $1 FOR UPDATE`,
      [appointmentId]
    );
    const appointment = apptRes.rows[0];
    if (!appointment) throw new Error("Appointment not found");

    const timeslotId = appointment.timeslot_id;

    // Delete appointment
    await client.query(`DELETE FROM appointments WHERE id = $1`, [
      appointmentId,
    ]);

    // Free the slot
    await client.query(
      `UPDATE time_slots SET is_booked = false, is_available = true WHERE id = $1`,
      [timeslotId]
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

export const findAppointmentsByUser = async (
  userId,
  { status, startDate, endDate, limit = 10, offset = 0 }
) => {
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
  return result.rows;
};
