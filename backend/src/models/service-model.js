// src/models/service-model.js - Simplified for MVP
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";
import { redisClient } from "../config/redis.js";

const SERVICES_CACHE_KEY = "services:all";
const SERVICES_CACHE_TTL = 300; // 5 minutes

async function invalidateServicesCache() {
  try {
    if (redisClient.isOpen) await redisClient.del(SERVICES_CACHE_KEY);
  } catch { /* non-critical */ }
}

export async function createService({
  providerId,
  service_name,
  description,
  price,
  duration_minutes,
  location,
  additional_description,
  image_url,
  category
}) {
  try {
    // Omit created_at/updated_at from column list — production table may predate
    // those columns; the DEFAULT CURRENT_TIMESTAMP handles them automatically.
    const queryText = `INSERT INTO services (provider_id, service_name, description, price, duration_minutes, location, additional_description, image_url, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING service_id, provider_id,
                service_name AS name,
                description, price,
                duration_minutes AS duration,
                location, additional_description, image_url, category`;
    const params = [
      providerId,
      service_name,
      description,
      price,
      duration_minutes,
      location,
      additional_description,
      image_url,
      category
    ];

    const result = await query(queryText, params);
    await invalidateServicesCache();
    return result.rows[0];
  } catch (err) {
    logError("Failed to create service:", err);
    throw new Error("Failed to create service");
  }
}

export async function findAllServices() {
  try {
    if (redisClient.isOpen) {
      const cached = await redisClient.get(SERVICES_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    }

    const queryText = `SELECT s.service_id, s.provider_id, s.service_name as name, s.description, s.price, s.duration_minutes as duration, s.location, s.category,
                              u.name as provider_name, p.booking_slug,
                              COALESCE(AVG(pr.rating), 0) as average_rating, COUNT(pr.review_id) as review_count
                       FROM services s
                       JOIN providers p ON s.provider_id = p.provider_id
                       JOIN users u ON p.user_id = u.user_id
                       LEFT JOIN provider_reviews pr ON pr.provider_id = p.provider_id
                       GROUP BY s.service_id, s.provider_id, s.service_name, s.description, s.price, s.duration_minutes, s.location, s.category, u.name, p.booking_slug`;

    const result = await query(queryText);
    try {
      if (redisClient.isOpen) {
        await redisClient.set(SERVICES_CACHE_KEY, JSON.stringify(result.rows), { EX: SERVICES_CACHE_TTL });
      }
    } catch { /* non-critical */ }
    return result.rows;
  } catch (err) {
    logError("DB Error (find all services):", err);
    throw new Error("Failed to query all services");
  }
}

export async function searchServices(searchTerm, location = null) {
  try {
    let sql = `SELECT s.service_id, s.provider_id, s.service_name, s.description, s.price, s.duration_minutes, s.category, u.name as provider_name, p.booking_slug
               FROM services s
               JOIN providers p ON s.provider_id = p.provider_id
               JOIN users u ON p.user_id = u.user_id`;
    const params = [];
    let whereClauses = [];

    if (searchTerm && searchTerm.trim() !== "") {
      whereClauses.push(
        `(LOWER(s.service_name) LIKE LOWER($${
          params.length + 1
        }) OR LOWER(u.name) LIKE LOWER($${params.length + 1}))`
      );
      params.push(`%${searchTerm}%`);
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
      `SELECT service_id, provider_id,
              service_name AS name,
              description, price,
              duration_minutes AS duration,
              location, additional_description, image_url, category
       FROM services WHERE service_id = $1`,
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
      `SELECT service_id, provider_id,
              service_name AS name,
              description, price,
              duration_minutes AS duration,
              location, additional_description, image_url, category
       FROM services WHERE provider_id = $1
       ORDER BY created_at DESC NULLS LAST`,
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
  await invalidateServicesCache();
  return rows[0];
}

export async function updateById(serviceId, updates) {
  try {
    // Accept both aliased (name/duration) and raw (service_name/duration_minutes) keys
    const service_name = updates.service_name ?? updates.name;
    const duration_minutes = updates.duration_minutes ?? updates.duration;
    const { description, price, category, location, additional_description, image_url } = updates;
    const { rows } = await query(
      `UPDATE services
       SET service_name = $1,
           description = $2,
           price = $3,
           duration_minutes = $4,
           category = $5,
           location = $6,
           additional_description = $7,
           image_url = $8
       WHERE service_id = $9
       RETURNING service_id, provider_id,
                 service_name AS name,
                 description, price,
                 duration_minutes AS duration,
                 location, additional_description, image_url, category`,
      [service_name, description, price, duration_minutes, category, location, additional_description, image_url, serviceId]
    );
    await invalidateServicesCache();
    return rows[0];
  } catch (err) {
    logError("DB Error (update service):", err);
    throw new Error("Failed to update service");
  }
}
