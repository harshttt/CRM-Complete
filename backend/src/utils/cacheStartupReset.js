import { cacheDel, cacheScanDel } from "./cache.js";
import logger from "./logger.js";

export async function resetStartupCache() {
  logger.info("Resetting Permission & Role cache on startup...");
  await cacheScanDel("role:");
  await cacheScanDel("user:");
  await cacheScanDel("permissions:");
  await cacheScanDel("permission:");
  await cacheScanDel("roles:");
  logger.info("Cache reset complete");
}