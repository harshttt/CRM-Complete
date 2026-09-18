import Permission from "./permission.model.js";
import { cacheGet, cacheSet, cacheDel } from "../../utils/cache.js";
import mongoose from "mongoose";
export class PermissionService {
  static async getAllGrouped(q) {
    const cacheKey = `permissions:grouped_all:${q || ""}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    const data = await Permission.find(filter)
      .select("name module action description")
      .sort({ module: 1, action: 1 })
      .lean();
    const groupedObj = {};
    for (const p of data) {
      if (!groupedObj[p.module]) groupedObj[p.module] = [];
      groupedObj[p.module].push({
        id: String(p._id),
        name: p.name,
        action: p.action,
        description: p.description
      });
    }
    const groupedArray = Object.keys(groupedObj).map(module => ({
      module,
      permissions: groupedObj[module]
    }));
    await cacheSet(cacheKey, groupedArray, 300);
    return groupedArray;
  }
  static async getPermissionById(id) {
    const cacheKey = `permission:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    const perm = await Permission.findById(id).lean();
    if (perm) await cacheSet(cacheKey, perm, 300);
    return perm;
  }
  static async updateDescription(id, description) {
    const updated = await Permission.findByIdAndUpdate(
      id,
      { description },
      { new: true }
    ).lean();
    await cacheDel(`permission:${id}`);
    await cacheDel("permissions:grouped_all");
    return updated;
  }
  static async getUserFinalPermissions(user, flat = false) {
    const cacheKey = `user:finalPermissions:${user._id}:${flat ? "flat" : "grouped"}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;
    const rolePermissionsIds =
      Array.isArray(user.role?.permissions)
        ? user.role.permissions
        : [];
    const rolePerms = rolePermissionsIds.length
      ? await Permission.find({ _id: { $in: rolePermissionsIds } })
        .select("name module action")
        .lean()
      : [];
    const finalMap = new Map();
    for (const p of rolePerms) {
      finalMap.set(String(p._id), {
        id: String(p._id),
        name: p.name,
        module: p.module,
        action: p.action
      });
    }
    for (const override of user.overridePermissions || []) {
      let perm = override.permission;
      if (!perm || !perm.name) {
        perm = await Permission.findById(override.permission)
          .select("name module action")
          .lean();
        if (!perm) continue;
      }
      const entry = {
        id: String(perm._id),
        name: perm.name,
        module: perm.module,
        action: perm.action
      };
      if (override.type === "ADD") finalMap.set(entry.id, entry);
      if (override.type === "REMOVE") finalMap.delete(entry.id);
    }
    if (flat) {
      const flatData = Array.from(finalMap.values());
      await cacheSet(cacheKey, flatData, 300);
      return flatData;
    }

    const grouped = {};
    for (const p of finalMap.values()) {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push({
        id: p.id,
        name: p.name,
        action: p.action
      });
    }
    await cacheSet(cacheKey, grouped, 300);
    return grouped;
  }
  static async invalidateUserCache(userId) {
    await cacheDel(`user:${userId}`);
    await cacheDel(`user:finalPermissions:${userId}`);
    await cacheDel(`user:finalPermissions:${userId}:grouped`);
  }
  static async invalidateRoleCache(roleId) {
    await cacheDel(`role:permissions:${roleId}`);
  }
  static async invalidateUsersByRole(roleId) {
    const users = await mongoose.model("User").find({ role: roleId }).select("_id");
    for (const u of users) {
      await cacheDel(`user:${u._id}`);
      await cacheDel(`user:finalPermissions:${u._id}:grouped`);
    }
  }
  static async getGroupedByIds(ids) {
  if (!ids || !ids.length) return [];

  const data = await Permission.find({ _id: { $in: ids } })
    .select("name module action description")
    .sort({ module: 1, action: 1 })
    .lean();

  const grouped = {};
  for (const p of data) {
    if (!grouped[p.module]) grouped[p.module] = [];
    grouped[p.module].push({
      id: String(p._id),
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
  static _flatFromGrouped(grouped) {
    if (!grouped) return [];
    const flat = [];
    for (const mod in grouped) {
      if (Array.isArray(grouped[mod])) {
        flat.push(...grouped[mod]);
      }
    }
    return flat;
  }
  static async userHasPermission(user, permissionName) {
    if (!user) return false;
    if (user.finalPermissions) {
      const flat = this._flatFromGrouped(user.finalPermissions);
      return flat.some(p => p.name === permissionName);
    }
    const grouped = await this.getUserFinalPermissions(user);
    const flat = this._flatFromGrouped(grouped);
    return flat.some(p => p.name === permissionName);
  }
}