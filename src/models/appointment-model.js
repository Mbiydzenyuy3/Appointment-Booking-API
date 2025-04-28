// src/models/appointment-model.js
import { query } from "../config/db.js"; // ✅ Correct import

export const CreateAppointment = async ({ slotId, userId }) => {
  try {
    const { rows } = await query(
      `INSERT INTO appointment (slot_id, user_id) VALUES ($1, $2) RETURNING *`,
      [slotId, userId]
    );
    return rows[0];
  } catch (err) {
    throw new Error("Failed to create appointment");
  }
};

export const deleteAppointment = async (appointmentId) => {
  try {
    const { rows } = await query(
      `DELETE FROM appointment WHERE id = $1 RETURNING *`,
      [appointmentId]
    );
    return rows[0];
  } catch (err) {
    throw new Error("Failed to delete appointment");
  }
};

export const findAppointmentsByUser = async (userId, slotId) => {
  try {
    const { rows } = await query(
      ` INSERT INTO appointment (slot_id, user_id)
    VALUES ($1, $2)
    RETURNING *;`,
      [userId, slotId]
    );
    return rows;
  } catch (err) {
    throw new Error("Failed to fetch appointments");
  }
};
