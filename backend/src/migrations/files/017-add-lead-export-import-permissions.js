import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 017: Adding lead export & import permissions");

  const newPermissions = [
    {
      name: "lead:export",
      module: "lead",
      action: "export",
      description: "Export leads to Excel/CSV"
    },
    {
      name: "lead:import",
      module: "lead",
      action: "import",
      description: "Import leads via CSV/Excel"
    }
  ];

  const createdPermIds = [];

  for (const perm of newPermissions) {
    let existing = await Permission.findOne({ name: perm.name });

    if (!existing) {
      existing = await Permission.create(perm);
      logger.info(`Created permission: ${perm.name}`);
    } else {
      logger.info(`Permission already exists: ${perm.name}`);
    }

    createdPermIds.push(existing._id);
  }

  // Assign to Super Admin & Admin
  const roles = await Role.find({
    name: { $in: ["Super Admin", "Admin"] }
  });

  for (const role of roles) {
    const currentIds = role.permissions.map(id => id.toString());

    const toAdd = createdPermIds.filter(
      id => !currentIds.includes(id.toString())
    );

    if (toAdd.length > 0) {
      role.permissions.push(...toAdd);
      await role.save();
      logger.info(`Updated role: ${role.name}`);
    } else {
      logger.info(`Role already has permissions: ${role.name}`);
    }
  }

  logger.info("Migration 017 completed successfully");
}

export async function down() {
  logger.info("Migration 017 rollback started");

  const perms = await Permission.find({
    name: { $in: ["lead:export", "lead:import"] }
  });

  if (perms.length > 0) {
    const permIds = perms.map(p => p._id);

    await Role.updateMany(
      {},
      { $pull: { permissions: { $in: permIds } } }
    );

    await Permission.deleteMany({
      _id: { $in: permIds }
    });

    logger.info("Removed lead export/import permissions");
  }

  logger.info("Migration 017 rollback completed");
}