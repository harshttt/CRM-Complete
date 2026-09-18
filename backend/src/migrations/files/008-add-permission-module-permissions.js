import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 008: Adding new permission module permissions...");

  // -----------------------
  // 1. NEW PERMISSIONS
  // -----------------------
  const newPermissions = [
    { name: "permission:read", module: "permission", action: "read" },
    { name: "permission:update", module: "permission", action: "update" }
  ];

  for (const perm of newPermissions) {
    const exists = await Permission.findOne({ name: perm.name });
    if (!exists) {
      await Permission.create(perm);
      logger.info(`Added permission: ${perm.name}`);
    } else {
      logger.info(`Permission already exists: ${perm.name}`);
    }
  }

  // Reload all permissions after insert
  const allPermDocs = await Permission.find({});
  const get = (name) => allPermDocs.find((p) => p.name === name)?._id;

  // -----------------------
  // 2. ROLE MAPPING
  // -----------------------
  const superAdminPerms = allPermDocs.map((p) => p._id);

  const adminPerms = [
    "permission:read",
    "permission:update"
  ]
    .map((p) => get(p))
    .filter(Boolean);

  const managerPerms = [
    "permission:read"
  ]
    .map((p) => get(p))
    .filter(Boolean);

  const roleMap = {
    "Super Admin": superAdminPerms,
    "Admin": adminPerms,
    "Manager": managerPerms,
    "Sales Executive": [] // they should NOT have permission module access
  };

  // -----------------------
  // 3. APPLY TO ROLES
  // -----------------------
  const roles = await Role.find({});
  for (const role of roles) {
    const addList = roleMap[role.name];
    if (addList) {
      // merge: old + new -> unique
      role.permissions = Array.from(
        new Set([
          ...role.permissions.map((id) => id.toString()),
          ...addList.map((id) => id.toString())
        ])
      );

      await role.save();
      logger.info(`Updated role: ${role.name}`);
    }
  }

  logger.info("Migration 008 completed");
}

export async function down() {
  logger.info("Migration 008 rollback not implemented");
}
