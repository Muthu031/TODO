/**
 * Utility functions for URL Shortener backend
 * Includes short code generation, URL validation, and other helpers
 */

import { APP_CONFIG } from '../config';

/**
 * CHARSET for Base62 encoding
 * Uses numbers, lowercase, and uppercase letters for compact representation
 */
const BASE62_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generate a unique short code using Base62 encoding
 * Produces URL-safe strings with high entropy
 * 
 * @param length - Length of short code to generate (default from config)
 * @returns Base62-encoded short code
 * @example generateShortCode() => "a3b2c1"
 */
export const generateShortCode = (length: number = APP_CONFIG.shortCodeLength): string => {
  let result = '';
  // Generate random bytes and convert to Base62
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE62_CHARSET.length);
    result += BASE62_CHARSET[randomIndex];
  }
  return result;
};

/**
 * Validate and sanitize a URL
 * Ensures URL is well-formed and doesn't contain dangerous protocols
 * 
 * @param url - URL string to validate
 * @returns true if valid, false otherwise
 * @throws Error if URL is malformed or potentially dangerous
 */
export const validateUrl = (url: string): boolean => {
  try {
    // Parse URL to ensure it's valid
    const parsedUrl = new URL(url);
    
    // Block dangerous protocols (javascript, data, file, etc.)
    const dangerousProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];
    if (dangerousProtocols.some(protocol => parsedUrl.protocol.toLowerCase().startsWith(protocol.replace(':', '')))) {
      throw new Error('Dangerous protocol detected');
    }
    
    // Block private/local IP addresses for security
    const privateIpPatterns = [
      /^localhost$/i,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^::1$/,
      /^fc00:/i,
      /^fe80:/i,
    ];
    
    const hostname = parsedUrl.hostname.toLowerCase();
    if (privateIpPatterns.some(pattern => pattern.test(hostname))) {
      throw new Error('Private IP address not allowed');
    }
    
    // Validate URL length (reasonable limit to prevent storage issues)
    if (url.length > 2048) {
      throw new Error('URL too long (max 2048 characters)');
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sanitize custom alias to ensure it's URL-safe
 * Removes special characters and enforces length constraints
 * 
 * @param alias - Custom alias string
 * @returns Sanitized alias or empty string if invalid
 */
export const sanitizeAlias = (alias: string): string => {
  // Allow alphanumeric, hyphens, and underscores
  const sanitized = alias.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 255);
  return sanitized;
};

/**
 * Check if a link has expired based on expiresAt timestamp
 * 
 * @param expiresAt - Expiration timestamp (null = no expiration)
 * @returns true if link has expired, false otherwise
 */
export const isLinkExpired = (expiresAt: Date | null | undefined): boolean => {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
};

/**
 * Extract country from IP address using MaxMind or similar service
 * Placeholder implementation - in production use IP geolocation API
 * 
 * @param ipAddress - IP address to geolocate
 * @returns ISO country code or 'XX' if unknown
 */
export const getCountryFromIp = async (ipAddress: string): Promise<string> => {
  // TODO: Integrate with IP geolocation service (MaxMind, ip-api, etc.)
  // For now, return placeholder
  return 'XX';
};

/**
 * Format date to ISO string for consistent serialization
 * 
 * @param date - Date object
 * @returns ISO 8601 formatted string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};
