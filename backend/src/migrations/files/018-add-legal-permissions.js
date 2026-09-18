import Permission from "../../modules/permission/permission.model.js";
import Role from "../../modules/role/role.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 018: Adding legal module permissions");

  const newPermissions = [
    {
      name: "legal:create",
      module: "legal",
      action: "create",
      description: "Create legal documents (privacy, terms, etc)"
    },
    {
      name: "legal:read",
      module: "legal",
      action: "read",
      description: "View legal documents"
    },
    {
      name: "legal:update",
      module: "legal",
      action: "update",
      description: "Update legal drafts"
    },
    {
      name: "legal:publish",
      module: "legal",
      action: "publish",
      description: "Publish legal documents"
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

  /* Assign to Super Admin & Admin */
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

  logger.info("Migration 018 completed successfully");
}

export async function down() {
  logger.info("Migration 018 rollback started");

  const perms = await Permission.find({
    name: {
      $in: ["legal:create", "legal:read", "legal:update", "legal:publish"]
    }
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

    logger.info("Removed legal permissions");
  }

  logger.info("Migration 018 rollback completed");
}