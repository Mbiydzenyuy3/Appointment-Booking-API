import { query } from "../config/db.js";

// Create a slot by fetching provider_id from the service
export async function createSlot({ day, start_time, end_time, service_id }) {
  try {
    // Fetch provider_id using service_id
    const serviceResult = await query(
      `SELECT provider_id FROM services WHERE service_id = $1`,
      [service_id]
    );

    if (serviceResult.rowCount === 0) {
      throw new Error("Service not found");
    }

    const provider_id = serviceResult.rows[0].provider_id;

    // Insert the new slot
    const result = await query(
      `INSERT INTO time_slots (provider_id, day, start_time, end_time, service_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [provider_id, day, start_time, end_time, service_id]
    );

    return result.rows[0]; // Return the created slot
  } catch (err) {
    throw new Error("Failed to create slot");
  }
}

// Get all slots for a provider
export async function getSlotsByProviderId(provider_id) {
  try {
    const result = await query(
      `SELECT * FROM time_slots
       WHERE provider_id = $1
       ORDER BY day, start_time`,
      [provider_id]
    );
    return result.rows; // Return the slot list
  } catch (err) {
    throw new Error("Failed to fetch slots");
  }
}
