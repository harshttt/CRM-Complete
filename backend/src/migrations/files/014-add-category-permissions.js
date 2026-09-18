import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

const CATEGORY_PERMISSIONS = [
  {
    name: "category:create",
    module: "category",
    action: "create",
    description: "Create category",
  },
  {
    name: "category:read",
    module: "category",
    action: "read",
    description: "View category list/details",
  },
  {
    name: "category:dropdown",
    module: "category",
    action: "read",
    description: "View category dropdown list",
  },
  {
    name: "category:update",
    module: "category",
    action: "update",
    description: "Update category",
  },
  {
    name: "category:delete",
    module: "category",
    action: "delete",
    description: "Delete category",
  },
  {
    name: "category:restore",
    module: "category",
    action: "restore",
    description: "Restore deleted category",
  },
  {
    name: "category:toggle",
    module: "category",
    action: "toggle",
    description: "Enable/Disable category",
  },
];

export async function up() {
  logger.info("Migration 014: Adding category permissions");

  const superAdmin = await Role.findOne({ name: "Super Admin" });

  for (const permData of CATEGORY_PERMISSIONS) {
    let perm = await Permission.findOne({ name: permData.name });

    if (!perm) {
      perm = await Permission.create(permData);
    }

    if (superAdmin && !superAdmin.permissions.includes(perm._id)) {
      superAdmin.permissions.push(perm._id);
    }
  }

  if (superAdmin) {
    await superAdmin.save();
  }

  logger.info("Migration 014 completed: Category permissions added");
}

export async function down() {
  logger.info("Rollback category permissions");

  const names = CATEGORY_PERMISSIONS.map(p => p.name);

  const permIds = await Permission
    .find({ name: { $in: names } })
    .distinct("_id");

  if (!permIds.length) {
    logger.info("Nothing to rollback");
    return;
  }

  await Role.updateMany(
    {},
    { $pull: { permissions: { $in: permIds } } }
  );

  await Permission.deleteMany({ name: { $in: names } });

  logger.info("Rollback completed");
}

