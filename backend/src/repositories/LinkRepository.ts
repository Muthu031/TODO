/**
 * Link Repository - Data access layer for Link entity
 * Handles all database queries related to links
 * Abstracts Prisma client from business logic
 */

import { PrismaClient } from '@prisma/client';
import { Link, CreateLinkRequest, UpdateLinkRequest } from '../types';
import logger from '../utils/logger';

/**
 * LinkRepository class - Implements repository pattern
 * Encapsulates all database operations for links
 */
export class LinkRepository {
  constructor(private prisma: PrismaClient) {}
  
  /**
   * Create a new shortened link in database
   * 
   * @param shortCode - Generated short code
   * @param originalUrl - URL to shorten
   * @param customAlias - Optional custom alias
   * @param expiresAt - Optional expiration date
   * @returns Created link object
   */
  async create(
    shortCode: string,
    originalUrl: string,
    customAlias?: string,
    expiresAt?: Date
  ): Promise<Link> {
    try {
      const link = await this.prisma.link.create({
        data: {
          shortCode,
          originalUrl,
          customAlias: customAlias || null,
          expiresAt: expiresAt || null,
        },
      });
      
      logger.info('Link created', { shortCode, customAlias });
      return link;
    } catch (error) {
      logger.error('Failed to create link', {
        error: error instanceof Error ? error.message : 'Unknown error',
        shortCode,
      });
      throw error;
    }
  }
  
  /**
   * Find link by short code
   * Most frequently accessed method - optimize for speed
   * 
   * @param shortCode - Short code to look up
   * @returns Link if found, null otherwise
   */
  async findByShortCode(shortCode: string): Promise<Link | null> {
    try {
      return await this.prisma.link.findUnique({
        where: { shortCode },
      });
    } catch (error) {
      logger.error('Failed to find link by shortCode', {
        error: error instanceof Error ? error.message : 'Unknown error',
        shortCode,
      });
      return null;
    }
  }
  
  /**
   * Find link by custom alias
   * 
   * @param customAlias - Custom alias to look up
   * @returns Link if found, null otherwise
   */
  async findByCustomAlias(customAlias: string): Promise<Link | null> {
    try {
      return await this.prisma.link.findUnique({
        where: { customAlias },
      });
    } catch (error) {
      logger.error('Failed to find link by customAlias', {
        error: error instanceof Error ? error.message : 'Unknown error',
        customAlias,
      });
      return null;
    }
  }
  
  /**
   * Find link by ID
   * 
   * @param id - Link ID
   * @returns Link if found, null otherwise
   */
  async findById(id: string): Promise<Link | null> {
    try {
      return await this.prisma.link.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to find link by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
      });
      return null;
    }
  }
  
  /**
   * Get all links (with pagination for scalability)
   * 
   * @param limit - Number of links to return
   * @param offset - Number of links to skip
   * @returns Array of links
   */
  async findAll(limit: number = 10, offset: number = 0): Promise<Link[]> {
    try {
      return await this.prisma.link.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to fetch all links', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  
  /**
   * Update link properties
   * 
   * @param id - Link ID
   * @param data - Update data (customAlias, expiresAt)
   * @returns Updated link object
   */
  async update(id: string, data: UpdateLinkRequest): Promise<Link> {
    try {
      const link = await this.prisma.link.update({
        where: { id },
        data,
      });
      
      logger.info('Link updated', { id });
      return link;
    } catch (error) {
      logger.error('Failed to update link', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
      });
      throw error;
    }
  }
  
  /**
   * Delete link by ID
   * Cascades to delete all associated clicks
   * 
   * @param id - Link ID to delete
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.link.delete({
        where: { id },
      });
      
      logger.info('Link deleted', { id });
    } catch (error) {
      logger.error('Failed to delete link', {
        error: error instanceof Error ? error.message : 'Unknown error',
        id,
      });
      throw error;
    }
  }
  
  /**
   * Check if short code already exists
   * Used before generating new short codes
   * 
   * @param shortCode - Short code to check
   * @returns true if exists, false otherwise
   */
  async shortCodeExists(shortCode: string): Promise<boolean> {
    const link = await this.findByShortCode(shortCode);
    return !!link;
  }
  
  /**
   * Check if custom alias already exists
   * Prevents duplicate aliases
   * 
   * @param customAlias - Alias to check
   * @returns true if exists, false otherwise
   */
  async customAliasExists(customAlias: string): Promise<boolean> {
    const link = await this.findByCustomAlias(customAlias);
    return !!link;
  }
  
  /**
   * Find and delete expired links
   * Called by cleanup job to remove TTL-expired links
   * 
   * @returns Number of links deleted
   */
  async deleteExpiredLinks(): Promise<number> {
    try {
      const result = await this.prisma.link.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      
      logger.info('Expired links deleted', { count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to delete expired links', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
