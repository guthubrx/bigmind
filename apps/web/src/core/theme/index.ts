/**
 * Theme System
 * Design token system with CSS variables
 */

export { themeManager, ThemeManager } from './ThemeManager';
export { ThemeProvider, useTheme } from './ThemeProvider';
export { lightTheme, darkTheme, defaultThemeConfig } from './defaultThemes';
export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeRadius,
  ThemeShadows,
  ThemeAnimation,
  ThemeZIndex,
  ThemeConfig,
} from './types';
