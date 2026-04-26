/**
 * Home Page - Link Creation
 * Main page where users shorten URLs
 * Features: URL input, custom alias, expiration picker, QR code generation
 * Theme: Fully themed with current theme context
 */

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCreateLink } from '../hooks';
import {
  InputField,
  Button,
  ErrorMessage,
  SuccessMessage,
} from '../components/Common';
import { QRCodeModal } from '../components/QRCodeModal';
import { validateUrl, validateAlias, generateShortUrl } from '../utils';
import { Link } from '../types';

/**
 * Home page component
 * Displays form to create shortened links
 * Uses theme colors from context
 */
export const HomePage: React.FC = () => {
  // Get theme colors from context
  const { colors } = useTheme();

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
    <div className={`min-h-screen ${colors.gradientBg} py-12 px-4`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${colors.text} mb-2`}>Create Shortened Link</h1>
          <p className={`text-lg ${colors.textSecondary}`}>
            Generate short, shareable links with optional custom aliases and expiration dates
          </p>
        </div>
        
        {/* Main form card */}
        <div className={`${colors.card} ${colors.cardBorder} border rounded-lg p-8 ${colors.shadow}`}>
          <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>URL Input Form</h2>
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
        </div>

        {/* Display created link with QR code modal */}
        {createdLink && (
          <QRCodeModal
            shortUrl={generateShortUrl(createdLink.shortCode, createdLink.customAlias || undefined)}
            originalUrl={createdLink.originalUrl}
            onClose={() => setCreatedLink(null)}
          />
        )}
      </div>
    </div>
  );
};