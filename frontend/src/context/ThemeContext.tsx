/**
 * Theme Context & Provider
 * 
 * Manages application-wide theme switching between:
 * - Light: Clean, minimalist light colors
 * - Dark: Eye-friendly dark colors with high contrast
 * - Gradient: Vibrant gradient backgrounds
 * - Matte: Modern matte/flat design aesthetic
 * - Glassy: Glassmorphism with frosted glass effects
 * 
 * Usage:
 * const { theme, colors } = useTheme();
 * Then use colors in classNames or styles
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Theme type definition
 */
export type ThemeType = 'light' | 'dark' | 'gradient' | 'matte' | 'glassy';

/**
 * Color palette structure for each theme
 */
export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Border colors
  border: string;
  borderLight: string;

  // Component colors
  card: string;
  cardHover: string;
  cardBorder: string;

  // Primary accent colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Navigation
  navBackground: string;
  navBorder: string;
  navText: string;
  navTextActive: string;

  // Buttons
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;

  // Status colors
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;

  // Shadows (for glassy effect)
  shadow: string;
  shadowHover: string;

  // Gradient overlay
  gradientBg: string;
}

/**
 * Theme definitions with color palettes
 */
const themes: Record<ThemeType, ThemeColors> = {
  /**
   * Light Theme - Clean, professional, minimalist
   * Best for: Professional use, readability
   */
  light: {
    background: 'bg-white',
    backgroundSecondary: 'bg-gray-50',
    backgroundTertiary: 'bg-gray-100',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-500',
    border: 'border-gray-300',
    borderLight: 'border-gray-200',
    card: 'bg-white',
    cardHover: 'hover:bg-gray-50',
    cardBorder: 'border-gray-200',
    primary: 'text-blue-600',
    primaryLight: 'text-blue-500',
    primaryDark: 'text-blue-700',
    navBackground: 'bg-white',
    navBorder: 'border-gray-200',
    navText: 'text-gray-600',
    navTextActive: 'text-blue-600',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
    buttonPrimaryHover: 'bg-blue-700',
    buttonPrimaryText: 'text-white',
    buttonSecondary: 'bg-gray-200 hover:bg-gray-300',
    buttonSecondaryHover: 'bg-gray-300',
    success: 'text-green-600',
    successBg: 'bg-green-50',
    error: 'text-red-600',
    errorBg: 'bg-red-50',
    warning: 'text-amber-600',
    warningBg: 'bg-amber-50',
    shadow: 'shadow-sm',
    shadowHover: 'hover:shadow-md',
    gradientBg: 'bg-white',
  },

  /**
   * Dark Theme - Eye-friendly, modern dark mode
   * Best for: Night time use, reduced eye strain
   */
  dark: {
    background: 'bg-slate-900',
    backgroundSecondary: 'bg-slate-800',
    backgroundTertiary: 'bg-slate-700',
    text: 'text-slate-50',
    textSecondary: 'text-slate-300',
    textTertiary: 'text-slate-400',
    border: 'border-slate-700',
    borderLight: 'border-slate-600',
    card: 'bg-slate-800',
    cardHover: 'hover:bg-slate-700',
    cardBorder: 'border-slate-700',
    primary: 'text-cyan-400',
    primaryLight: 'text-cyan-300',
    primaryDark: 'text-cyan-500',
    navBackground: 'bg-slate-800',
    navBorder: 'border-slate-700',
    navText: 'text-slate-300',
    navTextActive: 'text-cyan-400',
    buttonPrimary: 'bg-cyan-600 hover:bg-cyan-700',
    buttonPrimaryHover: 'bg-cyan-700',
    buttonPrimaryText: 'text-slate-900',
    buttonSecondary: 'bg-slate-700 hover:bg-slate-600',
    buttonSecondaryHover: 'bg-slate-600',
    success: 'text-emerald-400',
    successBg: 'bg-emerald-900 bg-opacity-30',
    error: 'text-red-400',
    errorBg: 'bg-red-900 bg-opacity-30',
    warning: 'text-amber-400',
    warningBg: 'bg-amber-900 bg-opacity-30',
    shadow: 'shadow-xl shadow-black/50',
    shadowHover: 'hover:shadow-2xl hover:shadow-black/70',
    gradientBg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
  },

  /**
   * Gradient Theme - Vibrant, modern with gradients
   * Best for: Creative projects, visual impact
   */
  gradient: {
    background: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
    backgroundSecondary: 'bg-gradient-to-r from-indigo-100 to-purple-100',
    backgroundTertiary: 'bg-gradient-to-r from-purple-100 to-pink-100',
    text: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textTertiary: 'text-gray-600',
    border: 'border-purple-300',
    borderLight: 'border-purple-200',
    card: 'bg-white/80 backdrop-blur-sm',
    cardHover: 'hover:bg-white/90',
    cardBorder: 'border-purple-200',
    primary: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600',
    primaryLight: 'text-purple-500',
    primaryDark: 'text-purple-700',
    navBackground: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
    navBorder: 'border-purple-400',
    navText: 'text-white',
    navTextActive: 'text-white font-bold',
    buttonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    buttonPrimaryHover: 'from-purple-700 to-pink-700',
    buttonPrimaryText: 'text-white',
    buttonSecondary: 'bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-300 hover:to-pink-300',
    buttonSecondaryHover: 'from-purple-300 to-pink-300',
    success: 'text-emerald-600',
    successBg: 'bg-emerald-50',
    error: 'text-rose-600',
    errorBg: 'bg-rose-50',
    warning: 'text-amber-600',
    warningBg: 'bg-amber-50',
    shadow: 'shadow-lg shadow-purple-500/20',
    shadowHover: 'hover:shadow-xl hover:shadow-purple-500/30',
    gradientBg: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
  },

  /**
   * Matte Theme - Modern flat design with muted colors
   * Best for: Corporate, professional applications
   */
  matte: {
    background: 'bg-stone-50',
    backgroundSecondary: 'bg-stone-100',
    backgroundTertiary: 'bg-stone-200',
    text: 'text-stone-900',
    textSecondary: 'text-stone-700',
    textTertiary: 'text-stone-600',
    border: 'border-stone-300',
    borderLight: 'border-stone-200',
    card: 'bg-stone-100 border border-stone-300',
    cardHover: 'hover:bg-stone-150 hover:border-stone-400',
    cardBorder: 'border-stone-300',
    primary: 'text-teal-700',
    primaryLight: 'text-teal-600',
    primaryDark: 'text-teal-800',
    navBackground: 'bg-stone-200 border-b border-stone-300',
    navBorder: 'border-stone-300',
    navText: 'text-stone-700',
    navTextActive: 'text-teal-700 bg-stone-300',
    buttonPrimary: 'bg-teal-700 hover:bg-teal-800 text-white',
    buttonPrimaryHover: 'bg-teal-800',
    buttonPrimaryText: 'text-white',
    buttonSecondary: 'bg-stone-300 hover:bg-stone-400 text-stone-900',
    buttonSecondaryHover: 'bg-stone-400',
    success: 'text-teal-700',
    successBg: 'bg-teal-100',
    error: 'text-stone-700',
    errorBg: 'bg-red-100',
    warning: 'text-amber-700',
    warningBg: 'bg-amber-100',
    shadow: 'shadow',
    shadowHover: 'hover:shadow-md',
    gradientBg: 'bg-stone-50',
  },

  /**
   * Glassy Theme - Glassmorphism with frosted glass effects
   * Best for: Modern, trendy applications
   */
  glassy: {
    background: 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400',
    backgroundSecondary: 'bg-white/10',
    backgroundTertiary: 'bg-white/5',
    text: 'text-white',
    textSecondary: 'text-white/80',
    textTertiary: 'text-white/60',
    border: 'border-white/30',
    borderLight: 'border-white/20',
    card: 'bg-white/20 backdrop-blur-xl border border-white/30',
    cardHover: 'hover:bg-white/30 hover:border-white/40',
    cardBorder: 'border-white/30',
    primary: 'text-white',
    primaryLight: 'text-white/90',
    primaryDark: 'text-white',
    navBackground: 'bg-white/10 backdrop-blur-md border-b border-white/20',
    navBorder: 'border-white/20',
    navText: 'text-white/80',
    navTextActive: 'text-white font-bold',
    buttonPrimary: 'bg-white/30 hover:bg-white/40 backdrop-blur-md text-white border border-white/30',
    buttonPrimaryHover: 'bg-white/40 border-white/40',
    buttonPrimaryText: 'text-white',
    buttonSecondary: 'bg-white/20 hover:bg-white/30 text-white border border-white/20',
    buttonSecondaryHover: 'bg-white/30 border-white/30',
    success: 'text-emerald-100',
    successBg: 'bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30',
    error: 'text-red-100',
    errorBg: 'bg-red-500/20 backdrop-blur-md border border-red-500/30',
    warning: 'text-amber-100',
    warningBg: 'bg-amber-500/20 backdrop-blur-md border border-amber-500/30',
    shadow: 'shadow-2xl',
    shadowHover: 'hover:shadow-2xl hover:shadow-white/20',
    gradientBg: 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400',
  },
};

/**
 * Theme Context type
 */
interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
}

/**
 * Create theme context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Component
 * Wraps the application and provides theme context
 * 
 * Usage:
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to track current theme
  const [theme, setTheme] = useState<ThemeType>('light');

  // Get color palette for current theme
  const colors = themes[theme];

  const value: ThemeContextType = {
    theme,
    colors,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 * 
 * Usage:
 * const { theme, colors, setTheme } = useTheme();
 * 
 * Then in JSX:
 * <div className={colors.background}>
 *   <h1 className={colors.text}>Title</h1>
 * </div>
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
