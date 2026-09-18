import BatchUpload from "../../modules/batchUpload/batchUpload.model.js";
import logger from "../../utils/logger.js";

export async function up() {
  logger.info("Migration 004: Renaming BatchUpload.errors → failedRows");
  const docs = await BatchUpload.find({ errors: { $exists: true } });
  for (const doc of docs) {
    doc.failedRows = doc.errors || [];
    doc.errors = undefined;
    await doc.save();
  }
  logger.info("Migration 004 completed: Field renamed successfully");
}

export async function down() {
  logger.info("Migration 004 rollback not implemented");
}
