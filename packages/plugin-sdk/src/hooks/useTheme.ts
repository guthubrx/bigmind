/**
 * React hook for theme access
 * Provides theme object and helper functions
 */

import { useState, useEffect, useCallback } from 'react';
import { bridge } from '../bridge';
import type { UseThemeReturn, Theme } from '../types';

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Load initial theme
    bridge.getTheme().then(setTheme).catch(console.error);

    // Subscribe to theme changes
    const unsubscribe = bridge.subscribe('theme.changed', (newTheme: Theme) => {
      setTheme(newTheme);
    });

    return unsubscribe;
  }, []);

  const setThemeById = useCallback(async (themeId: string) => {
    await bridge.setTheme(themeId);
  }, []);

  /**
   * Get CSS variable for a theme token
   * Example: variant('accent') -> 'var(--color-accent)'
   */
  const variant = useCallback((name: string): string => {
    return `var(--${name})`;
  }, []);

  // Return default theme structure if not loaded yet
  const defaultTheme: Theme = {
    id: 'default',
    name: 'Default',
    colors: {
      bg: '#ffffff',
      bgSecondary: '#f5f5f5',
      bgTertiary: '#eeeeee',
      fg: '#000000',
      fgSecondary: '#666666',
      fgTertiary: '#999999',
      accent: '#007bff',
      accentHover: '#0056b3',
      border: '#dddddd',
      error: '#dc3545',
      warning: '#ffc107',
      success: '#28a745',
      info: '#17a2b8',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '24px',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
    },
  };

  return {
    theme: theme || defaultTheme,
    setTheme: setThemeById,
    variant,
  };
}
