/**
 * Theme Manager
 * Manages theme state and CSS variable generation
 */

import type { Theme } from './types';
import { lightTheme, darkTheme } from './defaultThemes';

export class ThemeManager {
  private static instance: ThemeManager;

  private currentTheme: Theme;

  private listeners = new Set<(theme: Theme) => void>();

  private systemThemeMediaQuery: MediaQueryList;

  private constructor() {
    // Start with light theme
    this.currentTheme = lightTheme;

    // Setup system theme detection
    this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeMediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));

    // Load saved theme or use system preference
    this.loadSavedTheme();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return { ...this.currentTheme };
  }

  /**
   * Set theme by ID
   */
  setTheme(themeId: string): void {
    let theme: Theme;

    switch (themeId) {
      case 'light':
        theme = lightTheme;
        break;
      case 'dark':
        theme = darkTheme;
        break;
      case 'system':
        theme = this.getSystemTheme();
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown theme: ${themeId}, using light theme`);
        theme = lightTheme;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(themeId);
    this.notifyListeners();
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): Theme {
    return this.systemThemeMediaQuery.matches ? darkTheme : lightTheme;
  }

  /**
   * Handle system theme change
   */
  private handleSystemThemeChange(): void {
    const savedTheme = localStorage.getItem('bigmind-theme');

    // Only update if using system theme
    if (savedTheme === 'system' || !savedTheme) {
      this.setTheme('system');
    }
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Apply colors
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
    }

    // Apply spacing
    for (const [key, value] of Object.entries(theme.spacing)) {
      root.style.setProperty(`--spacing-${key}`, value);
    }

    // Apply typography
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-family-mono', theme.typography.fontFamilyMono);

    for (const [key, value] of Object.entries(theme.typography.fontSize)) {
      root.style.setProperty(`--font-size-${key}`, value);
    }

    for (const [key, value] of Object.entries(theme.typography.fontWeight)) {
      root.style.setProperty(`--font-weight-${key}`, String(value));
    }

    for (const [key, value] of Object.entries(theme.typography.lineHeight)) {
      root.style.setProperty(`--line-height-${key}`, String(value));
    }

    // Apply radius
    for (const [key, value] of Object.entries(theme.radius)) {
      root.style.setProperty(`--radius-${key}`, value);
    }

    // Apply shadows
    for (const [key, value] of Object.entries(theme.shadows)) {
      root.style.setProperty(`--shadow-${key}`, value);
    }

    // Apply animation
    for (const [key, value] of Object.entries(theme.animation)) {
      root.style.setProperty(`--animation-${key}`, value);
    }

    // Apply z-index
    for (const [key, value] of Object.entries(theme.zIndex)) {
      root.style.setProperty(`--z-index-${this.kebabCase(key)}`, String(value));
    }

    // Set data attribute for theme mode
    root.setAttribute('data-theme', theme.mode);
  }

  /**
   * Convert camelCase to kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Save theme preference
   */
  private saveTheme(themeId: string): void {
    localStorage.setItem('bigmind-theme', themeId);
  }

  /**
   * Load saved theme
   */
  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('bigmind-theme');

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Use system theme by default
      this.setTheme('system');
    }
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of theme change
   */
  private notifyListeners(): void {
    const theme = this.getTheme();
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error in theme listener:', error);
      }
    });
  }

  /**
   * Get CSS variable value
   */
  getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  }

  /**
   * Set CSS variable
   */
  setCSSVariable(name: string, value: string): void {
    document.documentElement.style.setProperty(`--${name}`, value);
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance();
