/**
 * Dashboard Page - Link Management
 * Shows all created links with pagination
 * Features: List links, delete links, view analytics
 * Theme: Fully themed with current theme context
 */

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLinks, useDeleteLink, useAnalytics } from '../hooks';
import { LinkCard } from '../components/LinkCard';
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
} from '../components/Common';
import { AnalyticsChart } from '../components/AnalyticsChart';

/**
 * Dashboard page component
 * Shows list of all shortened links with management options
 * Uses theme colors from context for all styling
 */
export const DashboardPage: React.FC = () => {
  // Get theme colors from context
  const { colors } = useTheme();

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
      <div className={`min-h-screen ${colors.gradientBg} py-12 px-4`}>
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setSelectedLinkId(null)}
            className={`mb-6 ${colors.primary} hover:underline font-semibold transition-colors`}
          >
            ← Back to Dashboard
          </button>

          {/* Analytics header */}
          <div className={`${colors.card} ${colors.cardBorder} border rounded-lg p-8 ${colors.shadow} mb-6`}>
            <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>Link Analytics</h2>
            <div className="mb-4">
              <p className={`${colors.textSecondary} mb-1`}>Short Code: <span className="font-mono font-bold">{analyticsData.shortCode}</span></p>
              <p className={`${colors.textSecondary}`}>Original URL: <a href={analyticsData.originalUrl} target="_blank" rel="noopener noreferrer" className={`${colors.primary} hover:underline`}>{analyticsData.originalUrl}</a></p>
            </div>
          </div>

          {/* Analytics charts */}
          {isLoadingAnalytics ? (
            <LoadingSpinner text="Loading analytics..." />
          ) : (
            <div className={`${colors.card} ${colors.cardBorder} border rounded-lg p-8 ${colors.shadow}`}>
              <AnalyticsChart analytics={analyticsData} />
            </div>
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
    <div className={`min-h-screen ${colors.gradientBg} py-12 px-4`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className={`text-4xl font-bold ${colors.text} mb-2`}>Your Links</h1>
          <p className={`text-lg ${colors.textSecondary}`}>
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
                <span className={`${colors.textSecondary} font-semibold flex items-center`}>
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
          <div className={`${colors.card} ${colors.cardBorder} border rounded-lg p-8 ${colors.shadow} text-center`}>
            <p className={`${colors.textSecondary} text-lg`}>
              No shortened links yet. Start by creating one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};