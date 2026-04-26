/**
 * Link Service - Business logic layer for link management
 * Handles creation, retrieval, updating, and analytics of shortened links
 * Uses Repository pattern for data access abstraction
 */

import { PrismaClient } from '@prisma/client';
import { LinkRepository } from '../repositories/LinkRepository';
import { ClickRepository } from '../repositories/ClickRepository';
import { Link, LinkAnalytics, CreateLinkRequest, UpdateLinkRequest } from '../types';
import {
  generateShortCode,
  validateUrl,
  sanitizeAlias,
  isLinkExpired,
} from '../utils';
import { ConflictError, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { getRedisClient } from '../utils/redis';
import logger from '../utils/logger';

/**
 * LinkService class - Encapsulates all business logic for link operations
 * Coordinates between repositories and caching layer
 */
export class LinkService {
  private linkRepository: LinkRepository;
  private clickRepository: ClickRepository;
  private redis: ReturnType<typeof getRedisClient> | null = null;
  
  constructor(private prisma: PrismaClient) {
    this.linkRepository = new LinkRepository(prisma);
    this.clickRepository = new ClickRepository(prisma);
    
    try {
      this.redis = getRedisClient();
    } catch {
      logger.warn('Redis not available, continuing without cache');
    }
  }
  
  /**
   * Create a new shortened link
   * Validates URL, generates unique short code, handles custom aliases
   * 
   * @param request - CreateLinkRequest with originalUrl and optional customAlias/expiresAt
   * @returns Created link object with shortCode
   * @throws ValidationError if URL is invalid or customAlias is taken
   */
  async createLink(request: CreateLinkRequest): Promise<Link> {
    // Validate original URL
    if (!request.originalUrl) {
      throw new ValidationError('originalUrl is required');
    }
    
    if (!validateUrl(request.originalUrl)) {
      throw new ValidationError(
        'Invalid URL format. Ensure it starts with http:// or https://'
      );
    }
    
    // Handle custom alias if provided
    let customAlias = request.customAlias ? sanitizeAlias(request.customAlias) : undefined;
    
    if (customAlias) {
      if (customAlias.length < 3) {
        throw new ValidationError('Custom alias must be at least 3 characters');
      }
      
      // Check if alias already exists
      const existingAlias = await this.linkRepository.customAliasExists(customAlias);
      if (existingAlias) {
        throw new ConflictError(`Custom alias "${customAlias}" is already taken`);
      }
    }
    
    // Generate unique short code
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      shortCode = generateShortCode();
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique short code');
      }
    } while (await this.linkRepository.shortCodeExists(shortCode));
    
    // Validate expiration date if provided
    if (request.expiresAt) {
      if (new Date(request.expiresAt) <= new Date()) {
        throw new ValidationError('Expiration date must be in the future');
      }
    }
    
    // Create link in database
    const link = await this.linkRepository.create(
      shortCode,
      request.originalUrl,
      customAlias,
      request.expiresAt
    );
    
    logger.info('Link created successfully', {
      shortCode,
      hasCustomAlias: !!customAlias,
      hasExpiration: !!request.expiresAt,
    });
    
    return link;
  }
  
  /**
   * Get a shortened link by short code or custom alias
   * Checks if link is expired, returns null if expired
   * 
   * @param identifier - Short code or custom alias
   * @returns Link object or null if not found/expired
   */
  async getLink(identifier: string): Promise<Link | null> {
    try {
      // Try to find by short code first, then custom alias
      let link = await this.linkRepository.findByShortCode(identifier);
      
      if (!link) {
        link = await this.linkRepository.findByCustomAlias(identifier);
      }
      
      if (!link) {
        return null;
      }
      
      // Check if link has expired
      if (isLinkExpired(link.expiresAt)) {
        // Delete expired link asynchronously
        this.linkRepository.delete(link.id).catch((err) =>
          logger.error('Failed to delete expired link', { error: err.message })
        );
        return null;
      }
      
      return link;
    } catch (error) {
      logger.error('Failed to get link', {
        error: error instanceof Error ? error.message : 'Unknown error',
        identifier,
      });
      throw error;
    }
  }
  
  /**
   * Get a link by ID
   * Used for dashboard/management endpoints
   * 
   * @param id - Link ID
   * @returns Link or null if not found
   */
  async getLinkById(id: string): Promise<Link | null> {
    return this.linkRepository.findById(id);
  }
  
  /**
   * Get all links with pagination
   * 
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Array of links
   */
  async getAllLinks(page: number = 1, limit: number = 10): Promise<Link[]> {
    const offset = (page - 1) * limit;
    return this.linkRepository.findAll(limit, offset);
  }
  
  /**
   * Update link properties
   * Allows updating custom alias and expiration
   * 
   * @param id - Link ID
   * @param updates - UpdateLinkRequest with fields to update
   * @returns Updated link object
   */
  async updateLink(id: string, updates: UpdateLinkRequest): Promise<Link> {
    // Verify link exists
    const link = await this.linkRepository.findById(id);
    if (!link) {
      throw new NotFoundError('Link not found');
    }
    
    // Validate and sanitize new alias if provided
    if (updates.customAlias !== undefined) {
      if (updates.customAlias !== null) {
        const sanitized = sanitizeAlias(updates.customAlias);
        if (sanitized.length < 3) {
          throw new ValidationError('Custom alias must be at least 3 characters');
        }
        
        // Check if new alias is already taken (by different link)
        const existing = await this.linkRepository.customAliasExists(sanitized);
        if (existing && link.customAlias !== sanitized) {
          throw new ConflictError(`Custom alias "${sanitized}" is already taken`);
        }
        
        updates.customAlias = sanitized;
      }
    }
    
    // Validate expiration if provided
    if (updates.expiresAt !== undefined && updates.expiresAt !== null) {
      if (new Date(updates.expiresAt) <= new Date()) {
        throw new ValidationError('Expiration date must be in the future');
      }
    }
    
    // Update link
    const updatedLink = await this.linkRepository.update(id, updates);
    
    // Invalidate cache
    this.invalidateLinkCache(link.shortCode, link.customAlias || undefined);
    
    logger.info('Link updated', { id });
    return updatedLink;
  }
  
  /**
   * Delete a link by ID
   * Cascades to delete all associated clicks
   * 
   * @param id - Link ID
   */
  async deleteLink(id: string): Promise<void> {
    const link = await this.linkRepository.findById(id);
    if (!link) {
      throw new NotFoundError('Link not found');
    }
    
    // Delete from database (cascades to clicks)
    await this.linkRepository.delete(id);
    
    // Invalidate cache
    this.invalidateLinkCache(link.shortCode, link.customAlias || undefined);
    
    logger.info('Link deleted', { id });
  }
  
  /**
   * Get detailed analytics for a link
   * Aggregates all click data and statistics
   * 
   * @param id - Link ID
   * @returns LinkAnalytics object with aggregated stats
   */
  async getAnalytics(id: string): Promise<LinkAnalytics> {
    // Get link details
    const link = await this.linkRepository.findById(id);
    if (!link) {
      throw new NotFoundError('Link not found');
    }
    
    // Aggregate analytics data
    const [totalClicks, uniqueVisitors, topCountries, clicksOverTime, lastClick] =
      await Promise.all([
        this.clickRepository.getClickCount(id),
        this.clickRepository.getUniqueVisitorCount(id),
        this.clickRepository.getClicksByCountry(id),
        this.clickRepository.getClicksByDate(id, 30),
        this.clickRepository.getLastClick(id),
      ]);
    
    return {
      linkId: link.id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      totalClicks,
      uniqueVisitors,
      createdAt: link.createdAt,
      lastClickedAt: lastClick?.visitedAt,
      topCountries,
      clicksOverTime,
    };
  }
  
  /**
   * Cache link short code to original URL mapping in Redis
   * Used to speed up redirect operations (cache hit < 50ms target)
   * 
   * @param link - Link object to cache
   */
  async cacheLink(link: Link): Promise<void> {
    if (!this.redis || isLinkExpired(link.expiresAt)) {
      return;
    }
    
    try {
      // Set both short code and custom alias mappings
      await (this.redis as any).setex?.(
        `link:${link.shortCode}`,
        3600, // 1 hour TTL
        link.originalUrl
      );
      
      if (link.customAlias) {
        await (this.redis as any).setex?.(
          `link:${link.customAlias}`,
          3600,
          link.originalUrl
        );
      }
    } catch (error) {
      logger.warn('Failed to cache link', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  /**
   * Invalidate cached link data
   * Called when link is updated or deleted
   * 
   * @param shortCode - Short code to invalidate
   * @param customAlias - Custom alias to invalidate (optional)
   */
  private async invalidateLinkCache(shortCode: string, customAlias?: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      await (this.redis as any).del?.(`link:${shortCode}`);
      if (customAlias) {
        await (this.redis as any).del?.(`link:${customAlias}`);
      }
    } catch (error) {
      logger.warn('Failed to invalidate link cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
