// src/models/service-model.js - Simplified for MVP
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";

export async function createService({
  providerId,
  service_name,
  description,
  price,
  duration_minutes,
  location,
  additional_description,
  image_url
}) {
  try {
    const queryText = `INSERT INTO services (provider_id, service_name, description, price, duration_minutes, location, additional_description, image_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`;
    const params = [
      providerId,
      service_name,
      description,
      price,
      duration_minutes,
      location,
      additional_description,
      image_url
    ];

    const result = await query(queryText, params);
    return result.rows[0];
  } catch (err) {
    logError("Failed to create service:", err);
    throw new Error("Failed to create service");
  }
}

export async function findAllServices() {
  try {
    const queryText = `SELECT s.service_id, s.provider_id, s.service_name as name, s.description, s.price, s.duration_minutes as duration, s.location,
                              u.name as provider_name, p.booking_slug,
                              COALESCE(AVG(pr.rating), 0) as average_rating, COUNT(pr.review_id) as review_count
                       FROM services s
                       JOIN providers p ON s.provider_id = p.provider_id
                       JOIN users u ON p.user_id = u.user_id
                       LEFT JOIN provider_reviews pr ON pr.provider_id = p.provider_id
                       GROUP BY s.service_id, s.provider_id, s.service_name, s.description, s.price, s.duration_minutes, s.location, u.name, p.booking_slug`;

    const result = await query(queryText);
    return result.rows;
  } catch (err) {
    logError("DB Error (find all services):", err);
    throw new Error("Failed to query all services");
  }
}

export async function searchServices(query, location = null) {
  try {
    let sql = `SELECT s.service_id, s.provider_id, s.service_name, s.description, s.price, s.duration_minutes, u.name as provider_name, p.booking_slug
               FROM services s
               JOIN providers p ON s.provider_id = p.provider_id
               JOIN users u ON p.user_id = u.user_id`;
    const params = [];
    let whereClauses = [];

    if (query && query.trim() !== "") {
      whereClauses.push(
        `(LOWER(s.service_name) LIKE LOWER($${
          params.length + 1
        }) OR LOWER(u.name) LIKE LOWER($${params.length + 1}))`
      );
      params.push(`%${query}%`);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ` + whereClauses.join(" AND ");
    }

    const { rows } = await query(sql, params);
    return rows;
  } catch (err) {
    logError("DB Error (search services):", err);
    throw new Error("Failed to search services");
  }
}

export async function findById(serviceId) {
  try {
    const { rows } = await query(
      `SELECT service_id, provider_id, service_name, description, price, duration_minutes FROM services WHERE service_id = $1`,
      [serviceId]
    );
    return rows[0];
  } catch (err) {
    logError("DB Error (find by service ID):", err);
    throw new Error("Failed to query service by ID");
  }
}

export async function findByProviderId(providerId) {
  try {
    const { rows } = await query(
      `SELECT service_id, provider_id, service_name, description, price, duration_minutes FROM services WHERE provider_id = $1`,
      [providerId]
    );
    return rows;
  } catch (err) {
    logError("DB Error (find by provider ID):", err);
    throw new Error("Failed to query services by provider ID");
  }
}

export async function deleteById(serviceId) {
  const { rows } = await query(
    `DELETE FROM services WHERE service_id = $1 RETURNING *`,
    [serviceId]
  );
  return rows[0];
}

export async function updateById(serviceId, updates) {
  try {
    const { service_name, description, price, duration_minutes } = updates;
    const { rows } = await query(
      `
      UPDATE services
      SET service_name = $1,
          description = $2,
          price = $3,
          duration_minutes = $4,
          updated_at = NOW()
      WHERE service_id = $5
      RETURNING *;
      `,
      [service_name, description, price, duration_minutes, serviceId]
    );
    return rows[0];
  } catch (err) {
    logError("DB Error (update service):", err);
    throw new Error("Failed to update service");
  }
}
