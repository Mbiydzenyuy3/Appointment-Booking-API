
// src/models/slot-model.js
import { query } from "../config/db.js";

export async function createSlot({ providerId, day, startTime, endTime }) {
  try {
    const { rows } = await query(
      `INSERT INTO slot (provider_id, day, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [providerId, day, startTime, endTime]
    );
    return rows[0];
  } catch (err) {
    throw new Error("Failed to create slot");
  }
}

export async function getSlotsByProviderId(providerId) {
  try {
    const { rows } = await query(
      `SELECT * FROM slot WHERE provider_id = $1 ORDER BY day, start_time`,
      [providerId]
    );
    return rows;
  } catch (err) {
    throw new Error("Failed to fetch slots");
  }
}
