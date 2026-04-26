/**
 * QR Code Modal Component
 * Displays QR code for shortened link with copy and download options
 */

import React, { useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
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
 */
export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  shortUrl,
  originalUrl,
  onClose,
}) => {
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
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>

          {/* Success message */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Link shortened successfully!</h2>
          </div>

          {/* Shortened URL display */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Your shortened link:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 break-all">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono font-semibold text-sm"
              >
                {shortUrl}
              </a>
            </div>
          </div>

          {/* Copy link button */}
          <button
            onClick={handleCopy}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 mb-6 flex items-center justify-center gap-2"
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-4 font-semibold">QR Code:</p>
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
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
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
