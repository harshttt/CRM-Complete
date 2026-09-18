import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 007: Updating role permission keys...");

  const newPermissions = [
    { name: "role:create", module: "role", action: "create" },
    { name: "role:read", module: "role", action: "read" },
    { name: "role:update", module: "role", action: "update" },
    { name: "role:delete", module: "role", action: "delete" }
  ];

  for (const perm of newPermissions) {
    const exists = await Permission.findOne({ name: perm.name });
    if (!exists) {
      await Permission.create(perm);
      logger.info(`Added permission: ${perm.name}`);
    }
  }

  const allPermDocs = await Permission.find({});
  const get = (name) => allPermDocs.find(p => p.name === name)?._id;

  const superAdminPerms = allPermDocs.map(p => p._id);

  const adminPerms = [
    "role:read",
    "role:update"
  ].map(p => get(p)).filter(Boolean);

  const managerPerms = [
    "role:read"
  ].map(p => get(p)).filter(Boolean);

  const roleMap = {
    "Super Admin": superAdminPerms,
    "Admin": adminPerms,
    "Manager": managerPerms,
    "Sales Executive": []
  };

  const roles = await Role.find({});
  for (const role of roles) {
    const updatedPerms = roleMap[role.name];
    if (updatedPerms) {
      role.permissions = Array.from(new Set([
        ...role.permissions.map(id => id.toString()),
        ...updatedPerms.map(id => id.toString())
      ]));
      await role.save();
      logger.info(`Updated role: ${role.name}`);
    }
  }

  logger.info("Migration 007 completed");
}

export async function down() {
  logger.info("Migration 007 rollback not implemented");
}
