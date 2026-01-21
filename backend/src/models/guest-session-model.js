// src/models/guest-session-model.js
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";

const GuestSessionModel = {
  async create({ guest_email }) {
    try {
      const { rows } = await query(
        `
        INSERT INTO guest_sessions (guest_email)
        VALUES ($1)
        RETURNING *;
        `,
        [guest_email]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (create guest session):", err);
      throw new Error("Failed to create guest session");
    }
  },

  async findByEmail(guest_email) {
    try {
      const { rows } = await query(
        "SELECT * FROM guest_sessions WHERE guest_email = $1 AND expires_at > CURRENT_TIMESTAMP",
        [guest_email]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (find guest session by email):", err);
      throw new Error("Failed to query guest session");
    }
  },

  async updateActivity(session_id) {
    try {
      await query(
        "UPDATE guest_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = $1",
        [session_id]
      );
    } catch (err) {
      logError("DB Error (update guest session activity):", err);
      throw new Error("Failed to update guest session activity");
    }
  },

  async cleanupExpired() {
    try {
      await query(
        "DELETE FROM guest_sessions WHERE expires_at <= CURRENT_TIMESTAMP"
      );
    } catch (err) {
      logError("DB Error (cleanup expired sessions):", err);
    }
  }
};

export default GuestSessionModel;
