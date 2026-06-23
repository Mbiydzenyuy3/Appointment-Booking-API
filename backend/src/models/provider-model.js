import crypto from "crypto";
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";

const ProviderModel = {
  async create(
    { user_id, bio, phone, hourly_rate, referral_code },
    db = { query }
  ) {
    try {
      const bookingSlug = crypto.randomBytes(16).toString("hex");

      const { rows } = await db.query(
        `
        INSERT INTO providers (
          user_id, bio, phone, hourly_rate, referral_code, booking_slug
        )
        VALUES ($1,$2,$3,$4,$5,$6)
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

  async findByUserId(user_id) {
    try {
      const { rows } = await query(
        `SELECT * FROM providers WHERE user_id = $1`,
        [user_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find provider by user_id):", err);
      throw err;
    }
  },

  async findById(provider_id) {
    try {
      const { rows } = await query(
        `SELECT * FROM providers WHERE provider_id = $1`,
        [provider_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find provider by id):", err);
      throw err;
    }
  },

  async updateByUserId(user_id, updates) {
    try {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields
        .map((field, index) => `${field} = $${index + 2}`)
        .join(", ");
      const queryText = `UPDATE providers SET ${setClause} WHERE user_id = $1 RETURNING *`;
      const { rows } = await query(queryText, [user_id, ...values]);
      return rows[0];
    } catch (err) {
      logError("DB Error (update provider by user_id):", err);
      throw err;
    }
  },

  async deleteById(provider_id) {
    try {
      await query(`DELETE FROM providers WHERE provider_id = $1`, [
        provider_id
      ]);
    } catch (err) {
      logError("DB Error (delete provider by id):", err);
      throw err;
    }
  },

  async findByReferralCode(referral_code) {
    try {
      const { rows } = await query(
        `SELECT * FROM providers WHERE referral_code = $1`,
        [referral_code]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find provider by referral code):", err);
      throw err;
    }
  },

  async findByBookingSlug(booking_slug) {
    try {
      const { rows } = await query(
        `SELECT * FROM providers WHERE booking_slug = $1`,
        [booking_slug]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find provider by booking slug):", err);
      throw err;
    }
  },

  async markReferralUsed(user_id, referral_code) {
    try {
      await query(
        `INSERT INTO referrals_used (user_id, referral_code, used_at) VALUES ($1, $2, NOW())`,
        [user_id, referral_code]
      );
    } catch (err) {
      logError("DB Error (mark referral used):", err);
      throw err;
    }
  }
};

export default ProviderModel;
