// src/models/provider-model.js
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";
import crypto from "crypto";

const ProviderModel = {
  async create({ user_id, bio, phone, hourly_rate, referral_code }) {
    try {
      const bookingSlug = crypto.randomBytes(16).toString("hex");

      const { rows } = await query(
        `
        INSERT INTO providers (
          user_id,
          bio,
          phone,
          hourly_rate,
          referral_code,
          booking_slug,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *;
        `,
        [
          user_id,
          bio || "",
          phone || null,
          hourly_rate || null,
          referral_code || null,
          bookingSlug
        ]
      );

      return rows[0];
    } catch (err) {
      logError("DB Error (create provider):", err);
      throw new Error("Failed to create provider profile");
    }
  },

  async updateByUserId(user_id, { bio, phone, hourly_rate, referral_code }) {
    try {
      const { rows } = await query(
        `
        UPDATE providers
        SET bio = COALESCE($1, bio),
            phone = COALESCE($2, phone),
            hourly_rate = COALESCE($3, hourly_rate),
            referral_code = COALESCE($4, referral_code),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $5
        RETURNING *;
        `,
        [bio, phone, hourly_rate, referral_code, user_id]
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
