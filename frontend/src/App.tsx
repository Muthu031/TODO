/**
 * Main App Component
 * Router setup, global layout, and theme provider
 * 
 * Features:
 * - Multiple theme support (Light, Dark, Gradient, Matte, Glassy)
 * - Navigation between Home and Dashboard pages
 * - React Query for server state management
 * - Theme switcher in navigation bar
 */

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { HomePage } from './pages/Home';
import { DashboardPage } from './pages/Dashboard';
import { ThemeSwitcher } from './components/ThemeSwitcher';

/**
 * Create React Query client for server state management
 * Configuration:
 * - Don't refetch on window focus for better UX
 * - Retry failed requests once
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
 * Inner App Component
 * Separated to use theme context inside ThemeProvider
 */
function AppContent() {
  // Get current theme colors from context
  const { colors } = useTheme();

  // Current page state for navigation
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');

  return (
    <QueryClientProvider client={queryClient}>
      {/* Main container with theme background */}
      <div className={`min-h-screen ${colors.gradientBg}`}>
        {/* Navigation Header - Themed with current theme colors */}
        <nav className={`${colors.navBackground} ${colors.shadow} border-b ${colors.navBorder}`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
            {/* Logo/Title Section */}
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">⊕</span>
              <h1 className={`text-2xl font-bold ${colors.text}`}>
                URL Shortener
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="flex gap-6 items-center">
              {/* Create Link Button */}
              <button
                onClick={() => setCurrentPage('home')}
                className={`
                  font-semibold px-4 py-2 transition-all duration-200 rounded
                  ${
                    currentPage === 'home'
                      ? `${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                      : `${colors.navText} hover:${colors.cardHover}`
                  }
                `}
              >
                ✎ Create Link
              </button>

              {/* Dashboard Button */}
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`
                  font-semibold px-4 py-2 transition-all duration-200 rounded
                  ${
                    currentPage === 'dashboard'
                      ? `${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                      : `${colors.navText} hover:${colors.cardHover}`
                  }
                `}
              >
                ▤ Dashboard
              </button>

              {/* Theme Switcher */}
              <div className={`${colors.navText}`}>
                <ThemeSwitcher />
              </div>
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

/**
 * Main App Component
 * Wraps AppContent with ThemeProvider to enable theme context
 */
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
export default App;