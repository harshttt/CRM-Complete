import { AppError } from "../utils/appError.js";

/**
 * Middleware to restrict access based on role level.
 * Lower roleLevel = higher privilege (1=SuperAdmin, 2=Admin, 3=Manager, 4=Employee).
 * Usage: requireRole(1, 2, 3) — allows SuperAdmin, Admin, Manager
 */
export function requireRole(...allowedLevels) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw AppError.unauthorized("Unauthorized user");
      }
      const roleLevel = req.user.role?.roleLevel;
      if (roleLevel === undefined || !allowedLevels.includes(roleLevel)) {
        throw AppError.forbidden(
          `This action requires one of the following role levels: ${allowedLevels.join(", ")}`
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
