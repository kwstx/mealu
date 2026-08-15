import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Shared connection for BullMQ and Caching
export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const redisCache = new Redis(REDIS_URL);
