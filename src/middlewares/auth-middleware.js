//middleware/auth-middleware.js

import jwt from "jsonwebtoken";
import {logger as logDebug, logger as logError} from "../utils/logger.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token =
    authHeader && authHeader.startsWith("Bearer")
      ? authHeader.split(" ")[1]
      : null;

  if (!token) {
    logger.warn("Auth middleware: no token provided");
    return res
      .status(401)
      .json({ message: "No token, authorization has been denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    logDebug(`Auth middleware: Token verified for user ID ${req.user.id}`);
    next();
  } catch (error) {
    logError("Auth middleware: token verification failed", err);
    if (err.name === "TokenExpiredError") {
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
