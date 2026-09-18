import mongoose from "mongoose";
import logger from "../../utils/logger.js";

const INDEX_TIMELINE = "idx_lead_comment_timeline";
const INDEX_FILTERS = "idx_lead_comment_filters";

export async function up() {
  logger.info("Migration 019: Adding Lead Comment performance indexes");

  const collection = mongoose.connection.collection("leadcomments");
  const indexes = await collection.indexes();

  /* ---------- CHECK IF SAME KEY INDEX EXISTS ---------- */
  const timelineExists = indexes.find(
    (i) =>
      i.key &&
      i.key.leadId === 1 &&
      i.key.createdAt === -1
  );

  if (timelineExists) {
    logger.info(
      `Timeline index already exists with name: ${timelineExists.name}, skipping`
    );
  } else {
    await collection.createIndex(
      { leadId: 1, createdAt: -1 },
      { name: INDEX_TIMELINE, background: true }
    );
    logger.info("Timeline index created");
  }

  /* ---------- FILTER INDEX ---------- */
  const filtersExists = indexes.find((i) => i.name === INDEX_FILTERS);

  if (!filtersExists) {
    await collection.createIndex(
      { leadId: 1, commentType: 1, conversationType: 1, createdAt: -1 },
      { name: INDEX_FILTERS, background: true }
    );
    logger.info("Filters index created");
  } else {
    logger.info("Filters index already exists, skipping");
  }
}

export async function down() {
  logger.info("Migration 019 rollback started");
  const collection = mongoose.connection.collection("leadcomments");
  const indexes = await collection.indexes();
  const filtersExists = indexes.find((i) => i.name === INDEX_FILTERS);
  if (filtersExists) {
    await collection.dropIndex(INDEX_FILTERS);
    logger.info("Filters index removed");
  } else {
    logger.info("Filters index not found");
  }
}