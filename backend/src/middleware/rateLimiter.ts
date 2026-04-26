/**
 * Rate limiting middleware using sliding window algorithm
 * Tracks requests per IP address in Redis
 * Allows configurable requests per time window
 */

import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../utils/redis';
import { APP_CONFIG } from '../config';
import logger from '../utils/logger';

/**
 * Custom error for rate limit exceeded
 */
export class RateLimitExceededError extends Error {
  constructor(public retryAfter: number) {
    super('Rate limit exceeded');
    this.name = 'RateLimitExceededError';
  }
}

/**
 * Rate limiting middleware factory
 * Creates middleware that enforces rate limits per IP
 * Uses sliding window algorithm stored in Redis
 * 
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests allowed per window
 * @returns Express middleware function
 * @example app.use(rateLimitMiddleware(60000, 100))
 */
export const rateLimitMiddleware = (
  windowMs: number = APP_CONFIG.rateLimiting.windowMs,
  maxRequests: number = APP_CONFIG.rateLimiting.maxRequests
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = getRedisClient();
      
      // Get client IP address (consider proxy headers)
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';
      
      // Redis key for this IP's rate limit counter
      const rateLimitKey = `ratelimit:${clientIp}`;
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Remove old entries outside the sliding window
      await (redis as any).zremrangebyscore?.(rateLimitKey, 0, windowStart);
      
      // Count requests in current window
      const requestCount = await (redis as any).zcard?.(rateLimitKey) || 0;
      
      // Check if limit exceeded
      if (requestCount >= maxRequests) {
        // Calculate time until oldest request leaves window
        const oldestRequestTime = await (redis as any).zrange?.(rateLimitKey, 0, 0) || [];
        const retryAfter = oldestRequestTime.length > 0
          ? Math.ceil((parseInt(oldestRequestTime[0]) + windowMs - now) / 1000)
          : 1;
        
        logger.warn('Rate limit exceeded', { clientIp, requestCount, maxRequests });
        
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('Retry-After', retryAfter);
        
        throw new RateLimitExceededError(retryAfter);
      }
      
      // Add current request to sliding window
      await (redis as any).zadd?.(rateLimitKey, now, now.toString());
      
      // Set key expiration (cleanup old keys)
      await (redis as any).expire?.(rateLimitKey, Math.ceil(windowMs / 1000));
      
      // Add rate limit headers to response
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount - 1));
      
      next();
    } catch (error) {
      if (error instanceof RateLimitExceededError) {
        res.status(429).json({
          success: false,
          error: 'Too many requests',
          retryAfter: error.retryAfter,
        });
      } else {
        logger.error('Rate limit middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        next(error);
      }
    }
  };
};
