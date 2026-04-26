/** Frontend environment configuration */

// API endpoint configuration
// Local dev: backend on port 3001 (npm run dev)
// Docker: backend on port 3000 (docker-compose)
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173';
export const API_BASE_URL = isLocalDev ? 'http://localhost:3001/api' : 'http://localhost:3000/api';

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
