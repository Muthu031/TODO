/** Frontend environment configuration */

// API endpoint configuration
// When deployed in Docker, backend is accessible via service name 'backend'
// When running locally, it's accessible via 'localhost'
export const API_BASE_URL = 'http://localhost:3000/api';

// App configuration
export const APP_CONFIG = {
  // Maximum URL length validation
  maxUrlLength: 2048,
  
  // Short code display format
  appUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  
  // Analytics chart defaults
  defaultChartDays: 30,
  
  // Pagination
  defaultPageSize: 10,
  maxPageSize: 100,
} as const;
