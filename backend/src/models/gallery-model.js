// src/models/gallery-model.js
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";

// Add a gallery item; returns the new row
export async function addItem({ providerId, image_url, caption, display_order = 0 }) {
  try {
    const { rows } = await query(
      `INSERT INTO provider_gallery (provider_id, image_url, caption, display_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [providerId, image_url, caption, display_order]
    );
    return rows[0];
  } catch (err) {
    logError("DB Error (addItem gallery):", err);
    throw err;
  }
}

// List all gallery items for a provider (public)
export async function listByProvider(providerId) {
  try {
    const { rows } = await query(
      `SELECT * FROM provider_gallery WHERE provider_id = $1 ORDER BY display_order ASC, created_at ASC`,
      [providerId]
    );
    return rows;
  } catch (err) {
    logError("DB Error (listByProvider gallery):", err);
    throw err;
  }
}

// Delete a gallery item — returns deleted row (or undefined if not found)
export async function deleteItem(galleryId, providerId) {
  try {
    const { rows } = await query(
      `DELETE FROM provider_gallery WHERE gallery_id = $1 AND provider_id = $2 RETURNING *`,
      [galleryId, providerId]
    );
    return rows[0];
  } catch (err) {
    logError("DB Error (deleteItem gallery):", err);
    throw err;
  }
}

// Update caption and/or image_url for a gallery item
export async function updateItem(galleryId, providerId, updates) {
  const fields = [];
  const values = [];

  if (updates.image_url !== undefined) {
    fields.push(`image_url = $${values.length + 1}`);
    values.push(updates.image_url);
  }
  if (updates.caption !== undefined) {
    fields.push(`caption = $${values.length + 1}`);
    values.push(updates.caption);
  }

  if (fields.length === 0) throw new Error("No fields to update");

  values.push(galleryId, providerId);
  const { rows } = await query(
    `UPDATE provider_gallery SET ${fields.join(", ")}
     WHERE gallery_id = $${values.length - 1} AND provider_id = $${values.length}
     RETURNING *`,
    values
  );
  return rows[0];
}

// Count items for a provider
export async function countByProvider(providerId) {
  try {
    const { rows } = await query(
      `SELECT COUNT(*) FROM provider_gallery WHERE provider_id = $1`,
      [providerId]
    );
    return parseInt(rows[0].count, 10);
  } catch (err) {
    logError("DB Error (countByProvider gallery):", err);
    throw err;
  }
}
