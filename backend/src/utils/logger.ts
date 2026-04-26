/**
 * Logger utility using Winston
 * Provides structured logging with timestamps, levels, and request context
 */

import winston from 'winston';
import { APP_CONFIG } from '../config';

/**
 * Create and configure Winston logger instance
 * Outputs to console in development, file in production
 */
const logger = winston.createLogger({
  // Log levels: error, warn, info, http, debug
  level: APP_CONFIG.nodeEnv === 'production' ? 'warn' : 'debug',
  
  // Log format: JSON for production (machine readable), colorized for development
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    APP_CONFIG.nodeEnv === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ level, message, timestamp, ...meta }) =>
              `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`
          )
        )
  ),
  
  // Transports: where logs are written
  transports: [
    // Always log to console
    new winston.transports.Console(),
    
    // Production: also log errors to file
    ...(APP_CONFIG.nodeEnv === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

export default logger;
