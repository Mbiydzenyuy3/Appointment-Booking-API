// src/models/provider-model.js
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";
import crypto from "crypto";

const ProviderModel = {
  async create({ user_id, bio, phone }) {
    try {
      const bookingSlug = crypto.randomBytes(16).toString("hex");

      const { rows } = await query(
        `
        INSERT INTO providers (user_id, bio, phone, booking_slug, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *;
        `,
        [user_id, bio || "", phone || "", bookingSlug]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (create provider):", err);
      throw new Error("Failed to create provider profile");
    }
  },

  async updateByUserId(user_id, { bio, phone }) {
    try {
      const { rows } = await query(
        `UPDATE providers SET bio = $1, phone = $2, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3 RETURNING *`,
        [bio, phone, user_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (update provider):", err);
      throw new Error("Failed to update provider profile");
    }
  },

  async findByUserId(user_id) {
    try {
      const { rows } = await query(
        `SELECT * FROM providers WHERE user_id = $1`,
        [user_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find by user ID):", err);
      throw new Error("Failed to query provider by user ID");
    }
  },

  async findById(provider_id) {
    try {
      const { rows } = await query(
        `
        SELECT
          p.*,
          u.name,
          u.email
        FROM providers p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.provider_id = $1
        `,
        [provider_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find by provider ID):", err);
      throw new Error("Failed to query provider by ID");
    }
  },

  async findByBookingSlug(booking_slug) {
    try {
      const { rows } = await query(
        `
        SELECT
          p.*,
          u.name,
          u.email
        FROM providers p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.booking_slug = $1
        `,
        [booking_slug]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find by booking slug):", err);
      throw new Error("Failed to query provider by booking slug");
    }
  }
};

export default ProviderModel;
