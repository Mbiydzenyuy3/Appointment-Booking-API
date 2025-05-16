//models/user-model.js

import bcrypt from "bcryptjs"; // For password hashing
import { query } from "../config/db.js";

/**
 * Create a new user in the database
 */
export const UserModel = async ({ name, email, password, user_type }) => {
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await query(
      `INSERT INTO users (name, email, password, user_type)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, name, email`,
      [name, email, hashedPassword, user_type]
    );
    return rows[0]; // Return only necessary fields (excluding password)
  } catch (error) {
    throw new Error(
      `Database Error: Failed to create user. Details: ${error.message}`
    );
  }
};

/**
 * Find a user by their email address
 */
export const findByEmail = async (email) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  } catch (error) {
    throw new Error(
      `Database Error: Failed to fetch user by email. Details: ${error.message}`
    );
  }
};

/**
 * Compare provided password with the stored hashed password
 */
export const comparePassword = async (providedPassword, storedPassword) => {
  try {
    const isMatch = await bcrypt.compare(providedPassword, storedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Error comparing passwords: ${error.message}`);
  }
};
