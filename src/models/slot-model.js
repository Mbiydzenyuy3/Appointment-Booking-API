import { query } from "../config/db.js";

export async function createSlot({
  provider_id,
  day,
  start_time,
  end_time,
  service_id,
}) {
  try {
    const { rows } = await query(
      `INSERT INTO time_slots (provider_id, day, start_time, end_time, service_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [provider_id, day, start_time, end_time, service_id]
    );
    return rows[0];
  } catch (err) {
    throw new Error("Failed to create slot");
  }
}

export async function getSlotsByProviderId(provider_id) {
  try {
    const { rows } = await query(
      `SELECT * FROM time_slots
       WHERE provider_id = $1
       ORDER BY day, start_time`,
      [provider_id]
    );
    return rows;
  } catch (err) {
    throw new Error("Failed to fetch slots");
  }
}
