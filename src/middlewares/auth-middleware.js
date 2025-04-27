import jwt from "jsonwebtoken";
import { logError } from "../utils/logger.js";

// JWT Authentication middleware
export const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from header
  if (!token) {
    logError("Authorization token missing");
    return res.status(401).json({ error: "Authorization token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logError("JWT verification failed", err);
      return res.status(403).json({ error: "Token is not valid" });
    }

    req.user = user; // Set the user information from the JWT token to req.user
    next();
  });
};
