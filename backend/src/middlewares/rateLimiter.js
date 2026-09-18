import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});
const points = Number(process.env.RATE_LIMIT_POINTS || 100);
const duration = Number(process.env.RATE_LIMIT_DURATION || 60);
const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rlflx',
  points,
  duration,
  inmemoryBlockOnConsumed: points + 1,
  inmemoryBlockDuration: duration,
});

export function rateLimiterMiddleware(req, res, next) {
  const key = (req.user && req.user.id) || req.ip;
  limiter.consume(key)
    .then(() => next())
    .catch((rej) => {
      res.set('Retry-After', String(Math.ceil(rej.msBeforeNext / 1000)));
      return res.status(429).json({ error: 'Too many requests' });
    });
}