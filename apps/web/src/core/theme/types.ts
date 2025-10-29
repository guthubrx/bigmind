/**
 * Theme System Types
 * Design token system for consistent theming
 */

/**
 * Color palette
 */
export interface ThemeColors {
  // Background colors
  bg: string;
  bgSecondary: string;
  bgTertiary: string;

  // Foreground colors
  fg: string;
  fgSecondary: string;
  fgTertiary: string;

  // Accent colors
  accent: string;
  accentHover: string;
  accentActive: string;

  // Semantic colors
  error: string;
  warning: string;
  success: string;
  info: string;

  // UI colors
  border: string;
  borderHover: string;
  shadow: string;
  overlay: string;

  // Node colors (for mind maps)
  nodeDefault: string;
  nodeHover: string;
  nodeSelected: string;
  nodeEdge: string;
}

/**
 * Spacing scale
 */
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

/**
 * Typography scale
 */
export interface ThemeTypography {
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * Border radius scale
 */
export interface ThemeRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

/**
 * Shadow scale
 */
export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Animation durations
 */
export interface ThemeAnimation {
  fast: string;
  normal: string;
  slow: string;
}

/**
 * Z-index scale
 */
export interface ThemeZIndex {
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  popover: number;
  tooltip: number;
}

/**
 * Complete theme definition
 */
export interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  radius: ThemeRadius;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
  zIndex: ThemeZIndex;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  defaultTheme: string;
  themes: Theme[];
  enableSystemTheme: boolean;
}
