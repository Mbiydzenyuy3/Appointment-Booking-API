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
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const exactDuplicate = await client.query(
      `
  SELECT * FROM time_slots
  WHERE provider_id = $1 AND day = $2::DATE AND start_time = $3::TIME AND end_time = $4::TIME
  `,
      [providerId, day, startTime, endTime]
    );

    if (exactDuplicate.rows.length > 0) {
      throw new Error(
        "It looks like this time slot is already scheduled. Please choose a different time."
      );
    }

    const overlapCheck = await client.query(
      `
      SELECT * FROM time_slots
      WHERE provider_id = $1
        AND day = $2::DATE
        AND ($3::TIME < end_time AND $4::TIME > start_time)
      `,
      [providerId, day, startTime, endTime]
    );

    if (overlapCheck.rows.length > 0) {
      throw new Error(
        "This time conflicts with another appointment. Let's find another available slot."
      );
    }

    const newSlotInsert = await client.query(
      `
      INSERT INTO time_slots (
        provider_id, service_id, day, start_time, end_time, is_booked, created_at, updated_at
      ) VALUES ($1, $2::UUID, $3::DATE, $4::TIME, $5::TIME, false, NOW(), NOW())
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

// Get all slots for a provider with service information
export async function getSlotsByProviderId(providerId) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT ts.*, s.service_name, s.description as service_description, s.price as service_price, s.duration_minutes as service_duration
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
      `SELECT ts.*, s.service_name, s.description as service_description, s.price as service_price, s.duration_minutes as service_duration
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
    SELECT ts.*, s.service_name as name, u.user_id as provider_user_id
    FROM time_slots ts
    JOIN services s ON ts.service_id = s.service_id
    JOIN providers p ON ts.provider_id = p.provider_id
    JOIN users u ON p.user_id = u.user_id
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
  let slots = result.rows;

  // Filter out slots that conflict with Google Calendar events.
  // Batch by provider: one getCalendarEvents call per unique provider, then filter locally.
  if (slots.length > 0) {
    const { getCalendarEvents } = await import("../services/calendar-service.js");

    // Group slots by provider_user_id
    const providerSlotMap = new Map();
    for (const slot of slots) {
      const pid = slot.provider_user_id;
      if (!providerSlotMap.has(pid)) providerSlotMap.set(pid, []);
      providerSlotMap.get(pid).push(slot);
    }

    const filteredSlots = [];
    for (const [providerId, providerSlots] of providerSlotMap.entries()) {
      // Compute the full time range for this provider's slots in one shot
      const starts = providerSlots.map(s => new Date(`${s.day}T${s.start_time}`));
      const ends   = providerSlots.map(s => new Date(`${s.day}T${s.end_time}`));
      const rangeStart = new Date(Math.min(...starts) - 60 * 60 * 1000); // 1h buffer
      const rangeEnd   = new Date(Math.max(...ends)   + 60 * 60 * 1000);

      // One API call per provider (returns [] when calendar sync not enabled)
      const events = await getCalendarEvents(providerId, rangeStart, rangeEnd);
      const confirmedEvents = events.filter(e => e.status === "confirmed");

      for (const slot of providerSlots) {
        const slotStart = new Date(`${slot.day}T${slot.start_time}`);
        const slotEnd   = new Date(`${slot.day}T${slot.end_time}`);

        const hasConflict = confirmedEvents.some(e => {
          const eStart = new Date(e.start.dateTime || e.start.date);
          const eEnd   = new Date(e.end.dateTime   || e.end.date);
          return slotStart < eEnd && slotEnd > eStart;
        });

        if (!hasConflict) filteredSlots.push(slot);
      }
    }

    slots = filteredSlots;
  }

  return slots;
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
        const d = new Date(currentDay + "T00:00:00Z"); // parse as UTC to avoid DST shift
        d.setUTCDate(d.getUTCDate() + 1);
        // Skip weekends: 0 = Sunday, 6 = Saturday
        if (d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 2); // Sat → Mon
        if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1); // Sun → Mon
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
