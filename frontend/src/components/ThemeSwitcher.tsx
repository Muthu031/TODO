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
 * Displays as a dropdown selector in the navigation bar
 */

import React from 'react';
import { useTheme, ThemeType } from '../context/ThemeContext';

/**
 * Theme Switcher Component
 * 
 * Renders a select dropdown to switch between themes.
 * Each option displays a user-friendly theme name.
 */
export const ThemeSwitcher: React.FC = () => {
  // Get theme context
  const { theme, setTheme } = useTheme();

  /**
   * Theme display names for UI
   * Maps technical theme names to user-friendly labels
   */
  const themeNames: Record<ThemeType, string> = {
    light: '☀️ Light',
    dark: '🌙 Dark',
    gradient: '🌈 Gradient',
    matte: '🎨 Matte',
    glassy: '✨ Glassy',
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
      <label htmlFor="theme-select" className="text-sm font-medium opacity-80">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={handleThemeChange}
        className="
          px-3 py-1.5 rounded
          text-sm font-semibold
          transition-all duration-300
          border border-current
          cursor-pointer
          bg-transparent
          opacity-90 hover:opacity-100
        "
      >
        {Object.entries(themeNames).map(([themeKey, themeName]) => (
          <option key={themeKey} value={themeKey}>
            {themeName}
          </option>
        ))}
      </select>
    </div>
  );
};
