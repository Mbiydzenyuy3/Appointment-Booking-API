import pool from "../config/db.js";

export default {
  async create({ providerId, startTime, endTime }) {
    const { rows } = await pool.query(
      `INSERT INTO time_slot (provider_id, start_time, end_time) VALUES ($1,$2,$3) RETURNING *`,
      [providerId, startTime, endTime]
    );
    return rows[0]
  },

  async getByProvider(providerId) {
    const { rows } = await pool.query(
      `SELECT * FROM time_slot WHERE provider_id = $1 ORDER BY start_time`, [providerId]
    );
    return rows
  }
};
