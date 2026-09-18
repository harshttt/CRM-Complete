import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 020: Adding user delete permission");
  const permission = {
    name: "user:delete",
    module: "user",
    action: "delete"
  };
  // Create permission if not exists
  await Permission.updateOne(
    { name: permission.name },
    { $setOnInsert: permission },
    { upsert: true }
  );
  // Fetch permission id
  const permDoc = await Permission.findOne({ name: permission.name });
  if (!permDoc) {
    throw new Error("Permission user:delete not found after upsert");
  }
  // Add permission ONLY to Super Admin
  await Role.updateOne(
    { name: "Super Admin" },
    { $addToSet: { permissions: permDoc._id } }
  );
  logger.info("User delete permission added to Super Admin successfully");
}

export async function down() {
  logger.info("Rollback Migration 020: Removing user delete permission");
  const permDoc = await Permission.findOne({ name: "user:delete" });
  if (!permDoc) {
    logger.warn("Permission user:delete not found during rollback");
    return;
  }
  await Role.updateMany(
    {},
    { $pull: { permissions: permDoc._id } }
  );
  await Permission.deleteOne({ _id: permDoc._id });
  logger.info("User delete permission rollback completed");
}