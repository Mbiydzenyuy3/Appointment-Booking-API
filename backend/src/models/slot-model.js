// src/models/slot-model.js
import { pool } from "../config/db.js";

// Create a slot by fetching provider_id from the request
export const createSlot = async ({
  providerId,
  serviceId,
  day,
  startTime,
  endTime
}) => {
  console.log("createSlot called with:", {
    providerId,
    serviceId,
    day,
    startTime,
    endTime
  });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    console.log("Transaction begun");

    // Check for exact duplicate
    console.log("Checking for exact duplicate");
    const exactDuplicate = await client.query(
      `
  SELECT * FROM time_slots
  WHERE provider_id = $1 AND day = $2::DATE AND start_time = $3::TIME AND end_time = $4::TIME
  `,
      [providerId, day, startTime, endTime]
    );
    console.log("Exact duplicate check result:", exactDuplicate.rows.length);

    if (exactDuplicate.rows.length > 0) {
      throw new Error(
        "It looks like this time slot is already scheduled. Please choose a different time."
      );
    }

    // Check for overlapping slots
    console.log("Checking for overlapping slots");
    const overlapCheck = await client.query(
      `
      SELECT * FROM time_slots
      WHERE provider_id = $1
        AND day = $2::DATE
        AND ($3::TIME < end_time AND $4::TIME > start_time)
      `,
      [providerId, day, startTime, endTime]
    );
    console.log("Overlap check result:", overlapCheck.rows.length);

    if (overlapCheck.rows.length > 0) {
      throw new Error(
        "This time conflicts with another appointment. Let's find another available slot."
      );
    }

    // Insert new slot
    console.log("Inserting new slot");
    const newSlotInsert = await client.query(
      `
      INSERT INTO time_slots (
        provider_id, service_id, day, start_time, end_time, is_booked, created_at, updated_at
      ) VALUES ($1, $2::UUID, $3::DATE, $4::TIME, $5::TIME, false, NOW(), NOW())
      RETURNING *
      `,
      [providerId, serviceId, day, startTime, endTime]
    );
    console.log("Insert result:", newSlotInsert.rows[0]);

    await client.query("COMMIT");
    console.log("Transaction committed");
    return newSlotInsert.rows[0];
  } catch (err) {
    console.log("Error in createSlot:", err);
    await client.query("ROLLBACK");
    throw new Error(err.message || "Slot creation failed");
  } finally {
    client.release();
  }
};

// Get all slots for a provider with service information
export async function getSlotsByProviderId(providerId) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT ts.*, s.service_name as name, s.description as service_description, s.price as service_price, s.duration_minutes as service_duration
       FROM time_slots ts
        LEFT JOIN services s ON ts.service_id = s.service_id
        WHERE ts.provider_id = $1
        ORDER BY ts.day, ts.start_time`,
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
    if (!slot)
      throw new Error(
        "We couldn't find that time slot. It may have been removed or booked."
      );
    if (slot.is_booked)
      throw new Error(
        "This appointment is already confirmed and can't be changed. Please contact support if needed."
      );
    if (slot.provider_id !== providerId) throw new Error("Unauthorized");

    // Overlap check
    const overlap = await client.query(
      `SELECT * FROM time_slots
       WHERE provider_id = $1 AND day = $2::DATE AND timeslot_id <> $3 AND ($4::TIME < end_time AND $5::TIME > start_time)`,
      [providerId, slot.day, slotId, startTime, endTime]
    );
    if (overlap.rows.length > 0) {
      throw new Error("Slot overlaps with an existing slot");
    }

    const result = await client.query(
      `UPDATE time_slots SET start_time = $1::TIME, end_time = $2::TIME, service_id = $3::UUID WHERE timeslot_id = $4 RETURNING *`,
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
    if (slot.is_booked)
      throw new Error(
        "This appointment is already confirmed and can't be cancelled here. Please contact the provider."
      );
    if (slot.provider_id !== providerId)
      throw new Error("You don't have permission to modify this slot.");

    await client.query(`DELETE FROM time_slots WHERE timeslot_id = $1`, [
      slotId
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

export async function getSlotById(slotId) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT ts.*, s.service_name as name, s.description as service_description, s.price as service_price, s.duration_minutes as service_duration
        FROM time_slots ts
        LEFT JOIN services s ON ts.service_id = s.service_id
        WHERE ts.timeslot_id = $1`,
      [slotId]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error fetching slot by id:", err);
    throw new Error("Failed to fetch slot");
  } finally {
    client.release();
  }
}

export async function searchAvailableSlots({
  providerId,
  serviceId,
  day,
  limit = 10,
  offset = 0
}) {
  let query = `
    SELECT ts.*, s.service_name as name
    FROM time_slots ts
    JOIN services s ON ts.service_id = s.service_id
    WHERE ts.is_booked = false
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

export const advanceSlots = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get current date in YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // Get all available slots where day < today
    const { rows: slots } = await client.query(
      `SELECT timeslot_id, day FROM time_slots WHERE day < $1 AND is_booked = false`,
      [today]
    );

    for (const slot of slots) {
      let currentDay = slot.day;
      while (currentDay < today) {
        let d = new Date(currentDay);
        d.setDate(d.getDate() + 1);
        if (d.getDay() === 0) {
          // Sunday
          d.setDate(d.getDate() + 1);
        }
        currentDay = d.toISOString().split("T")[0];
      }
      // Update the slot
      await client.query(
        `UPDATE time_slots SET day = $1 WHERE timeslot_id = $2`,
        [currentDay, slot.timeslot_id]
      );
    }

    await client.query("COMMIT");
    return { updated: slots.length };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
