// src/models/provider-model.js
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";

const ProviderModel = {
  async create({ user_id, bio, rating }) {
    try {
      const { rows } = await query(
        `
        INSERT INTO providers (user_id, bio, rating)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [user_id, bio, rating]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (create provider):", err);
      throw new Error("Failed to create provider profile");
    }
  },

  async updateByUserId(user_id, { bio, rating }) {
    try {
      const { rows } = await query(
        `
      UPDATE providers
      SET bio = $1,
          rating = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
      RETURNING *;
      `,
        [bio, rating, user_id]
      );
      return rows[0];
    } catch (err) {
      logError("DB Error (update provider):", err);
      throw new Error("Failed to update provider profile");
    }
  },

  async listAll({limit = 10, offset = 0}) {
    try {
      const { rows } = await query(
        `
        SELECT 
          p.*, 
          u.name, 
          u.email 
        FROM providers p
        JOIN users u ON p.user_id = u.user_id
        LIMIT $1 OFFSET $2;
        ` , [limit, offset]
      );
      return rows;
    } catch (err) {
      logError("DB Error (list providers):", err);
      throw new Error("Failed to fetch providers");
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
};



export default ProviderModel;
