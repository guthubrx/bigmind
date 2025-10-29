/**
 * Default Themes
 * Light and dark theme definitions
 */

import type { Theme } from './types';

/**
 * Light theme
 */
export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  mode: 'light',
  colors: {
    bg: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#eeeeee',
    fg: '#000000',
    fgSecondary: '#666666',
    fgTertiary: '#999999',
    accent: '#2196f3',
    accentHover: '#1976d2',
    accentActive: '#0d47a1',
    error: '#d32f2f',
    warning: '#f57c00',
    success: '#388e3c',
    info: '#0288d1',
    border: '#e0e0e0',
    borderHover: '#bdbdbd',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    nodeDefault: '#ffffff',
    nodeHover: '#f5f5f5',
    nodeSelected: '#e3f2fd',
    nodeEdge: '#9e9e9e',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: '"Consolas", "Monaco", "Courier New", monospace',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.2)',
  },
  animation: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
};

/**
 * Dark theme
 */
export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  mode: 'dark',
  colors: {
    bg: '#1e1e1e',
    bgSecondary: '#2d2d2d',
    bgTertiary: '#3e3e3e',
    fg: '#ffffff',
    fgSecondary: '#cccccc',
    fgTertiary: '#888888',
    accent: '#0078d4',
    accentHover: '#1084d8',
    accentActive: '#0063b1',
    error: '#f44336',
    warning: '#ff9800',
    success: '#4caf50',
    info: '#03a9f4',
    border: '#3e3e3e',
    borderHover: '#555555',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    nodeDefault: '#2d2d2d',
    nodeHover: '#3e3e3e',
    nodeSelected: '#0e3a5c',
    nodeEdge: '#666666',
  },
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  radius: lightTheme.radius,
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.15)',
    md: '0 4px 6px rgba(0, 0, 0, 0.25)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.35)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.45)',
  },
  animation: lightTheme.animation,
  zIndex: lightTheme.zIndex,
};

/**
 * Default theme configuration
 */
export const defaultThemeConfig = {
  defaultTheme: 'light',
  themes: [lightTheme, darkTheme],
  enableSystemTheme: true,
};
