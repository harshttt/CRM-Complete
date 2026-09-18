import redisClient from '../config/redis.js';
import logger from './logger.js';

const PREFIX = process.env.REDIS_PREFIX || "app";

const withPrefix = (key) => `${PREFIX}:${key}`;

export async function cacheSet(key, value, ttlSeconds = 3600) {
  const finalKey = withPrefix(key);
  const v = typeof value === 'string' ? value : JSON.stringify(value);

  if (ttlSeconds > 0) {
    await redisClient.set(finalKey, v, 'EX', ttlSeconds);
  } else {
    await redisClient.set(finalKey, v);
  }
}

export async function cacheGet(key) {
  const finalKey = withPrefix(key);
  const v = await redisClient.get(finalKey);

  if (!v) return null;

  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

export async function cacheDel(key) {
  const finalKey = withPrefix(key);
  return redisClient.del(finalKey);
}

export function buildCacheKey(type, id) {
  return `${type}:${id}`;
}
export async function cacheScanDel(pattern) {
  const finalPattern = `${PREFIX}:${pattern}*`;
  const stream = redisClient.scanStream({
    match: finalPattern,
    count: 100
  });
  stream.on("data", async (keys) => {
    if (keys.length) {
      await redisClient.del(...keys);
    }
  });
  return new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });
}
export async function clearPermissionAndRoleCache() {
  await cacheScanDel("role:");
  await cacheScanDel("roles:");
  await cacheScanDel("user:");
  await cacheScanDel("permission:");
  await cacheScanDel("permissions:");
}
export async function flushAllCache() {
  logger.info(`clear db`);
  await redisClient.flushdb();
}
