// services/auth-service.js
import { query } from "../config/db.js";
import { logError, logInfo } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

// Create a new Google user
export async function createGoogleUser(userData) {
  const client = await query("BEGIN");

  try {
    // Insert user
    const userResult = await query(
      `INSERT INTO users (name, email, password, user_type, google_id, profile_picture, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, email, user_type`,
      [
        userData.name,
        userData.email,
        userData.password, // null for OAuth users
        userData.user_type,
        userData.google_id,
        userData.profile_picture,
        userData.email_verified || true
      ]
    );

    const user = userResult.rows[0];

    // Create provider record if user is a provider
    let providerId = null;
    if (userData.user_type === "provider") {
      const providerInsertResult = await query(
        `INSERT INTO providers (user_id, bio)
         VALUES ($1, $2)
         RETURNING provider_id`,
        [user.user_id, userData.bio || ""]
      );
      providerId = providerInsertResult.rows[0].provider_id;
    }

    await query("COMMIT");

    logInfo(`Google user created successfully: ${userData.email}`);

    return {
      ...user,
      provider_id: providerId
    };
  } catch (err) {
    await query("ROLLBACK");
    logError("Error creating Google user", err);
    throw err;
  }
}

// Get a user by email
export async function getUserByEmail(email) {
  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0]; // Return user or null if not found
  } catch (err) {
    logError("Error fetching user by email", err);
    throw new Error("Error fetching user");
  }
}

// Get a user by Google ID
export async function getUserByGoogleId(googleId) {
  try {
    const result = await query("SELECT * FROM users WHERE google_id = $1", [
      googleId
    ]);
    return result.rows[0]; // Return user or null if not found
  } catch (err) {
    logError("Error fetching user by Google ID", err);
    throw new Error("Error fetching user");
  }
}

// Update user with Google ID
export async function updateUserWithGoogleId(userId, googleId, profileData) {
  try {
    const result = await query(
      `UPDATE users SET 
        google_id = $1, 
        profile_picture = $2, 
        email_verified = true,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING *`,
      [googleId, profileData.picture, userId]
    );
    return result.rows[0];
  } catch (err) {
    logError("Error updating user with Google ID", err);
    throw new Error("Error updating user");
  }
}

// Generate JWT token
export function generateToken(user, providerId = null) {
  return jwt.sign(
    {
      sub: user.user_id,
      email: user.email,
      user_type: user.user_type,
      provider_id: providerId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
