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
  }
};

export default ProviderModel;
