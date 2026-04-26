/**
 * Type definitions for URL Shortener frontend
 * Matches backend types for type safety
 */

/**
 * Link entity - shortened URL representation
 */
export interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  customAlias?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Click analytics record
 */
export interface Click {
  id: string;
  linkId: string;
  visitedAt: string;
  ipAddress: string;
  userAgent: string;
  country?: string | null;
}

/**
 * Link analytics summary
 */
export interface LinkAnalytics {
  linkId: string;
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  uniqueVisitors: number;
  createdAt: string;
  lastClickedAt?: string;
  topCountries: Record<string, number>;
  clicksOverTime: Array<{ date: string; count: number }>;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
  };
  timestamp?: string;
}
