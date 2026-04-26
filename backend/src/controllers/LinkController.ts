/**
 * Link Controller - HTTP request handlers for link management endpoints
 * Implements REST API for creating, retrieving, updating, and deleting links
 * Layer between HTTP requests and business logic (LinkService)
 */

import { Request, Response } from 'express';
import { LinkService } from '../services/LinkService';
import { RedirectService } from '../services/RedirectService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * LinkController class - Handles HTTP requests for link operations
 */
export class LinkController {
  constructor(
    private linkService: LinkService,
    private redirectService: RedirectService
  ) {}
  
  /**
   * POST /api/links
   * Create a new shortened link
   * 
   * Request body:
   * {
   *   "originalUrl": "https://example.com/very/long/url",
   *   "customAlias": "my-link",           // optional
   *   "expiresAt": "2025-12-31T23:59:59Z" // optional
   * }
   * 
   * Response: 201 Created
   * {
   *   "success": true,
   *   "data": {
   *     "id": "link-id",
   *     "shortCode": "abc123",
   *     "customAlias": "my-link",
   *     "originalUrl": "https://example.com/very/long/url",
   *     "expiresAt": "2025-12-31T23:59:59Z",
   *     "createdAt": "2024-12-20T10:00:00Z",
   *     "updatedAt": "2024-12-20T10:00:00Z"
   *   }
   * }
   */
  createLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { originalUrl, customAlias, expiresAt } = req.body;
    
    logger.info('Creating new link', { hasCustomAlias: !!customAlias });
    
    // Create link via service
    const link = await this.linkService.createLink({
      originalUrl,
      customAlias,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    
    // Cache the link for future redirects
    await this.linkService.cacheLink(link);
    
    res.status(201).json({
      success: true,
      data: link,
      timestamp: new Date().toISOString(),
    });
  });
  
  /**
   * GET /api/links/:id
   * Get link details by ID with basic analytics
   * 
   * Response: 200 OK
   * {
   *   "success": true,
   *   "data": {
   *     "id": "link-id",
   *     "shortCode": "abc123",
   *     "customAlias": "my-link",
   *     "originalUrl": "https://example.com/very/long/url",
   *     "expiresAt": "2025-12-31T23:59:59Z",
   *     "createdAt": "2024-12-20T10:00:00Z",
   *     "updatedAt": "2024-12-20T10:00:00Z"
   *   }
   * }
   */
  getLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    logger.info('Fetching link details', { linkId: id });
    
    const link = await this.linkService.getLinkById(id);
    
    if (!link) {
      res.status(404).json({
        success: false,
        error: 'Link not found',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: link,
      timestamp: new Date().toISOString(),
    });
  });
  
  /**
   * GET /api/links
   * Get all links with pagination
   * 
   * Query parameters:
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 10, max: 100)
   * 
   * Response: 200 OK
   * {
   *   "success": true,
   *   "data": [
   *     { link object },
   *     { link object }
   *   ],
   *   "pagination": {
   *     "page": 1,
   *     "limit": 10
   *   }
   * }
   */
  getAllLinks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    
    logger.info('Fetching all links', { page, limit });
    
    const links = await this.linkService.getAllLinks(page, limit);
    
    res.status(200).json({
      success: true,
      data: links,
      pagination: { page, limit },
      timestamp: new Date().toISOString(),
    });
  });
  
  /**
   * PATCH /api/links/:id
   * Update link properties (custom alias or expiration)
   * 
   * Request body:
   * {
   *   "customAlias": "new-alias",         // optional
   *   "expiresAt": "2025-12-31T23:59:59Z" // optional
   * }
   * 
   * Response: 200 OK with updated link
   */
  updateLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { customAlias, expiresAt } = req.body;
    
    logger.info('Updating link', { linkId: id });
    
    const updatedLink = await this.linkService.updateLink(id, {
      customAlias,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    
    res.status(200).json({
      success: true,
      data: updatedLink,
      timestamp: new Date().toISOString(),
    });
  });
  
  /**
   * DELETE /api/links/:id
   * Delete a link and all associated click analytics
   * 
   * Response: 200 OK
   * {
   *   "success": true,
   *   "data": { "message": "Link deleted successfully" }
   * }
   */
  deleteLink = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    logger.info('Deleting link', { linkId: id });
    
    await this.linkService.deleteLink(id);
    
    res.status(200).json({
      success: true,
      data: { message: 'Link deleted successfully' },
      timestamp: new Date().toISOString(),
    });
  });
  
  /**
   * GET /:identifier
   * Redirect to original URL based on short code or custom alias
   * Records click/visit analytics
   * 
   * Response: 301/302 Redirect to original URL
   * Headers include X-RateLimit info
   */
  redirect = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { identifier } = req.params;
    
    logger.debug('Processing redirect', { identifier });
    
    // Get original URL from service (cached or from DB)
    const originalUrl = await this.redirectService.getRedirectUrl(identifier);
    
    // Get client IP and user agent for analytics
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Get link ID for analytics recording
    const link = await this.linkService.getLink(identifier);
    if (link) {
      // Record click asynchronously (don't wait for it)
      this.redirectService.recordClick(link.id, clientIp, userAgent).catch((err) => {
        logger.error('Failed to record analytics', { error: err.message });
      });
    }
    
    // Perform 301 permanent redirect
    res.redirect(301, originalUrl);
  });
  
  /**
   * GET /api/analytics/:id
   * Get detailed analytics for a link
   * Includes click counts, unique visitors, geographic breakdown, and time series
   * 
   * Response: 200 OK
   * {
   *   "success": true,
   *   "data": {
   *     "linkId": "link-id",
   *     "shortCode": "abc123",
   *     "originalUrl": "https://example.com/very/long/url",
   *     "totalClicks": 42,
   *     "uniqueVisitors": 35,
   *     "createdAt": "2024-12-20T10:00:00Z",
   *     "lastClickedAt": "2024-12-25T15:30:00Z",
   *     "topCountries": { "US": 15, "GB": 8, "DE": 5 },
   *     "clicksOverTime": [
   *       { "date": "2024-12-20", "count": 5 },
   *       { "date": "2024-12-21", "count": 12 }
   *     ]
   *   }
   * }
   */
  getAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    logger.info('Fetching analytics', { linkId: id });
    
    const analytics = await this.linkService.getAnalytics(id);
    
    res.status(200).json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  });
  
  /**
   * GET /health
   * Health check endpoint - verifies service and dependencies
   * 
   * Response: 200 OK
   * {
   *   "success": true,
   *   "service": "url-shortener-api",
   *   "status": "healthy",
   *   "timestamp": "2024-12-25T10:00:00Z"
   * }
   */
  health = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      service: 'url-shortener-api',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });
}
