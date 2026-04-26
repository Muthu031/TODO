/**
 * Dashboard Page - Link Management
 * Shows all created links with pagination
 * Features: List links, delete links, view analytics
 */

import React, { useState } from 'react';
import { useLinks, useDeleteLink, useAnalytics } from '../hooks';
import { LinkCard } from '../components/LinkCard';
import {
  LoadingSpinner,
  ErrorMessage,
  Card,
  Button,
} from '../components/Common';
import { AnalyticsChart } from '../components/AnalyticsChart';

/**
 * Dashboard page component
 * Shows list of all shortened links with management options
 */
export const DashboardPage: React.FC = () => {
  // Pagination state
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Selected link for analytics view
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  
  // API operations
  const { data: linksData, isLoading: isLoadingLinks, error: linksError } = useLinks(
    page,
    ITEMS_PER_PAGE
  );
  const { mutate: deleteLink, isLoading: isDeleting } = useDeleteLink();
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useAnalytics(
    selectedLinkId || ''
  );
  
  /**
   * Handle link deletion with confirmation
   */
  const handleDelete = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      deleteLink(id);
    }
  };

  /**
   * Handle analytics view
   */
  const handleViewAnalytics = (id: string): void => {
    setSelectedLinkId(id === selectedLinkId ? null : id);
  };

  // Show analytics view if selected
  if (selectedLinkId && analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setSelectedLinkId(null)}
            className="mb-6 text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Back to Dashboard
          </button>

          {/* Analytics header */}
          <Card title="Link Analytics">
            <div className="mb-4">
              <p className="text-gray-600 mb-1">Short Code: <span className="font-mono font-bold">{analyticsData.shortCode}</span></p>
              <p className="text-gray-600">Original URL: <a href={analyticsData.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{analyticsData.originalUrl}</a></p>
            </div>
          </Card>

          {/* Analytics charts */}
          {isLoadingAnalytics ? (
            <LoadingSpinner text="Loading analytics..." />
          ) : (
            <Card>
              <AnalyticsChart analytics={analyticsData} />
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingLinks) {
    return <LoadingSpinner text="Loading your links..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Links</h1>
          <p className="text-lg text-gray-600">
            Manage your shortened links, view analytics, and track performance
          </p>
        </div>

        {/* Error message */}
        {linksError ? (
          <ErrorMessage message={((linksError as any)?.message as string) || 'Failed to load links'} />
        ) : null}

        {/* Links grid */}
        {linksData?.data && linksData.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {linksData.data.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDelete={handleDelete}
                  onAnalytics={handleViewAnalytics}
                  isDeleting={isDeleting}
                />
              ))}
            </div>

            {/* Pagination */}
            {linksData.pagination && linksData.pagination.page > 1 && (
              <div className="flex gap-4 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </Button>
                <span className="text-gray-600 font-semibold flex items-center">
                  Page {linksData.pagination.page}
                </span>
                {linksData.data.length === ITEMS_PER_PAGE && (
                  <Button
                    variant="secondary"
                    onClick={() => setPage(page + 1)}
                  >
                    Next →
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No links created yet</p>
              <a
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Create Your First Link
              </a>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};