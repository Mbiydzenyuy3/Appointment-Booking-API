// src/models/user-model.js

import { query } from "../config/db.js";

/**
 * Create a new user in the database
 */
export const UserModel = async ({ name, email, password }) => {
  try {
    const { rows } = await query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, password]
    );
    return rows[0];
  } catch (error) {
    throw new Error("Database Error: Failed to create user");
  }
};

/**
 * Find a user by their email address
 */
export const findByEmail = async (email) => {
  try {
    const { rows } = await query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  } catch (error) {
    throw new Error("Database Error: Failed to fetch user by email");
  }
};
