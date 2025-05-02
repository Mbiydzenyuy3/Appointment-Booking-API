// import { query } from "../config/db.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { UserModel, findByEmail } from "../models/user-model.js";
// import { logError } from "../utils/logger.js";

// // Secret and expiration for JWT
// const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
// const JWT_EXPIRES_IN = "1h";

// // Custom Error Class for Authentication Errors
// class AuthError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = "AuthError";
//   }
// }

// // Function to hash the password
// export async function hashPassword(plainPassword) {
//   try {
//     return await bcrypt.hash(plainPassword, 10);
//   } catch (err) {
//     logError("Error hashing password:", err);
//     throw new Error("Error while processing password.");
//   }
// }

// // Function to create a new user
// export async function createUser({ name, email, password, role = "user" }) {
//   try {
//     // Check if the email is already taken (or any other unique constraint checks)
//     const existingUser = await findByEmail(email);
//     if (existingUser) {
//       throw new AuthError("Email already in use.");
//     }

//     // Hash the password
//     const passwordHash = await hashPassword(password);

//     // Create the user (Assuming `UserModel.create` is the correct method for your ORM)
//     const newUser = await UserModel({
//       name,
//       email,
//       password: passwordHash, // Store the hashed password
//     });

//     // If role is provider, insert into providers table
//     if (role === "provider") {
//       await query(`INSERT INTO providers (user_id) VALUES ($1)`, [newUser.id]);
//     }

//     return { ...newUser, role };

//     return newUser; // Return the created user
//   } catch (err) {
//     logError("Error creating user:", err);
//     throw new AuthError("Error creating user.");
//   }
// }

// // Function to verify the password
// export async function verifyPassword(plainPassword, hashedPassword) {
//   try {
//     return await bcrypt.compare(plainPassword, hashedPassword);
//   } catch (err) {
//     logError("Error verifying password:", err);
//     throw new AuthError("Error verifying password.");
//   }
// }

// // Function to sign the JWT token
// export function signToken(payload) {
//   try {
//     return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
//   } catch (err) {
//     logError("Error signing JWT token:", err);
//     throw new Error("Error generating token.");
//   }
// }

// // Function to login a user
// export async function login({ email, password }) {
//   try {
//     const user = await findByEmail(email);
//     if (!user) throw new AuthError("Invalid credentials.");

//     const isPasswordValid = await verifyPassword(password, user.password);
//     if (!isPasswordValid) throw new AuthError("Invalid password.");

//     const token = signToken({
//       sub: user.id,
//       role: user.role,
//       email: user.email,
//     });
//     return { user, token };
//   } catch (err) {
//     if (err instanceof AuthError) {
//       throw err; // Re-throw AuthError as it's related to user credentials
//     }
//     logError("Error during login:", err);
//     throw new AuthError("Login failed. Please try again.");
//   }
// }

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
