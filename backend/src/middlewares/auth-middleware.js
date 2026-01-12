// middlewares/auth-middleware.js
import jwt from "jsonwebtoken";
import { logError, logInfo, logDebug } from "../utils/logger.js";
import { query } from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    logInfo("Auth middleware: No token provided.");
    return res.status(401).json({
      message: "No token provided, authorization denied."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.sub) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    // Validate user exists in database
    const userResult = await query(
      "SELECT user_id, user_type, email FROM users WHERE user_id = $1",
      [decoded.sub]
    );
    if (userResult.rowCount === 0) {
      logInfo("Auth middleware: User not found in database");
      return res.status(401).json({ message: "User not found." });
    }

    const user = userResult.rows[0];

    req.user = {
      user_id: user.user_id,
      user_type: user.user_type,
      provider_id: decoded.provider_id || null,
      email: user.email
    };

    logDebug(
      `Auth middleware: Authenticated user ${req.user.user_id} (${req.user.user_type})`
    );

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    }

    if (error.name === "JsonWebTokenError") {
      logInfo("Auth middleware: Invalid token");
      return res.status(401).json({ message: "Token is not valid." });
    }

    logError("Auth middleware error", error);
    return res.status(500).json({
      message: "Server error during token verification."
    });
  }
};

export default authMiddleware;
