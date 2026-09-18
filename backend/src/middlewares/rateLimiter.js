import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisClient } from '../config/redis.js';

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

  limiter
    .consume(key)
    .then(() => next())
    .catch((rej) => {
      // Redis/network error ko 429 treat na karo
      if (!rej || typeof rej.msBeforeNext !== 'number') {
        console.error('Rate limiter Redis error:', rej);
        return next();
      }

      const retryAfter = Math.max(
        1,
        Math.ceil(rej.msBeforeNext / 1000)
      );

      res.set('Retry-After', String(retryAfter));

      return res.status(429).json({
        error: 'Too many requests',
      });
    });
}