import mongoose from "mongoose";
import logger from "../../utils/logger.js";

const INDEX_NAME = "idx_lead_list_core";

export async function up() {
  logger.info("Migration 018: Adding Lead list performance index");

  const collection = mongoose.connection.collection("leads");

  const indexes = await collection.indexes();
  const exists = indexes.find((i) => i.name === INDEX_NAME);

  if (exists) {
    logger.info("Index already exists, skipping");
    return;
  }

  await collection.createIndex(
    {
      archived: 1,
      isDuplicate: 1,
      stage: 1,
      lastActivityAt: -1,
    },
    {
      name: INDEX_NAME,
      background: true,
    }
  );

  logger.info("Lead list performance index created");
}

export async function down() {
  logger.info("Migration 018 rollback started");

  const collection = mongoose.connection.collection("leads");

  const indexes = await collection.indexes();
  const exists = indexes.find((i) => i.name === INDEX_NAME);

  if (!exists) {
    logger.info("Index not found, skipping rollback");
    return;
  }

  await collection.dropIndex(INDEX_NAME);

  logger.info("Lead list performance index removed");
}