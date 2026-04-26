/**
 * Error handling and custom error classes
 * Centralized error handling for consistent API responses
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Custom error class for application-level errors
 * Extends Error with HTTP status code and error code
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error classes for common scenarios
 */

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Global error handling middleware
 * Catches all errors and returns consistent JSON response
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error response
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  
  // If it's our custom AppError, use its properties
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  }
  
  // Log error for debugging
  logger.error('Request error', {
    statusCode,
    code,
    message,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async route wrapper
 * Wraps async route handlers to catch and pass errors to error handler
 * 
 * @param fn - Async route handler function
 * @returns Wrapped function that catches errors
 * @example router.get('/', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
