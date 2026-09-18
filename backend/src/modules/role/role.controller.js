import mongoose from "mongoose";
import { ApiResponse } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/appError.js";
import { RoleService } from "./role.service.js";
import { updateRoleSchema, createRoleSchema } from "./role.validation.js";
import { PermissionService } from "../permission/permission.service.js";

export class RoleController {
  static async createRole(req, res, next) {
    try {
      const { error, value } = createRoleSchema.validate(req.body);
      if (error) throw AppError.badRequest(error.message);
      const exists = await RoleService.getRoleByName(value.name);
      if (exists) throw AppError.badRequest("Role name already exists");
      const requesterLevel = req.user.roleLevel;
      if (value.roleLevel && value.roleLevel < requesterLevel) {
        throw AppError.forbidden("You cannot assign a higher privilege level");
      }
      if (value.roleLevel) {
        const levelConflict = await RoleService.getRoleByLevel(value.roleLevel);
        if (levelConflict) throw AppError.badRequest("Role level already exists");
      }
      const role = await RoleService.createRole(value);
      return res.json(ApiResponse.success(role, "Role created successfully"));
    } catch (err) {
      next(err);
    }
  }
  static async getAllRoles(req, res, next) {
    try {
      const { page = 1, limit = 10, sort = "-createdAt", q } = req.query;
      const userRoleLevel = req.user.role.roleLevel;
      const filter = { roleLevel: { $gt: userRoleLevel } };
      // if (q) filter.$text = { $search: q };
      if (q && q.trim()) {
          filter.$or = [
            { name: { $regex: q.trim(), $options: "i" } },
            { description: { $regex: q.trim(), $options: "i" } },
          ];
        }
      const sortObj =
        typeof sort === "string" && sort.startsWith("-")
          ? { [sort.slice(1)]: -1 }
          : { createdAt: -1 };

      const paginated = await RoleService.getRolesPaginated({
        page: Number(page),
        limit: Number(limit),
        filter,
        sort: sortObj,
        ignoreDeleted: true
      });

      return res.json(ApiResponse.paginated(paginated));
    } catch (err) {
      next(err);
    }
  }
  static async getRole(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        throw AppError.badRequest("Invalid role id");
      const role = await RoleService.getRoleById(id);
      if (!role) throw AppError.notFound("Role not found");
      return res.json(ApiResponse.success(role));
    } catch (err) {
      next(err);
    }
  }
  static async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        throw AppError.badRequest("Invalid role id");
      const { error, value } = updateRoleSchema.validate(req.body);
      if (error) throw AppError.badRequest(error.message);
      const requesterLevel = req.user.roleLevel;
      if (value.roleLevel && value.roleLevel < requesterLevel) {
        throw AppError.forbidden("You cannot assign a higher privilege level");
      }
      if (value.roleLevel) {
        const conflict = await RoleService.getRoleByLevel(value.roleLevel, id);
        if (conflict) throw AppError.badRequest("Role level already exists");
      }
      const updated = await RoleService.updateRole(id, value);
      if (!updated) throw AppError.notFound("Role not found");
      await PermissionService.invalidateRoleCache(id);
      await PermissionService.invalidateUsersByRole(id);
      return res.json(
        ApiResponse.success(updated, "Role updated successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  static async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id))
        throw AppError.badRequest("Invalid role id");
      const deleted = await RoleService.deleteRole(id);
      if (!deleted) throw AppError.notFound("Role not found");
      await PermissionService.invalidateRoleCache(id);
      await PermissionService.invalidateUsersByRole(id);
      return res.json(
        ApiResponse.success(null, "Role deleted successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  static async restoreRole(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id))
        throw AppError.badRequest("Invalid role id");

      const restored = await RoleService.restoreRole(id);
      if (!restored) throw AppError.notFound("Role not found");

      return res.json(
        ApiResponse.success(restored, "Role restored successfully")
      );
    } catch (err) {
      next(err);
    }
  }
  static async getRoleDropdown(req, res, next) {
    try {
      const { page = 1, limit = 10, q } = req.query;
      const userRoleLevel = req.user.role.roleLevel;
      const result = await RoleService.getRoleDropdownCached({
        page: Number(page),
        limit: Number(limit),
        q,
        roleLevel: userRoleLevel
      });
      return res.json(ApiResponse.paginated(result));
    } catch (err) {
      next(err);
    }
  }
}