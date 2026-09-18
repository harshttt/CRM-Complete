import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 016: Adding lead duplicate permissions");

  const permissions = [
    {
      name: "lead:duplicate:read",
      module: "lead",
      action: "duplicate_read"
    },
    {
      name: "lead:duplicate:update",
      module: "lead",
      action: "duplicate_update"
    }
  ];

  // Insert if not exists
  for (const perm of permissions) {
    await Permission.updateOne(
      { name: perm.name },
      { $setOnInsert: perm },
      { upsert: true }
    );
  }

  // Fetch permission IDs
  const permDocs = await Permission.find({
    name: { $in: permissions.map(p => p.name) }
  });

  const permIds = permDocs.map(p => p._id);

  // Add to roles
  await Role.updateMany(
    { name: { $in: ["Super Admin", "Admin", "Manager"] } },
    { $addToSet: { permissions: { $each: permIds } } }
  );

  logger.info("Duplicate permissions added successfully");
}

export async function down() {
  logger.info("Rollback duplicate permission");

  const permDocs = await Permission.find({
    name: { $in: ["lead:duplicate:read", "lead:duplicate:update"] }
  });

  const permIds = permDocs.map(p => p._id);

  await Role.updateMany(
    {},
    { $pull: { permissions: { $in: permIds } } }
  );

  await Permission.deleteMany({
    name: { $in: ["lead:duplicate:read", "lead:duplicate:update"] }
  });
}
