/**
 * Click Repository - Data access layer for Click/Analytics entity
 * Handles all database queries related to link clicks and analytics
 */

import { PrismaClient } from '@prisma/client';
import { Click } from '../types';
import logger from '../utils/logger';

/**
 * ClickRepository class - Implements repository pattern
 * Encapsulates all database operations for analytics clicks
 */
export class ClickRepository {
  constructor(private prisma: PrismaClient) {}
  
  /**
   * Record a new click/visit to a shortened URL
   * Called whenever someone accesses a shortened link
   * 
   * @param linkId - ID of the shortened link
   * @param ipAddress - Visitor's IP address
   * @param userAgent - Visitor's user agent string
   * @param country - ISO country code (optional)
   * @returns Created click record
   */
  async recordClick(
    linkId: string,
    ipAddress: string,
    userAgent: string,
    country?: string
  ): Promise<Click> {
    try {
      const click = await this.prisma.click.create({
        data: {
          linkId,
          ipAddress,
          userAgent,
          country: country || null,
        },
      });
      
      logger.debug('Click recorded', { linkId, ipAddress, country });
      return click;
    } catch (error) {
      logger.error('Failed to record click', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
      throw error;
    }
  }
  
  /**
   * Get all clicks for a specific link
   * 
   * @param linkId - ID of the link
   * @param limit - Number of records to return
   * @param offset - Number of records to skip
   * @returns Array of click records
   */
  async findByLinkId(linkId: string, limit: number = 100, offset: number = 0): Promise<Click[]> {
    try {
      return await this.prisma.click.findMany({
        where: { linkId },
        take: limit,
        skip: offset,
        orderBy: { visitedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to fetch clicks for link', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
      throw error;
    }
  }
  
  /**
   * Get total click count for a link
   * Optimized query for counting clicks
   * 
   * @param linkId - ID of the link
   * @returns Total number of clicks
   */
  async getClickCount(linkId: string): Promise<number> {
    try {
      return await this.prisma.click.count({
        where: { linkId },
      });
    } catch (error) {
      logger.error('Failed to get click count', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
      throw error;
    }
  }
  
  /**
   * Get count of unique visitors for a link
   * Counts distinct IP addresses
   * 
   * @param linkId - ID of the link
   * @returns Number of unique visitors
   */
  async getUniqueVisitorCount(linkId: string): Promise<number> {
    try {
      const result = await this.prisma.click.groupBy({
        by: ['ipAddress'],
        where: { linkId },
        _count: true,
      });
      
      return result.length;
    } catch (error) {
      logger.error('Failed to get unique visitor count', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
      throw error;
    }
  }
  
  /**
   * Get click breakdown by country
   * Returns map of country codes to click counts
   * 
   * @param linkId - ID of the link
   * @returns Object with country codes as keys and counts as values
   */
  async getClicksByCountry(linkId: string): Promise<Record<string, number>> {
    try {
      const results = await this.prisma.click.groupBy({
        by: ['country'],
        where: {
          linkId,
          country: { not: null },
        },
        _count: true,
      });
      
      const breakdown: Record<string, number> = {};
      results.forEach((result: any) => {
        if (result.country) {
          breakdown[result.country] = result._count;
        }
      });
      
      return breakdown;
    } catch (error) {
      logger.error('Failed to get clicks by country', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
      throw error;
    }
  }
  
  /**
   * Get clicks aggregated by date
   * Returns daily click counts for analytics charts
   * 
   * @param linkId - ID of the link
   * @param daysBack - Number of days to look back
   * @returns Array of { date, count } objects
   */
  async getClicksByDate(
    linkId: string,
    daysBack: number = 30
  ): Promise<Array<{ date: string; count: number }>> {
    try {
      // Query raw SQL for date-based aggregation (more efficient)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      const results: any[] = await (this.prisma as any).$queryRaw`
        SELECT
          DATE(visited_at) as date,
          COUNT(*) as count
        FROM clicks
        WHERE link_id = ${linkId}
          AND visited_at >= ${startDate}
        GROUP BY DATE(visited_at)
        ORDER BY date ASC
      `;
      
      return results.map((row) => ({
        date: row.date.toISOString().split('T')[0],
        count: parseInt(row.count, 10),
      }));
    } catch (error) {
      logger.error('Failed to get clicks by date', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
      throw error;
    }
  }
  
  /**
   * Get the most recent click for a link
   * Useful for "last clicked at" timestamp
   * 
   * @param linkId - ID of the link
   * @returns Most recent click or null
   */
  async getLastClick(linkId: string): Promise<Click | null> {
    try {
      return await this.prisma.click.findFirst({
        where: { linkId },
        orderBy: { visitedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to get last click', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
      return null;
    }
  }
  
  /**
   * Delete all clicks for a link
   * Called when deleting a link
   * 
   * @param linkId - ID of the link
   * @returns Number of clicks deleted
   */
  async deleteByLinkId(linkId: string): Promise<number> {
    try {
      const result = await this.prisma.click.deleteMany({
        where: { linkId },
      });
      
      logger.info('Clicks deleted for link', { linkId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to delete clicks for link', {
        error: error instanceof Error ? error.message : 'Unknown error',
        linkId,
      });
      throw error;
    }
  }
}
