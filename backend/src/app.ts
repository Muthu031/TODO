/**
 * Express application setup and route configuration
 * Initializes middleware, routes, and error handling
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import { LinkController } from './controllers/LinkController';
import { LinkService } from './services/LinkService';
import { RedirectService } from './services/RedirectService';
import { errorHandler, asyncHandler } from './middleware/errorHandler';
import { rateLimitMiddleware } from './middleware/rateLimiter';
import { APP_CONFIG } from './config';
import logger from './utils/logger';

/**
 * Create and configure Express application
 * Sets up middleware, routes, and error handling
 */
export const createApp = (prisma: PrismaClient): Express => {
  const app = express();
  
  // ============ MIDDLEWARE ============
  
  // Trust proxy (for X-Forwarded-For header behind load balancer)
  app.set('trust proxy', 1);
  
  // Body parser middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  
  // CORS configuration (allow requests from frontend)
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );
  
  // Request logging middleware
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(
        `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
        {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
        }
      );
    });
    
    next();
  });
  
  // Rate limiting middleware (applied to all routes except health check)
  app.use((req, res, next) => {
    if (req.path === '/health') {
      return next();
    }
    rateLimitMiddleware()(req, res, next);
  });
  
  // ============ INITIALIZE SERVICES ============
  
  const linkService = new LinkService(prisma);
  const redirectService = new RedirectService(prisma);
  const linkController = new LinkController(linkService, redirectService);
  
  // ============ ROUTES ============
  
  // Health check endpoint (no rate limiting)
  app.get('/health', linkController.health);
  
  // Link Management API Routes
  // All these are under /api/links
  
  /**
   * Create new shortened link
   * POST /api/links
   */
  app.post('/api/links', linkController.createLink);
  
  /**
   * Get all links with pagination
   * GET /api/links?page=1&limit=10
   */
  app.get('/api/links', linkController.getAllLinks);
  
  /**
   * Get specific link by ID
   * GET /api/links/:id
   */
  app.get('/api/links/:id', (req, res, next) => {
    // Don't treat 'analytics' as an ID
    if (req.params.id === 'analytics') {
      return next();
    }
    linkController.getLink(req, res, next);
  });
  
  /**
   * Update link (alias, expiration)
   * PATCH /api/links/:id
   */
  app.patch('/api/links/:id', (req, res, next) => {
    if (req.params.id === 'analytics') {
      return next();
    }
    linkController.updateLink(req, res, next);
  });
  
  /**
   * Delete link
   * DELETE /api/links/:id
   */
  app.delete('/api/links/:id', (req, res, next) => {
    if (req.params.id === 'analytics') {
      return next();
    }
    linkController.deleteLink(req, res, next);
  });
  
  /**
   * Get analytics for a link
   * GET /api/analytics/:id
   */
  app.get('/api/analytics/:id', linkController.getAnalytics);
  
  /**
   * Redirect endpoint - MUST be last route to catch all identifiers
   * GET /:identifier
   * 
   * Redirects to original URL and records analytics
   * Catches any path that doesn't match API routes
   */
  app.get('/:identifier', linkController.redirect);
  
  // ============ 404 HANDLER ============
  
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  });
  
  // ============ ERROR HANDLING ============
  
  // Global error handler (must be last)
  app.use(errorHandler);
  
  return app;
};
