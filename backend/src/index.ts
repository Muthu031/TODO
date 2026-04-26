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
    
    // Start listening and store server reference
    const server = app.listen(APP_CONFIG.port, () => {
      logger.info(
        `✓ Server started - URL Shortener API listening on http://localhost:${APP_CONFIG.port}`,
        {
          port: APP_CONFIG.port,
          environment: APP_CONFIG.nodeEnv,
        }
      );
    });
    
    // Graceful shutdown handlers with timeout
    let isShuttingDown = false;
    const shutdown = async (signal: string): Promise<void> => {
      // Prevent multiple shutdown calls
      if (isShuttingDown) {
        logger.warn('Shutdown already in progress, skipping duplicate signal');
        return;
      }
      isShuttingDown = true;
      
      logger.info(`Received ${signal} signal, shutting down gracefully...`);
      
      // Set a hard timeout (30 seconds) to force exit if shutdown hangs
      const forceExitTimeout = setTimeout(() => {
        logger.error('Forced exit: Graceful shutdown took too long (30s timeout)');
        process.exit(1);
      }, 30000);
      
      try {
        // Stop accepting new connections
        server.close(() => {
          logger.info('✓ HTTP server closed');
        });
        
        // Close Redis connection
        try {
          await closeRedis();
          logger.info('✓ Redis connection closed');
        } catch (redisError) {
          logger.warn('Error closing Redis', {
            error: redisError instanceof Error ? redisError.message : 'Unknown error',
          });
        }
        
        // Disconnect Prisma
        await prisma.$disconnect();
        logger.info('✓ Database connection closed');
        
        // Clear the force exit timeout
        clearTimeout(forceExitTimeout);
        
        logger.info('✓ Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        clearTimeout(forceExitTimeout);
        logger.error('Error during shutdown', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
      }
    };
    
    // Handle termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
      });
      process.exit(1);
    });
    
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
