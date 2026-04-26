/**
 * Theme Switcher Component
 * 
 * Allows users to switch between different themes:
 * - Light: Clean and minimal
 * - Dark: Eye-friendly dark mode
 * - Gradient: Vibrant with gradients
 * - Matte: Flat modern design
 * - Glassy: Glassmorphism effects
 * 
 * Displays as a dropdown selector in the navigation bar with theme-aware styling
 */

import React from 'react';
import { useTheme, ThemeType } from '../context/ThemeContext';

/**
 * Theme Switcher Component
 * 
 * Renders a select dropdown to switch between themes.
 * Each option displays a user-friendly theme name.
 * All styling adapts to the current theme for consistent appearance.
 */
export const ThemeSwitcher: React.FC = () => {
  // Get theme context with colors
  const { theme, colors, setTheme } = useTheme();

  /**
   * Theme display names for UI
   * Maps technical theme names to user-friendly labels with outline icons
   * Uses simple, clean outline unicode characters instead of emoji
   */
  const themeNames: Record<ThemeType, string> = {
    light: '○ Light',
    dark: '◑ Dark',
    gradient: '≈ Gradient',
    matte: '⬜ Matte',
    glassy: '◇ Glassy',
  };

  /**
   * Handle theme change
   * Updates the theme context when user selects a new theme
   */
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as ThemeType);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <label 
        htmlFor="theme-select" 
        className={`text-sm font-semibold ${colors.navText} opacity-90`}
      >
        Theme:
      </label>

      {/* Select Dropdown - Theme-aware styling */}
      <select
        id="theme-select"
        value={theme}
        onChange={handleThemeChange}
        className={`
          px-3 py-1.5 rounded
          text-sm font-semibold
          transition-all duration-300
          ${colors.navText}
          ${colors.buttonSecondary}
          border border-current
          cursor-pointer
          hover:opacity-100 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-1
          appearance-none
          bg-no-repeat
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
        }}
      >
        {/* Option items with proper styling */}
        {Object.entries(themeNames).map(([themeKey, themeName]) => (
          <option 
            key={themeKey} 
            value={themeKey}
            className="bg-white text-gray-900 font-semibold"
          >
            {themeName}
          </option>
        ))}
      </select>
    </div>
  );
};
