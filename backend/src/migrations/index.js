import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import MigrationHistory from './history.model.js';
import logger from '../utils/logger.js'; 
import { clearPermissionAndRoleCache } from '../utils/cache.js';

const MIGRATIONS_DIR = path.resolve('src/migrations/files');

async function runMigrations() {
  try {
    logger.info('Connecting to MongoDB for migration...');
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('MongoDB connected for migration');
    const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.js'));
    logger.info(`Found ${files.length} migration files`);
    for (const file of files) {
      const executed = await MigrationHistory.findOne({ name: file });
      if (executed) {
        logger.info(`Skipping (already executed): ${file}`);
        continue;
      }
      logger.info(`Running migration: ${file}`);
      const fullPath = path.join(MIGRATIONS_DIR, file);
      const migrationURL = pathToFileURL(fullPath).href;
      const migration = await import(migrationURL);
      try {
        await migration.up();
        await MigrationHistory.create({ name: file });
        logger.info(`Migration completed: ${file}`);
      } catch (err) {
        logger.error(`Migration failed: ${file}`);
        logger.error(err);
        process.exit(1);
      }
    }
    logger.info('All migrations finished successfully');
    logger.info("Clearing Redis cache for roles & permissions...");
    await clearPermissionAndRoleCache();
    logger.info("Cache cleared successfully.");
    process.exit(0);
  } catch (error) {
    logger.error('Migration runner failed');
    logger.error(error);
    process.exit(1);
  }
}
runMigrations();