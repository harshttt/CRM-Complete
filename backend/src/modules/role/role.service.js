import Role from "./role.model.js";
import Permission from "../permission/permission.model.js";
import { cacheGet, cacheSet, cacheDel, cacheScanDel } from "../../utils/cache.js";
import { PermissionService } from "../permission/permission.service.js";

export class RoleService {
  static _groupPermissions(permDocs = []) {
    const grouped = {};
    for (const p of permDocs) {
      if (!p) continue;
      const id = String(p._id || p.id || p);
      const module = p.module || "unknown";
      if (!grouped[module]) grouped[module] = [];
      grouped[module].push({
        id,
        name: p.name,
        action: p.action,
        description: p.description
      });
    }
    return Object.keys(grouped).map(module => ({
      module,
      permissions: grouped[module]
    }));
  }
  static getRoleByName(name) {
    return Role.findOne({ name, isDeleted: false });
  }
  static getRoleByLevel(level, excludeId = null) {
    const query = { roleLevel: level, isDeleted: false };
    if (excludeId) query._id = { $ne: excludeId };
    return Role.findOne(query);
  }
  static async createRole(data) {
    if (!data.roleLevel) {
      const last = await Role.findOne().sort({ roleLevel: -1 }).select("roleLevel").lean();
      data.roleLevel = last ? last.roleLevel + 1 : 1;
    }
    const role = await Role.create(data);
    await cacheScanDel("roles:dropdown:");
    await cacheScanDel("roles:paginated:");
    const populated = await Role.findById(role._id).populate("permissions").lean();
    const perms = populated.permissions?.length
      ? populated.permissions
      : await Permission.find({ _id: { $in: data.permissions || [] } }).lean();
    const groupedPermissions = RoleService._groupPermissions(perms);
    return {
      ...populated,
      id: String(populated._id),
      permissions: groupedPermissions
    };
  }
  static async getRoleById(id) {
    const role = await Role.findById(id).populate("permissions").lean();
    if (!role) return null;
    const groupedPermissions = RoleService._groupPermissions(role.permissions);
    const { _id, permissions, ...rest } = role;
    const permissionsCount = role.permissions?.length || 0;
    return {
      ...rest,
      id: String(_id),
      permissionsCount,
      permissions: groupedPermissions
    };
  }
  static async getRoleByIdCached(id) {
    const key = `role:${id}`;
    const cached = await cacheGet(key);
    if (cached) return cached;

    const role = await Role.findById(id).populate("permissions").lean();

    if (role) {
      const transformed = { ...role, id: String(role._id) };
      await cacheSet(key, transformed, 300);
      return transformed;
    }

    return null;
  }
  static async getRolesPaginated({ page, limit, filter, sort, ignoreDeleted = false }) {
    const key = `roles:paginated:${page}:${limit}:${JSON.stringify(filter)}:${JSON.stringify(sort)}:${ignoreDeleted}`;
    const cached = await cacheGet(key);
    if (cached) return cached;
    const result = await Role.paginate({
      page,
      limit,
      filter,
      sort,
      ignoreDeleted
    });
    const ids = result.data.map(r => r._id);
    const roles = await Role.find({ _id: { $in: ids } })
      .setOptions({ ignoreDeleted })
      .select("name description isSystem roleLevel isDeleted createdAt updatedAt")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const fixedRoles = roles.map(r => ({
      id: String(r._id),
      name: r.name,
      description: r.description,
      roleLevel: r.roleLevel,
      isSystem: r.isSystem,
      isDeleted: r.isDeleted,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
    const final = {
      data: fixedRoles,
      page: result.page,
      totalPages: result.totalPages,
      total: result.total
    };
    await cacheSet(key, final, 300);
    return final;
  }
  static async updateRole(id, data) {
    const update = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (Array.isArray(data.permissions)) update.permissions = data.permissions;
    if (data.roleLevel !== undefined) update.roleLevel = data.roleLevel;
    if (data.isSystem !== undefined) update.isSystem = data.isSystem;
    let updated = await Role.findByIdAndUpdate(id, update, { new: true })
      .populate("permissions")
      .lean();
    await cacheDel(`role:${id}`);
    await cacheScanDel("roles:paginated:");
    await cacheScanDel("roles:dropdown:");
    await cacheScanDel("user:finalPermissions:");
    if (!updated) return null;
    const perms = updated.permissions?.length
      ? updated.permissions
      : await Permission.find({ _id: { $in: data.permissions || [] } }).lean();
    const groupedPermissions = RoleService._groupPermissions(perms);
    const { _id, ...rest } = updated;
    return {
      ...rest,
      id: String(_id),
      permissions: groupedPermissions
    };
  }
  static async deleteRole(id) {
    const role = await Role.findById(id).setOptions({ ignoreDeleted: true });
    if (!role) return null;
    await role.softDelete();
    await cacheDel(`role:${id}`);
    await cacheScanDel("roles:paginated:");
    await cacheScanDel("roles:dropdown:");
    await cacheScanDel("user:finalPermissions:");
    return role;
  }
  static async restoreRole(id) {
    const role = await Role.findById(id).setOptions({ ignoreDeleted: true });
    if (!role) return null;
    if (role.isDeleted) await role.restore();
    await cacheDel(`role:${id}`);
    await cacheScanDel("roles:paginated:");
    await cacheScanDel("roles:dropdown:");
    await cacheScanDel("user:finalPermissions:");
    const groupedPermissions = await PermissionService.getGroupedByIds(role.permissions);
    return groupedPermissions;
  }
  static async getRoleDropdownCached({ page, limit, q, roleLevel }) {
    const key = `roles:dropdown:${page}:${limit}:${q || ""}:${roleLevel}`;
    const cached = await cacheGet(key);
    if (cached) return cached;
    const filter = { roleLevel: { $gt: roleLevel } };
    if (q) filter.name = { $regex: q, $options: "i" };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Role.find(filter)
        .select("name roleLevel")
        .sort({ roleLevel: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Role.countDocuments(filter)
    ]);
    const fixed = data.map(r => ({
      id: String(r._id),
      name: r.name,
      roleLevel: r.roleLevel
    }));
    const result = {
      data: fixed,
      page,
      totalPages: Math.ceil(total / limit),
      total
    };
    await cacheSet(key, result, 300);
    return result;
  }
}