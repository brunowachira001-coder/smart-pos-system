import Redis from 'ioredis';
import { config } from './config';
import { logger } from './logger';

let redis: Redis | null = null;

export function initializeRedis() {
  try {
    redis = new Redis(config.redis.url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    redis.on('error', (err) => {
      logger.error('Redis error', err);
    });

    return redis;
  } catch (error) {
    logger.error('Failed to initialize Redis', error);
    throw error;
  }
}

export function getRedis() {
  if (!redis) {
    return initializeRedis();
  }
  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    logger.info('Redis connection closed');
  }
}

export const redisCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await getRedis().get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis get error for key ${key}`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    try {
      await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error(`Redis set error for key ${key}`, error);
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await getRedis().del(key);
    } catch (error) {
      logger.error(`Redis delete error for key ${key}`, error);
    }
  },

  async clear(pattern: string): Promise<void> {
    try {
      const keys = await getRedis().keys(pattern);
      if (keys.length > 0) {
        await getRedis().del(...keys);
      }
    } catch (error) {
      logger.error(`Redis clear error for pattern ${pattern}`, error);
    }
  },
};

export default getRedis();
