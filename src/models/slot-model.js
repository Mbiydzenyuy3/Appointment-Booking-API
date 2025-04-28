// src/models/slot-model.js
import { query } from "../config/db.js";

const SlotModel = {
  async create({ providerId, startTime, endTime }) {
    try {
      const { rows } = await query(
        `INSERT INTO time_slot (service_provider_id, start_time, end_time)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [providerId, startTime, endTime]
      );
      return rows[0];
    } catch (error) {
      throw new Error("Failed to create time slot");
    }
  },

  async getByProvider(providerId) {
    try {
      const { rows } = await query(
        `SELECT *
         FROM time_slot
         WHERE service_provider_id = $1
         AND is_available = TRUE`,
        [providerId]
      );
      return rows;
    } catch (error) {
      throw new Error("Failed to fetch provider slots");
    }
  },
};

export default SlotModel;
