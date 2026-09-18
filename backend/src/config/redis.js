import Redis from 'ioredis';
import logger from '../utils/logger.js';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.REDIS_URL) {
  throw new Error('REDIS_URL is required in production');
}

const redisConfig = process.env.REDIS_URL
  ? process.env.REDIS_URL.trim()
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      enableAutoPipelining: true,
    };

const commonOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
};

export const redisClient =
  typeof redisConfig === 'string'
    ? new Redis(redisConfig, commonOptions)
    : new Redis({
        ...redisConfig,
        ...commonOptions,
      });

export const redisSubscriber =
  typeof redisConfig === 'string'
    ? new Redis(redisConfig, commonOptions)
    : new Redis({
        ...redisConfig,
        ...commonOptions,
      });

redisClient.on('connect', () => logger.info('Redis client connected'));
redisClient.on('ready', () => logger.info('Redis client ready'));
redisClient.on('error', (err) => logger.error({ err }, 'Redis error'));
redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));
redisClient.on('end', () => logger.warn('Redis connection closed'));

redisSubscriber.on('error', (err) =>
  logger.error({ err }, 'Redis subscriber error')
);

export default redisClient;