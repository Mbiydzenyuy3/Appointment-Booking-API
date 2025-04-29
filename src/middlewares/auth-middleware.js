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
    logInfo(`Auth middleware: no token provided`);
    return res
      .status(401)
      .json({ message: "No token, authorization has been denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.sub) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Fetch user role from DB
    const result = await query(
      `SELECT u.id, 
              CASE 
                WHEN sp.user_id IS NOT NULL THEN 'provider'
                ELSE 'user'
              END as role
       FROM users u
       LEFT JOIN service_provider sp ON sp.user_id = u.id
       WHERE u.id = $1
       LIMIT 1`,
      [decoded.sub]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: result.rows[0].id,
      role: result.rows[0].role, // "provider" or "user"
    };

    logDebug(
      `Auth middleware: Token verified for user ID ${req.user.id} with role ${req.user.role}`
    );
    next();
  } catch (error) {
    logError("Auth middleware: token verification failed", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token is not valid" });
    }
    return res.status(error.status || 500).json({
      message: error.message || "server error during token verification",
    });
  }
};

export default authMiddleware;
