// middleware/role-middleware.js
import { logDebug } from "../utils/logger.js";

export function requireRole(requiredRole) {
  return function (req, res, next) {
    const role = req.user?.user_type?.trim().toLowerCase();

    logDebug(`Role check: required=${requiredRole}, actual=${role}`);
    logDebug("Full user object:", req.user);

    if (role !== requiredRole.toLowerCase()) {
      logDebug(
        `Unauthorized access: requires '${requiredRole}', but found '${
          role || "undefined"
        }'`
      );
      return res.status(403).json({
        success: false,
        message: `Forbidden: ${requiredRole} role required`,
      });
    }

    next();
  };
}

/**
 * Optional legacy alias for provider role.
 * Use requireRole("provider") instead for flexibility.
 */
export const requireProvider = requireRole("provider");