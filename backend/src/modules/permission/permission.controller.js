import mongoose from "mongoose";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { PermissionService } from "./permission.service.js";

export class PermissionController {
  static async getAll(req, res, next) {
    try {
      const { q } = req.query;
      const userPermissions = req.user.finalPermissions;
      if (!userPermissions) {
        return res.json(ApiResponse.success([]));
      }
      let filtered = userPermissions;
      if (q) {
        const lower = q.toLowerCase();
        filtered = {};
        for (const moduleName of Object.keys(userPermissions)) {
          const perms = userPermissions[moduleName].filter(p =>
            p.name.toLowerCase().includes(lower)
          );
          if (perms.length > 0) {
            filtered[moduleName] = perms;
          }
        }
      }
      const result = Object.keys(filtered).map(module => ({
        module,
        permissions: filtered[module]
      }));
      return res.json(ApiResponse.success(result));
    } catch (err) {
      next(err);
    }
  }


  static async updateDescription(req, res, next) {
    try {
      const { id } = req.params;
      const { description } = req.body;
      if (!mongoose.Types.ObjectId.isValid(id))
        throw AppError.badRequest("Invalid permission id");
      if (!description)
        throw AppError.badRequest("description is required");
      const updated = await PermissionService.updateDescription(id, description);
      if (!updated) throw AppError.notFound("Permission not found");
      return res.json(ApiResponse.success(updated));
    } catch (err) {
      next(err);
    }
  }
}