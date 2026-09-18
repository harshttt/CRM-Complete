import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";
import { clearPermissionAndRoleCache } from "../../utils/cache.js";

export async function up() {
  logger.info("Migration 009: Adding roleLevel to roles...");
  const roles = await Role.find({});
  const roleLevels = {
    "Super Admin": 1,
    "Admin": 2,
    "Manager": 3,
    "Sales Executive": 4
  };

  for (const role of roles) {
    let level = roleLevels[role.name];
    if (!level) {
      const maxLevel = Math.max(...Object.values(roleLevels));
      level = maxLevel + 1;
      roleLevels[role.name] = level;
    }
    role.roleLevel = level;
    await role.save();
    logger.info(`Updated ${role.name} → level ${level}`);
  }
  logger.info("Migration 009 completed.");
}

export async function down() {
  logger.info("Migration 009 rollback: removing roleLevel...");

  const roles = await Role.find({});
  for (const role of roles) {
    role.roleLevel = undefined;
    await role.save();
    logger.info(`Removed roleLevel from ${role.name}`);
  }

  await clearPermissionAndRoleCache();
  logger.info("Cache cleared.");
  logger.info("Migration rollback completed.");
}