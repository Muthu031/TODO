/**
 * Redirect Service - Specialized service for handling redirects
 * Optimized for high-performance lookups with caching
 * Handles redirect logic, analytics recording, and caching
 */

import { PrismaClient } from '@prisma/client';
import { ClickRepository } from '../repositories/ClickRepository';
import { LinkRepository } from '../repositories/LinkRepository';
import { isLinkExpired, getCountryFromIp } from '../utils';
import { NotFoundError } from '../middleware/errorHandler';
import { getRedisClient } from '../utils/redis';
import logger from '../utils/logger';

/**
 * RedirectService class - Handles optimized redirect operations
 * Prioritizes speed with Redis caching
 */
export class RedirectService {
  private linkRepository: LinkRepository;
  private clickRepository: ClickRepository;
  private redis: ReturnType<typeof getRedisClient> | null = null;
  
  constructor(private prisma: PrismaClient) {
    this.linkRepository = new LinkRepository(prisma);
    this.clickRepository = new ClickRepository(prisma);
    
    try {
      this.redis = getRedisClient();
    } catch {
      logger.warn('Redis not available, redirects will bypass cache');
    }
  }
  
  /**
   * Get redirect target URL for a shortened code
   * Optimized for speed: tries Redis cache first, falls back to database
   * Target: < 50ms with cache hit, < 200ms with cache miss
   * 
   * @param identifier - Short code or custom alias
   * @returns Original URL to redirect to
   * @throws NotFoundError if identifier not found or link expired
   */
  async getRedirectUrl(identifier: string): Promise<string> {
    try {
      // FAST PATH: Check Redis cache first
      if (this.redis) {
        try {
          const cachedUrl = await (this.redis as any).get?.(`link:${identifier}`);
          if (cachedUrl) {
            logger.debug('Cache hit for redirect', { identifier });
            return cachedUrl;
          }
        } catch (error) {
          logger.warn('Redis cache lookup failed, falling back to database', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      
      // SLOW PATH: Query database
      logger.debug('Cache miss for redirect, querying database', { identifier });
      
      let link = await this.linkRepository.findByShortCode(identifier);
      if (!link) {
        link = await this.linkRepository.findByCustomAlias(identifier);
      }
      
      if (!link) {
        throw new NotFoundError('Short link not found');
      }
      
      // Check if link has expired
      if (isLinkExpired(link.expiresAt)) {
        // Delete expired link asynchronously (don't block redirect)
        this.linkRepository.delete(link.id).catch((err) =>
          logger.error('Failed to delete expired link', { error: err.message })
        );
        throw new NotFoundError('Link has expired');
      }
      
      // Cache the result for future requests
      if (this.redis) {
        this.cacheRedirect(identifier, link.originalUrl).catch((err) =>
          logger.warn('Failed to cache redirect', {
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        );
      }
      
      return link.originalUrl;
    } catch (error) {
      logger.error('Failed to get redirect URL', {
        error: error instanceof Error ? error.message : 'Unknown error',
        identifier,
      });
      throw error;
    }
  }
  
  /**
   * Record a click/visit to a shortened link
   * Captures analytics: IP, user agent, country
   * Async operation - doesn't block redirect response
   * 
   * @param linkId - ID of the shortened link
   * @param ipAddress - Visitor's IP address
   * @param userAgent - Visitor's browser user agent
   */
  async recordClick(linkId: string, ipAddress: string, userAgent: string): Promise<void> {
    try {
      // Get country from IP (async, can happen in background)
      const country = await getCountryFromIp(ipAddress);
      
      // Record click in database
      await this.clickRepository.recordClick(linkId, ipAddress, userAgent, country);
      
      // Increment Redis click counter for quick stats
      if (this.redis) {
        const counterKey = `clicks:${linkId}`;
        await (this.redis as any).incr?.(counterKey);
        // Set expiration for counter (7 days)
        await (this.redis as any).expire?.(counterKey, 604800);
      }
    } catch (error) {
      // Don't throw - analytics recording shouldn't break redirects
      logger.error('Failed to record click', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
    }
  }
  
  /**
   * Cache redirect URL in Redis for fast lookups
   * Improves subsequent redirect latency significantly
   * 
   * @param identifier - Short code or custom alias
   * @param originalUrl - Original URL to cache
   */
  private async cacheRedirect(identifier: string, originalUrl: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      // Cache with 1 hour TTL
      await (this.redis as any).setex?.(`link:${identifier}`, 3600, originalUrl);
      logger.debug('Redirect cached', { identifier });
    } catch (error) {
      logger.warn('Failed to cache redirect', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
