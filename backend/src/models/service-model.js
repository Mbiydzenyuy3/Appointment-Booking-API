// src/models/service-model.js
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";

export async function createService({
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

export async function findAllServices() {
  try {
    const { rows } = await query(`SELECT * FROM services`);
    return rows;
  } catch (err) {
    logError("DB Error (find all services):", err);
    throw new Error("Failed to query all services");
  }
}

export async function findById(serviceId) {
  try {
    const { rows } = await query(
      `SELECT * FROM services WHERE service_id = $1`,
      [serviceId]
    );
    return rows[0];
  } catch (err) {
    logError("DB Error (find by service ID):", err);
    throw new Error("Failed to query provider by service ID");
  }
}

export async function findByProviderId(providerId) {
  try {
    const { rows } = await query(
      `SELECT * FROM services WHERE provider_id = $1`,
      [providerId]
    );
    return rows;
  } catch (err) {
    logError("DB Error (find by services ID):", err);
    throw new Error("Failed to query services by user ID");
  }
}

export async function deleteById(serviceId) {
  const { rows } = await query(
    `DELETE FROM services WHERE service_id = $1 RETURNING *`,
    [serviceId]
  );
  return rows[0];
}

export async function updateById(
  serviceId,
  { providerId, name, description, price, durationMinutes }
) {
  try {
    const { rows } = await query(
      `
      UPDATE services
      SET provider_id = $1,
          name = $2,
          description = $3,
          price = $4,
          duration_minutes = $5
      WHERE service_id = $6
      RETURNING *;
      `,
      [providerId, name, description, price, durationMinutes, serviceId]
    );
    return rows[0];
  } catch (err) {
    logError("DB Error (update service):", err);
    throw new Error("Failed to update service");
  }
}
