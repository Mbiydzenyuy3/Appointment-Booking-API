import jwt from "jsonwebtoken";

// Secret key from environment variables or fallback to 'dev-secret' if not available
const SECRET = process.env.JWT_SECRET ?? "dev-secret";

// Token expiration time
const EXPIRES_IN = "1h";

// Function to sign the JWT token
export const signToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

// Function to verify the JWT token
export const verifyToken = (token) => jwt.verify(token, SECRET);
