/**
 * Theme Provider
 * React context for theme access
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { themeManager } from './ThemeManager';
import type { Theme } from './types';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (themeId: string) => void;
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(themeManager.getTheme());

  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe((newTheme) => {
      setThemeState(newTheme);
    });

    return unsubscribe;
  }, []);

  const setTheme = (themeId: string) => {
    themeManager.setTheme(themeId);
  };

  const toggleMode = () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    themeManager.setTheme(newMode);
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    mode: theme.mode,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
