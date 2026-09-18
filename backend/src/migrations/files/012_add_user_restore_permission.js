import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 012: Adding permission user:restore");
  let perm = await Permission.findOne({ name: "user:restore" });
  if (!perm) {
    perm = await Permission.create({
      name: "user:restore",
      module: "user",
      action: "restore",
      description: "Restore soft-deleted users"
    });
  }
  const superAdmin = await Role.findOne({ name: "Super Admin" });
  if (superAdmin && !superAdmin.permissions.includes(perm._id)) {
    superAdmin.permissions.push(perm._id);
    await superAdmin.save();
  }
  logger.info("Migration 012 completed");
}

export async function down() {
  logger.info("Migration 012 rollback: removing user:restore permission");
  const perm = await Permission.findOne({ name: "user:restore" });
  if (perm) {
    await Role.updateMany({}, { $pull: { permissions: perm._id } });
    await Permission.deleteOne({ _id: perm._id });
  }
  logger.info("Migration 012 rollback completed");
}
