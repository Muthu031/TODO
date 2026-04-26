/**
 * Link Card Component
 * 
 * Displays individual link information in a themed card with:
 * - Link metadata (short code, alias, URLs, creation date)
 * - QR code for quick access
 * - Action buttons (Copy, Analytics, Delete)
 * - Theme-aware styling that adapts to current theme
 * 
 * Features:
 * - Responsive two-column layout (info left, QR code right)
 * - Clickable shortened URL for testing redirects
 * - Copy-to-clipboard functionality
 * - Responsive design for mobile/tablet/desktop
 */

import React, { useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Link } from '../types';
import { formatDate, generateShortUrl, copyToClipboard } from '../utils';
import { useTheme } from '../context/ThemeContext';

interface LinkCardProps {
  /** Link data to display */
  link: Link;
  /** Callback when delete button clicked */
  onDelete?: (id: string) => void;
  /** Callback when analytics button clicked */
  onAnalytics?: (id: string) => void;
  /** Show deletion loading state */
  isDeleting?: boolean;
}

/**
 * Card component for displaying shortened link
 * Shows short code, original URL, creation date, and QR code
 * Adapts styling based on current theme from context
 */
export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onDelete,
  onAnalytics,
  isDeleting = false,
}) => {
  // Get theme colors from context
  const { colors } = useTheme();

  // State for copy button feedback
  const [copied, setCopied] = useState(false);

  // Generate shortened URL from short code or custom alias
  const shortUrl = generateShortUrl(link.shortCode, link.customAlias || undefined);

  /**
   * Handle copy to clipboard
   * Provides visual feedback when link is copied
   */
  const handleCopy = async (): Promise<void> => {
    try {
      await copyToClipboard(shortUrl);
      setCopied(true);
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Check if link is expired based on expiration date
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

  return (
    <div className={`${colors.card} ${colors.cardBorder} border rounded-lg p-6 ${colors.shadowHover} transition-all duration-300`}>
      {/* Container with content on left and QR on right */}
      <div className="flex gap-6">
        {/* Left side: Link information */}
        <div className="flex-1">
          {/* Header: Short code and status */}
          <div className={`flex justify-between items-start mb-4 pb-4 border-b ${colors.borderLight}`}>
            <div>
              <p className={`text-sm ${colors.textSecondary} font-semibold uppercase mb-1`}>Short Code</p>
              <p className={`text-lg font-bold ${colors.primary} font-mono`}>{link.shortCode}</p>
            </div>
            {isExpired && (
              <span className={`${colors.errorBg} ${colors.error} px-2 py-1 rounded text-xs font-semibold`}>
                Expired
              </span>
            )}
          </div>

          {/* Custom alias if exists */}
          {link.customAlias && (
            <div className="mb-3">
              <p className={`text-sm ${colors.textSecondary} font-semibold uppercase mb-1`}>Alias</p>
              <p className={`text-sm font-bold ${colors.success}`}>{link.customAlias}</p>
            </div>
          )}

          {/* Shortened URL */}
          <div className="mb-3">
            <p className={`text-sm ${colors.textSecondary} mb-1 font-semibold uppercase`}>Shortened URL</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                text-sm ${colors.primary} hover:underline break-all font-mono font-semibold
                ${colors.backgroundSecondary} p-3 rounded border ${colors.borderLight}
                inline-block transition-colors duration-200 ${colors.cardHover}
              `}
              title={`Click to test: ${shortUrl}`}
            >
              {shortUrl}
            </a>
          </div>

          {/* Original URL */}
          <div className="mb-3">
            <p className={`text-sm ${colors.textSecondary} mb-1 font-semibold uppercase`}>Original URL</p>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm ${colors.primary} hover:underline break-words`}
              title={link.originalUrl}
            >
              {link.originalUrl}
            </a>
          </div>

          {/* Created Date */}
          <div className="text-sm">
            <p className={`${colors.textSecondary} text-xs font-semibold uppercase mb-1`}>Created</p>
            <p className={`font-semibold ${colors.text}`}>{formatDate(link.createdAt)}</p>
          </div>
        </div>

        {/* Right side: QR Code */}
        <div className="flex-shrink-0">
          <div className={`${colors.backgroundSecondary} p-3 rounded border ${colors.borderLight}`}>
            <QRCode
              value={shortUrl}
              size={120}
              level="H"
              includeMargin={true}
              fgColor={link.expiresAt && isExpired ? '#999999' : '#000000'}
              bgColor="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={`flex gap-3 mt-6 pt-6 border-t ${colors.borderLight}`}>
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`
            flex-1 px-4 py-2 ${colors.buttonSecondary} text-sm font-semibold
            transition-all duration-200 rounded
            hover:scale-105 active:scale-95
          `}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>

        {/* Analytics button */}
        {onAnalytics && (
          <button
            onClick={() => onAnalytics(link.id)}
            className={`
              flex-1 px-4 py-2 ${colors.buttonSecondary} text-sm font-semibold
              transition-all duration-200 rounded
              hover:scale-105 active:scale-95
            `}
          >
            Analytics
          </button>
        )}

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={() => onDelete(link.id)}
            disabled={isDeleting}
            className={`
              flex-1 px-4 py-2 ${colors.error} ${colors.errorBg} text-sm font-semibold
              transition-all duration-200 rounded
              hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isDeleting ? '...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};
