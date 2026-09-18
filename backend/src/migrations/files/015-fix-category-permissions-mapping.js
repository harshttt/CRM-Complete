import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

const CATEGORY_PERMISSIONS = [
  { name: "category:create", module: "category", action: "create" },
  { name: "category:read", module: "category", action: "read" },
  { name: "category:dropdown", module: "category", action: "read" },
  { name: "category:update", module: "category", action: "update" },
  { name: "category:delete", module: "category", action: "delete" },
  { name: "category:restore", module: "category", action: "restore" },
  { name: "category:toggle", module: "category", action: "toggle" }
];

export async function up() {
  logger.info("Migration 015: Fix category permissions + map to Super Admin");
  for (const perm of CATEGORY_PERMISSIONS) {
    await Permission.updateOne(
      { name: perm.name },
      { $setOnInsert: perm },
      { upsert: true }
    );
  }

  const permIds = await Permission
    .find({ name: { $in: CATEGORY_PERMISSIONS.map(p => p.name) } })
    .distinct("_id");

  await Role.updateOne(
    { name: "Super Admin" },
    { $addToSet: { permissions: { $each: permIds } } }
  );

  logger.info("Category permissions mapped to Super Admin only");
}

export async function down() {
  logger.info("Migration 015 rollback");

  const names = CATEGORY_PERMISSIONS.map(p => p.name);

  const permIds = await Permission
    .find({ name: { $in: names } })
    .distinct("_id");

  await Role.updateMany(
    {},
    { $pull: { permissions: { $in: permIds } } }
  );

  await Permission.deleteMany({ name: { $in: names } });

  logger.info("Rollback complete");
}
