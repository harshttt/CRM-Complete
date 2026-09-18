import { redisClient } from '../config/redis.js';
import logger from './logger.js';

export async function pushActivity(event, payload = {}) {
  try {
    const args = ['user:activity', '*', 'event', event];
    for (const [k, v] of Object.entries(payload)) {
      args.push(k, String(v));
    }
    await redisClient.xadd(...args);
  } catch (err) {
    logger.error('Failed to push activity', err);
  }
}
