// src/models/provider-model.js
import { query } from "../config/db.js";

const ProviderModel = {
  async listAll() {
    try {
      const { rows } = await query(`
        SELECT id, service
        FROM service_provider
      `);
      return rows;
    } catch (error) {
      throw new Error("Failed to fetch service providers");
    }
  },
};

export default ProviderModel;
