import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 011: Adding permission role:restore");

  let perm = await Permission.findOne({ name: "role:restore" });
  if (!perm) {
    perm = await Permission.create({
      name: "role:restore",
      module: "role",
      action: "restore",
      description: "Restore soft-deleted roles"
    });
  }

  const superAdmin = await Role.findOne({ name: "Super Admin" });
  if (superAdmin && !superAdmin.permissions.includes(perm._id)) {
    superAdmin.permissions.push(perm._id);
    await superAdmin.save();
  }

  logger.info("Migration 011 completed");
}

export async function down() {
  logger.info("Migration 011 rollback");

  const perm = await Permission.findOne({ name: "role:restore" });
  if (perm) {
    await Role.updateMany(
      {},
      { $pull: { permissions: perm._id } }
    );
    await Permission.deleteOne({ _id: perm._id });
  }

  logger.info("Migration 011 rollback completed");
}
