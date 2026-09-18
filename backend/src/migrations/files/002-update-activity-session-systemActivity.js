import Activity from "../../modules/activity/activity.model.js";
import Session from "../../modules/session/session.model.js";
import SystemActivity from "../../modules/systemActivity/systemActivity.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Running migration 002... Updating schemas and applying new indexes");
  logger.info("Syncing new indexes...");
  await Activity.syncIndexes();
  await Session.syncIndexes();
  await SystemActivity.syncIndexes();
  logger.info("✔ Index sync complete");
  logger.info("⏳ Backfilling missing fields...");
  await Activity.updateMany(
    { type: { $exists: false } },
    { $set: { type: "status_changed" } }
  );
  await Session.updateMany(
    { lastUsedAt: { $exists: false } },
    { $set: { lastUsedAt: new Date() } }
  );
  logger.info("Backfill complete");
  logger.info("Migration 002 completed successfully");
}

export async function down() {
  logger.info("Reverting migration 002 (no rollback steps implemented)");
}