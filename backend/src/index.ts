/**
 * Application entry point
 * Initializes server, database, Redis, and starts listening
 */

import { PrismaClient } from '@prisma/client';
import { createApp } from './app';
import { initRedis, closeRedis } from './utils/redis';
import { APP_CONFIG, validateConfig } from './config';
import logger from './utils/logger';

/**
 * Main entry point for the application
 */
const main = async (): Promise<void> => {
  try {
    // Validate configuration at startup
    validateConfig();
    logger.info('✓ Configuration validated');
    
    // Initialize Prisma client (database)
    const prisma = new PrismaClient({
      log: ['warn', 'error'],
    });
    
    // Test database connection
    await prisma.$connect();
    logger.info('✓ Database connected');
    
    // Initialize Redis connection
    try {
      await initRedis();
    } catch (error) {
      logger.warn('Redis initialization failed, continuing without caching', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    // Create Express app
    const app = createApp(prisma);
    
    // Start listening
    app.listen(APP_CONFIG.port, () => {
      logger.info(
        `✓ Server started - URL Shortener API listening on http://localhost:${APP_CONFIG.port}`,
        {
          port: APP_CONFIG.port,
          environment: APP_CONFIG.nodeEnv,
        }
      );
    });
    
    // Graceful shutdown handlers
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal} signal, shutting down gracefully...`);
      
      try {
        await closeRedis();
        await prisma.$disconnect();
        logger.info('✓ Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        process.exit(1);
      }
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Fatal error during startup', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

// Start the application
main();
