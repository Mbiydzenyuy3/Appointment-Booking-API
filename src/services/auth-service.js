//services/auth-service.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/user-model.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = "1h";

// Function to hash the password
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

// Function to create a new user
export async function createUser({ name, email, password, role = "user" }) {
  const passwordHash = await hashPassword(password);
  return UserModel.register({ name, email, password: passwordHash, role });
}

// Function to verify the password
export async function verifyPassword(Password, hashedPassword) {
  return bcrypt.compare(Password, hashedPassword);
}

// Function to sign the JWT token
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Function to login a user
export async function login({ email, password }) {
  const user = await UserModel.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid password");

  const token = signToken({ sub: user.id, role: user.role });
  return { user, token };
}
