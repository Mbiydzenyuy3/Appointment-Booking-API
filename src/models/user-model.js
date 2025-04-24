import pg from "pg";
const { Pool } = pg;
const pool = new Pool(); // Reads connection params from env vars

export default {
  // Register a new user and return the row
  async register({ name, email, passwordHash, role = "user" }) {
    const { rows } = await pool.query(
      `INSERT INTO users(name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role`,
      [name, email, passwordHash, role]
    );
    return rows[0];
  },

  // Find a user by email
  async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  },
};
