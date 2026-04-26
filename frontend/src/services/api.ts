/**
 * API service - Centralized API calls for backend communication
 * Uses Axios for HTTP requests with error handling and type safety
 */

import axios, { AxiosInstance } from 'axios';
import {
  Link,
  LinkAnalytics,
  ApiResponse,
  PaginatedResponse,
} from '../types';
import { API_BASE_URL } from '../config';

/**
 * Initialize Axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API Service class - Encapsulates all backend API calls
 */
export class ApiService {
  /**
   * Create a new shortened link
   * 
   * @param originalUrl - URL to shorten
   * @param customAlias - Optional custom alias
   * @param expiresAt - Optional expiration date
   * @returns Created link with shortCode
   */
  static async createLink(
    originalUrl: string,
    customAlias?: string,
    expiresAt?: Date
  ): Promise<Link> {
    try {
      const response = await apiClient.post<ApiResponse<Link>>('/links', {
        originalUrl,
        customAlias,
        expiresAt: expiresAt?.toISOString(),
      });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create link');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Get a link by ID
   * 
   * @param id - Link ID
   * @returns Link details
   */
  static async getLink(id: string): Promise<Link> {
    try {
      const response = await apiClient.get<ApiResponse<Link>>(`/links/${id}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch link');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Get all links with pagination
   * 
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Paginated links
   */
  static async getAllLinks(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Link>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Link>>('/links', {
        params: { page, limit },
      });
      
      if (!response.data.success) {
        throw new Error('Failed to fetch links');
      }
      
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Update a link
   * 
   * @param id - Link ID
   * @param customAlias - New custom alias (optional)
   * @param expiresAt - New expiration date (optional)
   * @returns Updated link
   */
  static async updateLink(
    id: string,
    customAlias?: string,
    expiresAt?: Date
  ): Promise<Link> {
    try {
      const response = await apiClient.patch<ApiResponse<Link>>(`/links/${id}`, {
        customAlias,
        expiresAt: expiresAt?.toISOString(),
      });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to update link');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Delete a link
   * 
   * @param id - Link ID
   */
  static async deleteLink(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/links/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete link');
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Get analytics for a link
   * 
   * @param id - Link ID
   * @returns Analytics data including click counts and trends
   */
  static async getAnalytics(id: string): Promise<LinkAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<LinkAnalytics>>(`/analytics/${id}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch analytics');
      }
      
      return response.data.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  /**
   * Handle and format API errors
   * 
   * @param error - Error object from API call
   */
  private static handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        console.error('API Error:', error.response.data.error);
      } else if (error.message) {
        console.error('API Error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Export as default
export default ApiService;
