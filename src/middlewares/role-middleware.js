//middleware/role-middleware.js
import { logError } from "../utils/logger.js";

import { logError } from "../utils/logger.js";

// Middleware to ensure the user is a provider
export function requireProvider(req, res, next) {
  if (req.user && req.user.role === "provider") {
    return next();
  } else {
    logError("Unauthorized access attempt by non-provider.");
    return res
      .status(403)
      .json({
        error: "Forbidden: You must be a provider to access this route.",
      });
  }
}

// Middleware to ensure the user is a client
export function requireClient(req, res, next) {
  if (req.user && req.user.role === "client") {
    return next();
  } else {
    logError("Unauthorized access attempt by non-client.");
    return res
      .status(403)
      .json({ error: "Forbidden: You must be a client to access this route." });
  }
}
