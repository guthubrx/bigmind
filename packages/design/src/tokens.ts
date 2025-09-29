/**
 * FR: Tokens de design pour BigMind - Flat design avec accent color unique
 * EN: Design tokens for BigMind - Flat design with single accent color
 */

// FR: Palette de couleurs neutres (flat design)
// EN: Neutral color palette (flat design)
export const colors = {
  // FR: Couleurs de base (neutres)
  // EN: Base colors (neutral)
  white: '#ffffff',
  black: '#000000',
  
  // FR: Gris (du plus clair au plus foncé)
  // EN: Grays (from lightest to darkest)
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // FR: Couleur d'accent unique (bleu moderne)
  // EN: Single accent color (modern blue)
  accent: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // FR: Couleur principale d'accent / EN: Main accent color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // FR: Couleurs sémantiques (basées sur l'accent)
  // EN: Semantic colors (based on accent)
  semantic: {
    success: '#10b981', // FR: Vert / EN: Green
    warning: '#f59e0b', // FR: Orange / EN: Orange
    error: '#ef4444',   // FR: Rouge / EN: Red
    info: '#3b82f6',    // FR: Bleu (même que accent) / EN: Blue (same as accent)
  },
} as const;

// FR: Espacements (système 8px)
// EN: Spacings (8px system)
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

// FR: Tailles de police (échelle harmonieuse)
// EN: Font sizes (harmonious scale)
export const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
} as const;

// FR: Poids de police
// EN: Font weights
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// FR: Rayons de bordure
// EN: Border radius
export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

// FR: Ombres (flat design - subtiles)
// EN: Shadows (flat design - subtle)
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// FR: Z-index (système de couches)
// EN: Z-index (layer system)
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;
