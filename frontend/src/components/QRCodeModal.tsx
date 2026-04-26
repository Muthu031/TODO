/**
 * QR Code Modal Component
 * Displays QR code for shortened link with copy and download options
 * Theme: Fully themed with current theme context
 */

import React, { useRef } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { useTheme } from '../context/ThemeContext';
import { copyToClipboard } from '../utils';

interface QRCodeModalProps {
  /** Shortened URL to generate QR code for */
  shortUrl: string;
  /** Original URL (for reference) */
  originalUrl: string;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * Modal showing QR code for shortened link
 * Features: Display QR code, copy link, download QR code
 * Theme: Fully themed with current theme context
 */
export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  shortUrl,
  originalUrl,
  onClose,
}) => {
  // Get theme colors from context
  const { colors } = useTheme();

  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  /**
   * Handle copy to clipboard
   */
  const handleCopy = async (): Promise<void> => {
    try {
      await copyToClipboard(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Download QR code as PNG image
   */
  const handleDownloadQR = (): void => {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Overlay - Adaptive to theme */}
      <div
        className={`fixed inset-0 ${colors.backgroundTertiary} bg-opacity-70 flex items-center justify-center p-4 z-50`}
        onClick={onClose}
      >
        {/* Modal - Themed card */}
        <div
          className={`${colors.card} rounded-xl ${colors.shadow} max-w-md w-full p-8 ${colors.cardBorder} border`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 ${colors.textTertiary} hover:${colors.textSecondary} text-2xl transition-colors`}
          >
            ✕
          </button>

          {/* Success message */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-6 h-6 ${colors.success} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <h2 className={`text-xl font-bold ${colors.text}`}>Link shortened successfully!</h2>
          </div>

          {/* Shortened URL display */}
          <div className="mb-6">
            <p className={`text-sm ${colors.textSecondary} mb-2`}>Your shortened link:</p>
            <div className={`${colors.backgroundSecondary} ${colors.cardBorder} border rounded-lg p-4 break-all`}>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.primary} hover:underline font-mono font-semibold text-sm`}
              >
                {shortUrl}
              </a>
            </div>
          </div>

          {/* Copy link button */}
          <button
            onClick={handleCopy}
            className={`w-full ${colors.buttonPrimary} ${colors.buttonPrimaryText} px-6 py-3 rounded-lg font-semibold transition-all duration-200 mb-6 flex items-center justify-center gap-2 hover:scale-105 active:scale-95`}
          >
            {copied ? (
              <>
                <span>✓</span>
                <span>Copied to clipboard!</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span>Copy link</span>
              </>
            )}
          </button>

          {/* QR Code section */}
          <div className={`${colors.backgroundSecondary} ${colors.cardBorder} border rounded-lg p-6 mb-6 text-center`}>
            <p className={`text-sm ${colors.textSecondary} mb-4 font-semibold`}>QR Code:</p>
            <div
              ref={qrRef}
              className="flex justify-center mb-4"
            >
              <QRCode
                value={shortUrl}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
          </div>

          {/* Download QR Code button */}
          <button
            onClick={handleDownloadQR}
            className={`w-full ${colors.buttonSecondary} px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95`}
          >
            <span>⬇️</span>
            <span>Download QR Code</span>
          </button>

          {/* Original URL info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Original URL:</p>
            <p className="text-xs text-gray-500 break-words line-clamp-2">{originalUrl}</p>
          </div>
        </div>
      </div>
    </>
  );
};
