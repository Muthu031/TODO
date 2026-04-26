/**
 * Utility functions for frontend
 * Includes URL validation, formatting, and helper functions
 */

import { APP_CONFIG } from '../config';

/**
 * Copy text to clipboard
 * Shows visual feedback to user
 * 
 * @param text - Text to copy
 * @param element - Optional element to show feedback on
 */
export const copyToClipboard = async (text: string, element?: HTMLElement): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    
    // Show visual feedback
    if (element) {
      const originalText = element.textContent;
      element.textContent = '✓ Copied!';
      setTimeout(() => {
        element.textContent = originalText;
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    alert('Failed to copy to clipboard');
  }
};

/**
 * Format URL for display (truncate if too long)
 * 
 * @param url - URL to format
 * @param maxLength - Maximum length before truncating
 * @returns Formatted URL
 */
export const formatUrl = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) {
    return url;
  }
  return url.substring(0, maxLength - 3) + '...';
};

/**
 * Validate URL format
 * Checks if URL is valid and safe
 * 
 * @param url - URL to validate
 * @returns true if valid, false otherwise
 */
export const validateUrl = (url: string): boolean => {
  if (!url || url.length > APP_CONFIG.maxUrlLength) {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    // Allow only http and https
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate custom alias format
 * Ensures alias is safe for URLs
 * 
 * @param alias - Alias to validate
 * @returns true if valid, false otherwise
 */
export const validateAlias = (alias: string): boolean => {
  if (!alias || alias.length < 3 || alias.length > 255) {
    return false;
  }
  
  // Allow only alphanumeric, hyphens, and underscores
  return /^[a-zA-Z0-9_-]+$/.test(alias);
};

/**
 * Format date to readable string
 * 
 * @param dateString - ISO date string
 * @returns Formatted date like "Dec 25, 2024"
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time
 * 
 * @param dateString - ISO date string
 * @returns Formatted date and time like "Dec 25, 2024, 2:30 PM"
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate full shortened URL
 * 
 * @param shortCode - Short code
 * @param customAlias - Custom alias (if exists)
 * @returns Full shortened URL
 */
export const generateShortUrl = (shortCode: string, customAlias?: string): string => {
  const identifier = customAlias || shortCode;
  return `${APP_CONFIG.appUrl}/${identifier}`;
};

/**
 * Format number as compact string (1000 -> "1K")
 * 
 * @param num - Number to format
 * @returns Formatted number
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Get country name from country code
 * 
 * @param code - ISO country code
 * @returns Country name
 */
export const getCountryName = (code: string): string => {
  const countries: Record<string, string> = {
    US: 'United States',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    CA: 'Canada',
    AU: 'Australia',
    JP: 'Japan',
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico',
    XX: 'Unknown',
  };
  
  return countries[code] || code;
};
