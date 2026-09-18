import { AppError } from "../utils/appError.js";

export function permit(permissionName) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw AppError.unauthorized("Unauthorized user");
      }
      const grouped = req.user.finalPermissions || {};
      const flat = [];
      for (const mod in grouped) {
        if (Array.isArray(grouped[mod])) {
          flat.push(...grouped[mod]);
        }
      }
      const hasPermission = flat.some(
        (p) => p.name === permissionName
      );
      if (!hasPermission) {
        throw AppError.forbidden(`Permission '${permissionName}' required`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
