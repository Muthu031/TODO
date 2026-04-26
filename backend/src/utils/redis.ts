/**
 * Redis client initialization and singleton
 * Used for caching and rate limiting
 */

import { createClient } from 'redis';
import { APP_CONFIG } from '../config';
import logger from './logger';

/**
 * Redis client instance (singleton pattern)
 * Connects to Redis server for caching and rate limiting
 */
let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Redis connection
 * Handles connection errors and logging
 */
export const initRedis = async (): Promise<void> => {
  if (redisClient) return; // Already connected
  
  try {
    redisClient = createClient({
      socket: {
        host: APP_CONFIG.redis.host,
        port: APP_CONFIG.redis.port,
      },
      password: APP_CONFIG.redis.password,
    }) as any;
    
    // Handle connection events
    redisClient?.on('connect', () => {
      logger.info('✓ Redis connected', {
        host: APP_CONFIG.redis.host,
        port: APP_CONFIG.redis.port,
      });
    });
    
    redisClient?.on('error', (err) => {
      logger.error('Redis connection error:', { error: err.message });
    });
    
    // Redis v4+ requires explicit connection
    await (redisClient as any).connect?.();
  } catch (error) {
    logger.error('Failed to initialize Redis', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

/**
 * Get Redis client instance
 * Ensures client is initialized before use
 */
export const getRedisClient = (): ReturnType<typeof createClient> => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initRedis() first.');
  }
  return redisClient;
};

/**
 * Close Redis connection (cleanup)
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await (redisClient as any).quit?.();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};
