/**
 * Link Card Component
 * Displays individual link information in list/dashboard
 */

import React, { useState } from 'react';
import { Link } from '../types';
import { formatDate, generateShortUrl, formatNumber, copyToClipboard } from '../utils';

interface LinkCardProps {
  /** Link data to display */
  link: Link;
  /** Total clicks for this link */
  clicks?: number;
  /** Callback when delete button clicked */
  onDelete?: (id: string) => void;
  /** Callback when analytics button clicked */
  onAnalytics?: (id: string) => void;
  /** Show deletion loading state */
  isDeleting?: boolean;
}

/**
 * Card component for displaying shortened link
 * Shows short code, original URL, creation date, click count
 */
export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  clicks = 0,
  onDelete,
  onAnalytics,
  isDeleting = false,
}) => {
  const [copied, setCopied] = useState(false);
  
  // Generate shortened URL
  const shortUrl = generateShortUrl(link.shortCode, link.customAlias || undefined);
  
  const handleCopy = async (): Promise<void> => {
    try {
      await copyToClipboard(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  // Check if link is expired
  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header: Short code and status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-gray-600">Short Code</p>
          <p className="text-lg font-bold text-blue-600 font-mono">{link.shortCode}</p>
        </div>
        {isExpired && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
            Expired
          </span>
        )}
      </div>
      
      {/* Custom alias if exists */}
      {link.customAlias && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">Custom Alias</p>
          <p className="text-sm font-semibold text-green-600">{link.customAlias}</p>
        </div>
      )}
      
      {/* Original URL */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">Original URL</p>
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline break-words truncate"
          title={link.originalUrl}
        >
          {link.originalUrl}
        </a>
      </div>
      
      {/* Metadata: Created date and clicks */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Created</p>
          <p className="font-semibold">{formatDate(link.createdAt)}</p>
        </div>
        <div>
          <p className="text-gray-600">Clicks</p>
          <p className="font-semibold">{formatNumber(clicks)}</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-semibold transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        
        {/* Analytics button */}
        {onAnalytics && (
          <button
            onClick={() => onAnalytics(link.id)}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-semibold transition-colors"
          >
            Analytics
          </button>
        )}
        
        {/* Delete button */}
        {onDelete && (
          <button
            onClick={() => onDelete(link.id)}
            disabled={isDeleting}
            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? '...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};
