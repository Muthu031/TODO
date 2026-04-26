/**
 * Type definitions for URL Shortener domain entities
 * Defines all interfaces used throughout the application
 */

/**
 * Link domain model - Represents a shortened URL
 */
export interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  customAlias?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Click analytics model - Records each visit to a shortened URL
 */
export interface Click {
  id: string;
  linkId: string;
  visitedAt: Date;
  ipAddress: string;
  userAgent: string;
  country?: string | null;
}

/**
 * Request to create a new short link
 */
export interface CreateLinkRequest {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: Date;
}

/**
 * Request to update a link's properties
 */
export interface UpdateLinkRequest {
  customAlias?: string;
  expiresAt?: Date;
}

/**
 * Analytics summary for a link
 */
export interface LinkAnalytics {
  linkId: string;
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  uniqueVisitors: number;
  createdAt: Date;
  lastClickedAt?: Date;
  topCountries: Record<string, number>;
  clicksOverTime: Array<{ date: string; count: number }>;
}

/**
 * API response wrapper for consistent response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * API error details
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}
