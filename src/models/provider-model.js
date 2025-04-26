//models/provider-model.js

import pool from "../config/db.js"

export default {
  async listAll() {
    const { rows } = await pool.query(
      `SELECT id, name, email FROM users WHERE role = 'provider'`
    );
    return rows
  }
}