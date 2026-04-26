/**
 * Main App Component
 * Router setup and global layout
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HomePage } from './pages/Home';
import { DashboardPage } from './pages/Dashboard';

/**
 * Create React Query client for server state management
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Main App component with navigation and routing
 */
function App() {
  // Current page state
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔗</span>
              <h1 className="text-2xl font-bold text-gray-900">URL Shortener</h1>
            </div>

            {/* Navigation Links */}
            <div className="flex gap-8 items-center">
              <button
                onClick={() => setCurrentPage('home')}
                className={`font-semibold px-3 py-2 transition-colors rounded ${
                  currentPage === 'home'
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Create Link
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`font-semibold px-3 py-2 transition-colors rounded ${
                  currentPage === 'dashboard'
                    ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main>
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'dashboard' && <DashboardPage />}
        </main>
      </div>
    </QueryClientProvider>
  );
}
export default App;