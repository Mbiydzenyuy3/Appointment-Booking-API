// services/auth-service.js
import { query } from "../config/db.js";
import { logError } from "../utils/logger.js";
import { findByEmail } from "../models/user-model.js";
import { comparePassword } from "../models/user-model.js";
import jwt from "jsonwebtoken";

// Create a new user
export async function createUser(userData) {
  try {
    const { name, email, password, user_type } = userData;
    const result = await query(
      `INSERT INTO users (name, email, password, user_type) 
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, password, user_type]
    );
    return result.rows[0]; // Return the created user
  } catch (err) {
    logError("Error creating user", err);
    throw new Error("Error creating user");
  }
}

// Get a user by email
export async function getUserByEmail(email) {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0]; // Return user or null if not found
  } catch (err) {
    logError("Error fetching user by email", err);
    throw new Error("Error fetching user");
  }
}

/**
 * Login a user by email and password
 */
export const login = async ({ email, password }) => {
  const user = await findByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials: User not found.");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials: Incorrect password.");
  }

  // Generate JWT token
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { user, token };
};
