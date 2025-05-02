// src/models/service-model.js
import { query } from "../config/db.js";

export async function createServices({
  providerId,
  name,
  description,
  price,
  durationMinutes,
}) {
  try {
    const { rows } = await query(
      `INSERT INTO services (provider_id, service_name, description, price, duration_minutes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [providerId, name, description, price, durationMinutes]
    );
    return rows[0];
  } catch (err) {
    throw new Error("Failed to create service");
  }
}
