/**
 * Custom React hooks for URL Shortener
 * Encapsulates complex logic and API interactions
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import ApiService from '../services/api';

/**
 * Hook to create a shortened link
 * Returns mutation function and loading/error states
 * 
 * @returns Object with mutate function and states
 * @example
 * const { mutate, isLoading, error } = useCreateLink();
 * mutate({ originalUrl: 'https://example.com' });
 */
export const useCreateLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (params: { originalUrl: string; customAlias?: string; expiresAt?: Date }) =>
      ApiService.createLink(params.originalUrl, params.customAlias, params.expiresAt),
    {
      onSuccess: () => {
        // Invalidate links query to refresh dashboard
        queryClient.invalidateQueries('links');
      },
    }
  );
};

/**
 * Hook to fetch all links with pagination
 * Returns links data and loading states
 * 
 * @param page - Current page
 * @param limit - Items per page
 * @returns Query result with links data
 */
export const useLinks = (page: number = 1, limit: number = 10) => {
  return useQuery(
    ['links', page, limit],
    () => ApiService.getAllLinks(page, limit),
    {
      staleTime: 5000, // Keep data fresh for 5 seconds
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );
};

/**
 * Hook to fetch a single link by ID
 * 
 * @param id - Link ID
 * @returns Query result with link data
 */
export const useLink = (id: string) => {
  return useQuery(
    ['link', id],
    () => ApiService.getLink(id),
    {
      staleTime: 5000,
      enabled: !!id, // Only fetch if ID provided
    }
  );
};

/**
 * Hook to update a link
 * 
 * @returns Mutation object with update function
 */
export const useUpdateLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (params: { id: string; customAlias?: string; expiresAt?: Date }) =>
      ApiService.updateLink(params.id, params.customAlias, params.expiresAt),
    {
      onSuccess: (updatedLink) => {
        // Update cache for this link
        queryClient.setQueryData(['link', updatedLink.id], updatedLink);
        // Invalidate links list
        queryClient.invalidateQueries('links');
      },
    }
  );
};

/**
 * Hook to delete a link
 * 
 * @returns Mutation object with delete function
 */
export const useDeleteLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation((id: string) => ApiService.deleteLink(id), {
    onSuccess: () => {
      // Invalidate both links and analytics
      queryClient.invalidateQueries('links');
      queryClient.invalidateQueries('analytics');
    },
  });
};

/**
 * Hook to fetch analytics for a link
 * 
 * @param id - Link ID
 * @returns Query result with analytics data
 */
export const useAnalytics = (id: string) => {
  return useQuery(
    ['analytics', id],
    () => ApiService.getAnalytics(id),
    {
      staleTime: 30000, // Analytics can be stale for 30 seconds
      refetchInterval: 60000, // Refetch every minute
      enabled: !!id, // Only fetch if ID provided
    }
  );
};
