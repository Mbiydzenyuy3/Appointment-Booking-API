import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";

const ProviderAvailabilityModel = {
  async create({ providerId, dayOfWeek, startTime, endTime }) {
    try {
      const { rows } = await query(
        `INSERT INTO provider_availabilities (provider_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [providerId, dayOfWeek, startTime, endTime]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (create availability):", err);
      throw new Error("Failed to create availability");
    }
  },

  async getByProvider(providerId) {
    try {
      const { rows } = await query(
        `SELECT * FROM provider_availabilities WHERE provider_id = $1 ORDER BY day_of_week, start_time`,
        [providerId]
      );
      return rows;
    } catch (err) {
      logError("DB Error (get availabilities):", err);
      throw new Error("Failed to get provider availabilities");
    }
  },

  async update(id, { dayOfWeek, startTime, endTime }) {
    try {
      const { rows } = await query(
        `UPDATE provider_availabilities
         SET day_of_week = $1, start_time = $2, end_time = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [dayOfWeek, startTime, endTime, id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (update availability):", err);
      throw new Error("Failed to update availability");
    }
  },

  async delete(id) {
    try {
      await query(`DELETE FROM provider_availabilities WHERE id = $1`, [id]);
      return true;
    } catch (err) {
      logError("DB Error (delete availability):", err);
      throw new Error("Failed to delete availability");
    }
  },
};

export default ProviderAvailabilityModel;
