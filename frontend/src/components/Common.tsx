/**
 * Loading Spinner Component
 * Displays during data fetching
 */

import React from 'react';

interface LoadingSpinnerProps {
  /** Text to display below spinner */
  text?: string;
}

/**
 * Loading spinner with optional text
 * Uses Tailwind CSS for styling
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Spinning circle animation */}
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

/**
 * Error message component
 * Displays error alerts to user
 */
interface ErrorMessageProps {
  /** Error message text */
  message?: string;
  /** Optional callback to dismiss error */
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-red-700">
            <strong>Error:</strong> {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Success message component
 * Displays success alerts to user
 */
interface SuccessMessageProps {
  /** Success message text */
  message?: string;
  /** Optional callback to dismiss message */
  onDismiss?: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onDismiss }) => {
  if (!message) return null;
  
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-green-700">
            <strong>Success!</strong> {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-400 hover:text-green-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Button component with loading state
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label */
  children: React.ReactNode;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = 'primary',
  disabled,
  ...props
}) => {
  const baseStyles =
    'px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⌛</span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Card component for layouts
 */
interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Optional card title */
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, title }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>}
      {children}
    </div>
  );
};

/**
 * Input field component
 */
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700">{label}</label>}
      <input
        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className || ''}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
