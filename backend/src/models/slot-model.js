// src/models/slot-model.js
import { pool } from "../config/db.js";

// Create a slot by fetching provider_id from the request
export const createSlot = async ({
  providerId,
  serviceId,
  day,
  startTime,
  endTime,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check for exact duplicate
    const exactDuplicate = await client.query(
      `
  SELECT * FROM time_slots
  WHERE provider_id = $1 AND day = $2 AND start_time = $3 AND end_time = $4
  `,
      [providerId, day, startTime, endTime]
    );

    if (exactDuplicate.rows.length > 0) {
      throw new Error("An identical slot already exists.");
    }

    // Check for overlapping slots
    const overlapCheck = await client.query(
      `
      SELECT * FROM time_slots
      WHERE provider_id = $1
        AND day = $2
        AND ($3 < end_time AND $4 > start_time)
      `,
      [providerId, day, endTime, startTime]
    );

    if (overlapCheck.rows.length > 0) {
      throw new Error("Slot overlaps with an existing slot.");
    }

    // Insert new slot
    const newSlotInsert = await client.query(
      `
      INSERT INTO time_slots (
        provider_id, service_id, day, start_time, end_time, is_booked, is_available
      ) VALUES ($1, $2, $3, $4, $5, false, true)
      RETURNING *
      `,
      [providerId, serviceId, day, startTime, endTime]
    );

    await client.query("COMMIT");
    return newSlotInsert.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw new Error(err.message || "Slot creation failed");
  } finally {
    client.release();
  }
};

// Get all slots for a provider
export async function getSlotsByProviderId(providerId) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT * FROM time_slots
       WHERE provider_id = $1
       ORDER BY day, start_time`,
      [providerId]
    );
    return result.rows;
  } catch (err) {
    console.error("Error fetching slots:", err);
    throw new Error("Failed to fetch slots");
  } finally {
    client.release();
  }
}

export const updateSlot = async (
  slotId,
  { startTime, endTime, serviceId, providerId }
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch slot to confirm it's not booked and belongs to provider
    const { rows } = await client.query(
      `SELECT * FROM time_slots WHERE timeslot_id = $1`,
      [slotId]
    );
    const slot = rows[0];
    if (!slot) throw new Error(`Slot not found with ID ${slotId}`);
    if (slot.is_booked) throw new Error("Cannot update a booked slot");
    if (slot.provider_id !== providerId) throw new Error("Unauthorized");

    // Overlap check
    const overlap = await client.query(
      `SELECT * FROM time_slots
       WHERE provider_id = $1 AND day = $2 AND timeslot_id <> $3 AND ($4 < end_time AND $5 > start_time)`,
      [providerId, slot.day, slotId, endTime, startTime]
    );
    if (overlap.rows.length > 0) {
      //throw a custom conflict code error
      return res.status(409).json({
        success: true,
        message: "Slot overlaps with an existing slot",
        data: slot,
      });
    }
    const result = await client.query(
      `UPDATE time_slots SET start_time = $1, end_time = $2, service_id = $3 WHERE timeslot_id = $4 RETURNING *`,
      [startTime, endTime, serviceId, slotId]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const deleteSlot = async (slotId, providerId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT * FROM time_slots WHERE timeslot_id = $1`,
      [slotId]
    );
    const slot = rows[0];
    if (!slot) throw new Error("Slot not found");
    if (slot.is_booked) throw new Error("Cannot delete a booked slot");
    if (slot.provider_id !== providerId) throw new Error("Unauthorized");

    await client.query(`DELETE FROM time_slots WHERE timeslot_id = $1`, [
      slotId,
    ]);

    await client.query("COMMIT");
    return slot;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export async function searchAvailableSlots({
  providerId,
  serviceId,
  day,
  limit = 10,
  offset = 0,
}) {
  let query = `
    SELECT ts.*, s.service_name
    FROM time_slots ts
    JOIN services s ON ts.service_id = s.service_id
    WHERE ts.is_available = true AND ts.is_booked = false
  `;

  const params = [];
  let index = 1;

  if (providerId) {
    query += ` AND ts.provider_id = $${index++}`;
    params.push(providerId);
  }

  if (serviceId) {
    query += ` AND ts.service_id = $${index++}`;
    params.push(serviceId);
  }

  if (day) {
    query += ` AND ts.day = $${index++}`;
    params.push(day);
  }

  query += ` ORDER BY ts.day, ts.start_time LIMIT $${index++} OFFSET $${index++}`;
  params.push(limit);
  params.push(offset);

  const result = await pool.query(query, params);
  return result.rows;
}
