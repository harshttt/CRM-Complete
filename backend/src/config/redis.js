import Redis from 'ioredis';
import logger from '../utils/logger.js';

const redisOptions = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      enableAutoPipelining: true,
    };

export const redisClient = new Redis(redisOptions);
export const redisSubscriber = new Redis(redisOptions);

redisClient.on('connect', () => logger.info('Redis client connected'));
redisClient.on('ready', () => logger.info('Redis client ready'));
redisClient.on('error', (err) => logger.error({ err }, 'Redis error'));
redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));
redisClient.on('end', () => logger.warn('Redis connection closed'));

export default redisClient;