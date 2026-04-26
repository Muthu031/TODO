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
            <div className="flex gap-6">
              <button
                onClick={() => setCurrentPage('home')}
                className={`font-semibold transition-colors ${
                  currentPage === 'home'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Link
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`font-semibold transition-colors ${
                  currentPage === 'dashboard'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
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