import User from "../../modules/user/user.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 010: Adding parentUser and ancestorIds to users...");
  const result = await User.updateMany(
    {},
    {
      $set: {
        parentUser: null,
        ancestorIds: []
      }
    }
  );
  logger.info(`Updated ${result.modifiedCount} users with hierarchy fields.`);
  logger.info("Migration 010 completed.");
}

export async function down() {
  logger.info("Migration 010 rollback: removing parentUser and ancestorIds fields...");
  const result = await User.updateMany(
    {},
    {
      $unset: {
        parentUser: "",
        ancestorIds: ""
      }
    }
  );
  logger.info(`Removed hierarchy fields from ${result.modifiedCount} users.`);
  logger.info("Migration 010 rollback completed.");
}