import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel, findByEmail } from "../models/user-model.js";
import { logError } from "../utils/logger.js";

// Secret and expiration for JWT
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = "1h";

// Custom Error Class for Authentication Errors
class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

// Function to hash the password
export async function hashPassword(plainPassword) {
  try {
    return await bcrypt.hash(plainPassword, 10);
  } catch (err) {
    logError("Error hashing password:", err);
    throw new Error("Error while processing password.");
  }
}

// Function to create a new user
export async function createUser({ name, email, password }) {
  try {
    // Check if the email is already taken (or any other unique constraint checks)
    const existingUser = await findByEmail(email);
    if (existingUser) {
      throw new AuthError("Email already in use.");
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the user (Assuming `UserModel.create` is the correct method for your ORM)
    const newUser = await UserModel({
      name,
      email,
      password: passwordHash, // Store the hashed password
    });

    return newUser; // Return the created user
  } catch (err) {
    logError("Error creating user:", err);
    throw new AuthError("Error creating user.");
  }
}

// Function to verify the password
export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    logError("Error verifying password:", err);
    throw new AuthError("Error verifying password.");
  }
}

// Function to sign the JWT token
export function signToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (err) {
    logError("Error signing JWT token:", err);
    throw new Error("Error generating token.");
  }
}

// Function to login a user
export async function login({ email, password }) {
  try {
    const user = await findByEmail(email);
    if (!user) throw new AuthError("Invalid credentials.");

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) throw new AuthError("Invalid password.");

    const token = signToken({ sub: user.id, role: user.role });
    return { user, token };
  } catch (err) {
    if (err instanceof AuthError) {
      throw err; // Re-throw AuthError as it's related to user credentials
    }
    logError("Error during login:", err);
    throw new AuthError("Login failed. Please try again.");
  }
}
