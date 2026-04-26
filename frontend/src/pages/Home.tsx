/**
 * Home Page - Link Creation
 * Main page where users shorten URLs
 * Features: URL input, custom alias, expiration picker
 */

import React, { useState } from 'react';
import { useCreateLink } from '../hooks';
import {
  InputField,
  Button,
  Card,
  ErrorMessage,
  SuccessMessage,
} from '../components/Common';
import { validateUrl, validateAlias, generateShortUrl } from '../utils';
import { Link } from '../types';

/**
 * Home page component
 * Displays form to create shortened links
 */
export const HomePage: React.FC = () => {
  // Form state
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  
  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [createdLink, setCreatedLink] = useState<Link | null>(null);
  
  // API mutation
  const { mutate: createLink, isLoading: isCreating, error } = useCreateLink();
  
  /**
   * Validate form inputs
   * Returns true if all validations pass
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate URL
    if (!originalUrl.trim()) {
      newErrors.originalUrl = 'URL is required';
    } else if (!validateUrl(originalUrl)) {
      newErrors.originalUrl = 'Please enter a valid URL (http:// or https://)';
    }
    
    // Validate custom alias if provided
    if (customAlias && !validateAlias(customAlias)) {
      newErrors.customAlias = 'Alias must be 3-255 characters (alphanumeric, -, _)';
    }
    
    // Validate expiration date if provided
    if (expiresAt) {
      const expireDate = new Date(expiresAt);
      if (expireDate <= new Date()) {
        newErrors.expiresAt = 'Expiration date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handle form submission
   * Creates new shortened link
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    createLink(
      {
        originalUrl,
        customAlias: customAlias || undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      {
        onSuccess: (link) => {
          // Success: show created link
          setCreatedLink(link);
          setSuccessMessage('Link created successfully!');
          
          // Reset form
          setOriginalUrl('');
          setCustomAlias('');
          setExpiresAt('');
          setErrors({});
          
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
        },
        onError: (err: any) => {
          // Handle specific error types
          const errorMsg = err?.response?.data?.error || 'Failed to create link';
          setErrors({ submit: errorMsg });
        },
      }
    );
  };
  
  // Calculate minimum date for expiration (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">URL Shortener</h1>
          <p className="text-lg text-gray-600">
            Create short, shareable links with optional custom aliases and expiration
          </p>
        </div>
        
        {/* Main form card */}
        <Card title="Create Shortened Link">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {(errors.submit || error) ? (
              <ErrorMessage
                message={errors.submit || ((error as any)?.message as string) || 'An error occurred'}
                onDismiss={() => setErrors({ ...errors, submit: '' })}
              />
            ) : null}
            
            {/* Success message */}
            {successMessage && <SuccessMessage message={successMessage} />}
            
            {/* URL input */}
            <InputField
              label="Original URL *"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={originalUrl}
              onChange={(e) => {
                setOriginalUrl(e.target.value);
                if (errors.originalUrl) {
                  setErrors({ ...errors, originalUrl: '' });
                }
              }}
              error={errors.originalUrl}
            />
            
            {/* Custom alias input */}
            <InputField
              label="Custom Alias (Optional)"
              type="text"
              placeholder="my-link"
              value={customAlias}
              onChange={(e) => {
                setCustomAlias(e.target.value);
                if (errors.customAlias) {
                  setErrors({ ...errors, customAlias: '' });
                }
              }}
              error={errors.customAlias}
            />
            
            {/* Expiration date input */}
            <InputField
              label="Expiration Date (Optional)"
              type="date"
              value={expiresAt}
              onChange={(e) => {
                setExpiresAt(e.target.value);
                if (errors.expiresAt) {
                  setErrors({ ...errors, expiresAt: '' });
                }
              }}
              error={errors.expiresAt}
              min={minDateStr}
            />

            {/* Submit button */}
            <Button
              type="submit"
              isLoading={isCreating}
              className="w-full"
            >
              Create Short Link
            </Button>
          </form>
        </Card>

        {/* Display created link */}
        {createdLink && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Shortened Link</h2>
            <Card>
              <div className="text-center space-y-4">
                {/* Short URL display */}
                <div>
                  <p className="text-gray-600 mb-2">Your short URL:</p>
                  <p className="text-2xl font-mono font-bold text-blue-600 break-all">
                    {generateShortUrl(createdLink.shortCode, createdLink.customAlias || undefined)}
                  </p>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      generateShortUrl(createdLink.shortCode, createdLink.customAlias || undefined)
                    );
                    alert('Copied to clipboard!');
                  }}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};