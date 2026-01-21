// middlewares/role-middleware.js
import { logDebug } from "../utils/logger.js";

export function requireRole(requiredRole) {
  const normalizedRequiredRole = requiredRole.toLowerCase();

  return function (req, res, next) {
    if (!req.user) {
      logDebug("Role middleware: req.user is missing");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: authentication required"
      });
    }

    const role =
      typeof req.user.user_type === "string"
        ? req.user.user_type.toLowerCase()
        : null;

    logDebug(`Role check: required=${normalizedRequiredRole}, actual=${role}`);

    if (role !== normalizedRequiredRole) {
      logDebug(
        `Forbidden access: requires '${normalizedRequiredRole}', found '${
          role || "undefined"
        }'`
      );

      return res.status(403).json({
        success: false,
        message: `Forbidden: ${normalizedRequiredRole} role required`
      });
    }

    // Extra safety for provider role
    if (normalizedRequiredRole === "provider" && !req.user.provider_id) {
      logDebug("Provider role detected but provider_id missing");

      return res.status(403).json({
        success: false,
        message: "Provider profile not completed"
      });
    }

    next();
  };
}

/**
 * Convenience alias
 * Prefer requireRole("provider") for flexibility
 */
export const requireProvider = requireRole("provider");
