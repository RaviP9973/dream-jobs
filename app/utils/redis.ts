import { createClient } from 'redis';

const globalForRedis = global as unknown as { redisClient: ReturnType<typeof createClient> };

export const redis =
  globalForRedis.redisClient ||
  createClient({
    url: process.env.REDIS_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redisClient = redis;
}

if (!redis.isOpen) {
  redis.connect().catch((err) => console.error('Redis connection error:', err));
}
