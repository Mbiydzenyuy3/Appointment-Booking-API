// src/models/appointment-model.js
import { query } from "../config/db.js";

export const CreateAppointment = async ({
  timeslotId,
  userId,
  providerId,
  serviceId,
  appointmentDate,
  appointmentTime,
}) => {
  try {
    const { rows } = await query(
      `INSERT INTO appointments (
        timeslot_id, user_id, provider_id, service_id, appointment_date, appointment_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        timeslotId,
        userId,
        providerId,
        serviceId,
        appointmentDate,
        appointmentTime,
        "booked",
      ]
    );
    return rows[0];
  } catch (err) {
    console.error("❌ Query failed:", err);
    throw new Error("Failed to create appointment");
  }
};

export const deleteAppointment = async (appointmentId) => {
  const { rows } = await query(
    `DELETE FROM appointments WHERE id = $1 RETURNING *`,
    [appointmentId]
  );
  return rows[0];
};

export const findAppointmentsByUser = async (userId) => {
  const { rows } = await query(
    `SELECT * FROM appointments WHERE user_id = $1`,
    [userId]
  );
  return rows;
};
