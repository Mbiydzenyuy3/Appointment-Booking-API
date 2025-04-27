import db from "../config/db.js";

export const createAppointment = async (appointment) => {
  const { slotId, userId } = appointment;
  const { rows } = await db.query(
    `INSERT INTO appointments (slot_id, user_id) VALUES ($1, $2) RETURNING *`,
    [slotId, userId]
  );
  return rows[0];
};

export const deleteAppointment = async (appointmentId) => {
  const { rows } = await db.query(
    `DELETE FROM appointments WHERE id = $1 RETURNING *`,
    [appointmentId]
  );
  return rows[0];
};

export const findAppointmentsByUser = async (userId) => {
  const { rows } = await db.query(
    `SELECT * FROM appointments WHERE user_id = $1`,
    [userId]
  );
  return rows;
};
