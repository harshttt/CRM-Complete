import User from "../../modules/user/user.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 013: Adding field active=true to all users");
  const result = await User.updateMany(
    { active: { $exists: false } },
    { $set: { active: true } }
  );
  logger.info(`Migration 013 completed: ${result.modifiedCount} users updated`);
}
export async function down() {
  logger.info("Migration 013 rollback: removing active field only where it was auto-added");
  const result = await User.updateMany(
    { active: true },
    { $unset: { active: "" } }
  );
  logger.info(`Migration 013 rollback: ${result.modifiedCount} users modified`);
}