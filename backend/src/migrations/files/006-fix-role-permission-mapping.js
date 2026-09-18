import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 007: Fixing role → permission mapping...");

  // Fetch all permissions
  const allPermissions = await Permission.find({});
  const get = (name) => allPermissions.find(p => p.name === name)?._id;

  // --- NEW CORRECT ROLE MAPPING ---
  const rolePermissionMatrix = {
    "Super Admin": allPermissions.map(p => p._id),

    "Admin": allPermissions
      .filter(p => !["user:disable", "system_activity:read"].includes(p.name))
      .map(p => p._id),

    "Manager": [
      get("lead:read"),
      get("lead:update"),
      get("lead:assign"),
      get("lead:duplicate:read"),
      get("lead:duplicate:update"),
      get("lead:reassign"),
      get("lead:stage:update"),
      get("lead:view_history"),
      get("task:create"),
      get("task:read"),
      get("task:update"),
      get("task:complete"),
      get("meeting:create"),
      get("meeting:read"),
      get("note:add"),
      get("note:read"),
      get("user:view_team"),
      get("dashboard:view"),
      get("reports:view"),
    ].filter(Boolean),

    "Sales Executive": [
      get("lead:read"),
      get("lead:update"),
      get("lead:stage:update"),
      get("task:create"),
      get("task:read"),
      get("task:update"),
      get("meeting:create"),
      get("meeting:read"),
      get("note:add"),
      get("note:read")
    ].filter(Boolean)
  };

  // Fetch existing roles
  const roles = await Role.find({});

  for (const role of roles) {
    const mapping = rolePermissionMatrix[role.name];
    if (mapping) {
      role.permissions = mapping;
      await role.save();
      logger.info(`✔ Updated role: ${role.name}`);
    } else {
      logger.info(`ℹ Skipped (no mapping defined): ${role.name}`);
    }
  }

  logger.info("Migration 007 completed 🎉");
}

export async function down() {
  logger.info("Migration 007 rollback not implemented");
}
