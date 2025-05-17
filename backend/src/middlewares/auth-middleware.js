//middlewares/auth-middleware.js

import jwt from "jsonwebtoken";
import { logError, logInfo, logDebug } from "../utils/logger.js";
import { query } from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    logInfo("Auth middleware: No token provided.");
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.sub) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    // Fetch user role from DB
    const result = await query(
      `SELECT u.user_id,
          CASE
            WHEN p.provider_id IS NOT NULL THEN 'provider'
            ELSE 'client'
          END AS user_type,
            p.provider_id
          FROM users u
          LEFT JOIN providers p ON p.user_id = u.user_id
          WHERE u.user_id = $1
          LIMIT 1`,
      [decoded.sub]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = {
      provider_id: result.rows[0].provider_id,
      user_type: result.rows[0].user_type,
      user_id: decoded.sub,
    };

   logDebug(
     `Auth middleware: Token verified for user ID ${req.user.user_id} with role ${req.user.user_type}`
   );


    next();
  } catch (error) {
    logError("Auth middleware: Token verification failed", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token is not valid." });
    }

    return res.status(error.status || 500).json({
      message: error.message || "Server error during token verification.",
    });
  }
};

export default authMiddleware;
