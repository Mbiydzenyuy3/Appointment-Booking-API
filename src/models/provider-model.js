import { query } from "../config/db.js";

const ProviderModel = {
  async create({ name, email, userId, service = "barber" }) {
    try {
      const { rows } = await query(
        `INSERT INTO service_provider (name, email, user_id, service)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, email, userId, service]
      );
      return rows[0];
    } catch (err) {
      console.error("DB Error:", err); // Optional: helpful for debugging
      throw new Error("Failed to create service provider");
    }
  },

  async listAll() {
    try {
      const { rows } = await query(
        `SELECT id, name, email, service FROM service_provider`
      );
      return rows;
    } catch (err) {
      throw new Error("Failed to fetch service providers");
    }
  },
};

export default ProviderModel;
