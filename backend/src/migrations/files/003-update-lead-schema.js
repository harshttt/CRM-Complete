import Lead from "../../modules/lead/lead.model.js";
import Task from "../../modules/task/task.model.js";
import Note from "../../modules/note/note.model.js";
import Activity from "../../modules/activity/activity.model.js";
import BatchUpload from "../../modules/batchUpload/batchUpload.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 003 started: Updating Lead schema + syncing indexes");

  logger.info("Syncing indexes...");
  await Lead.syncIndexes();
  await Task.syncIndexes();
  await Note.syncIndexes();
  await Activity.syncIndexes();
  await BatchUpload.syncIndexes();
  logger.info("Index sync completed");

  logger.info("Backfilling Lead missing fields...");

  // createdBy
  await Lead.updateMany(
    { createdBy: { $exists: false } },
    { $set: { createdBy: null } }
  );

  // sourceBatchId
  await Lead.updateMany(
    { sourceBatchId: { $exists: false } },
    { $set: { sourceBatchId: null } }
  );

  // currentOwner — fallback to assignedTo (non-pipeline version)
  const leadsWithoutOwner = await Lead.find({ currentOwner: { $exists: false } });
  for (const lead of leadsWithoutOwner) {
    lead.currentOwner = lead.assignedTo || null;
    await lead.save();
  }

  // currentOwnerRole
  await Lead.updateMany(
    { currentOwnerRole: { $exists: false } },
    { $set: { currentOwnerRole: null } }
  );

  // ownerType
  await Lead.updateMany(
    { ownerType: { $exists: false } },
    { $set: { ownerType: "user" } }
  );

  // historicalOwners
  await Lead.updateMany(
    { historicalOwners: { $exists: false } },
    { $set: { historicalOwners: [] } }
  );

  // locked fields
  await Lead.updateMany(
    { isLocked: { $exists: false } },
    {
      $set: {
        isLocked: false,
        lockedBy: null,
        lockedUntil: null
      }
    }
  );

  // lastAssignedAt — fallback without pipeline
  const leadsWithoutLastAssigned = await Lead.find({ lastAssignedAt: { $exists: false } });
  for (const lead of leadsWithoutLastAssigned) {
    lead.lastAssignedAt = lead.updatedAt || lead.createdAt;
    await lead.save();
  }

  // firstContactedAt
  await Lead.updateMany(
    { firstContactedAt: { $exists: false } },
    { $set: { firstContactedAt: null } }
  );

  // timeToFirstContactMinutes
  await Lead.updateMany(
    { timeToFirstContactMinutes: { $exists: false } },
    { $set: { timeToFirstContactMinutes: null } }
  );

  // archive fields
  await Lead.updateMany(
    { archived: { $exists: false } },
    { $set: { archived: false } }
  );

  await Lead.updateMany(
    { archivedAt: { $exists: false } },
    { $set: { archivedAt: null } }
  );

  logger.info("Lead backfill completed");
  logger.info("Migration 003 completed successfully");
}

export async function down() {
  logger.info("Migration 003 rollback not implemented (safe forward-only)");
}
