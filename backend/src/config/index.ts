/**
 * Configuration module - Centralized environment variable loading and validation
 * Ensures all required config is available at startup
 */

import dotenv from 'dotenv';

// Load .env file into process.env
dotenv.config();

/**
 * APP_CONFIG - Singleton object containing all application configuration
 * Validated at module load time to catch missing env vars early
 */
export const APP_CONFIG = {
  // Server configuration
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration (Prisma uses DATABASE_URL directly)
  databaseUrl: process.env.DATABASE_URL,
  
  // Redis configuration for caching and rate limiting
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  // Short code generation configuration
  shortCodeLength: parseInt(process.env.SHORT_CODE_LENGTH || '6', 10),
  
  // Rate limiting configuration (sliding window algorithm)
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
} as const;

/**
 * Validate required configuration at startup
 * Throws error if critical env vars are missing
 */
export const validateConfig = (): void => {
  if (!APP_CONFIG.databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
};
