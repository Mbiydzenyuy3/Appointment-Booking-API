// models/user-model.js - Simplified for MVP

import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

/**
 * Create a new user in the database
 */
export const UserModel = async ({ name, email, password, user_type }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await query(
      `INSERT INTO users (name, email, password, user_type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING user_id, name, email, user_type`,
      [name, email, hashedPassword, user_type]
    );
    return rows[0];
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * Find a user by their email address
 */
export const findByEmail = async (email) => {
  try {
    const { rows } = await query(
      `SELECT user_id, name, email, password, user_type
       FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  } catch (error) {
    throw new Error(`Failed to fetch user by email: ${error.message}`);
  }
};

/**
 * Find user by ID
 */
export const findById = async (userId) => {
  try {
    const { rows } = await query(
      `SELECT user_id, name, email, user_type, created_at, updated_at
       FROM users WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    return rows[0] ?? null;
  } catch (error) {
    throw new Error(`Failed to fetch user by ID: ${error.message}`);
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

export default {
  UserModel,
  findByEmail,
  findById,
  comparePassword
};
