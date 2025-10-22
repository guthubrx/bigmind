/**
 * FR: Thèmes prédéfinis pour BigMind
 * EN: Preset themes for BigMind
 */

import { Theme, ThemeCategory } from '@bigmind/core';

/**
 * FR: Thème BigMind Classique (par défaut)
 * EN: BigMind Classic Theme (default)
 */
const classicTheme: Theme = {
  id: 'classic',
  name: 'BigMind Classic',
  description: 'Thème clair moderne avec accent bleu',
  category: ThemeCategory.LIGHT,
  isSystem: true,
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    primary: '#3b82f6',
    secondary: '#60a5fa',
    text: '#171717',
    textSecondary: '#525252',
    border: '#e5e5e5',
    branchColors: [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308',
      '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
    ],
  },
  nodeStyles: {
    root: {
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      borderRadius: 12,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    level1: {
      backgroundColor: '#dbeafe',
      textColor: '#1e40af',
      fontSize: 18,
      fontWeight: 'semibold',
      borderRadius: 8,
    },
    levelN: {
      backgroundColor: '#f0f9ff',
      textColor: '#1e3a8a',
      fontSize: 16,
      fontWeight: 'normal',
      borderRadius: 6,
    },
  },
};

/**
 * FR: Thème Sombre Professionnel
 * EN: Dark Professional Theme
 */
const darkProfessionalTheme: Theme = {
  id: 'dark-professional',
  name: 'Professional Dark',
  description: 'Thème sombre élégant pour un usage professionnel',
  category: ThemeCategory.DARK,
  isSystem: true,
  colors: {
    background: '#0a0a0a',
    surface: '#171717',
    primary: '#60a5fa',
    secondary: '#93c5fd',
    text: '#fafafa',
    textSecondary: '#a3a3a3',
    border: '#262626',
    branchColors: [
      '#60a5fa', '#a78bfa', '#f472b6', '#fb7185', '#fb923c', '#fbbf24',
      '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8',
    ],
  },
  nodeStyles: {
    root: {
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#60a5fa',
    },
    level1: {
      backgroundColor: '#1e3a8a',
      textColor: '#dbeafe',
      fontSize: 18,
      fontWeight: 'semibold',
      borderRadius: 8,
    },
    levelN: {
      backgroundColor: '#172554',
      textColor: '#bfdbfe',
      fontSize: 16,
      fontWeight: 'normal',
      borderRadius: 6,
    },
  },
};

/**
 * FR: Thème Minimaliste
 * EN: Minimal Theme
 */
const minimalTheme: Theme = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Design minimaliste avec focus sur le contenu',
  category: ThemeCategory.MINIMAL,
  isSystem: true,
  colors: {
    background: '#ffffff',
    surface: '#fafafa',
    primary: '#404040',
    secondary: '#737373',
    text: '#0a0a0a',
    textSecondary: '#737373',
    border: '#d4d4d4',
    branchColors: [
      '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#262626', '#404040',
      '#171717', '#0a0a0a', '#e5e5e5', '#f5f5f5',
    ],
  },
  nodeStyles: {
    root: {
      backgroundColor: '#ffffff',
      textColor: '#0a0a0a',
      fontSize: 24,
      fontWeight: 'bold',
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#171717',
    },
    level1: {
      backgroundColor: '#ffffff',
      textColor: '#262626',
      fontSize: 18,
      fontWeight: 'semibold',
      borderRadius: 4,
    },
    levelN: {
      backgroundColor: '#fafafa',
      textColor: '#404040',
      fontSize: 16,
      fontWeight: 'normal',
      borderRadius: 4,
    },
  },
};

/**
 * FR: Thème Créatif Coloré
 * EN: Creative Colorful Theme
 */
const creativeColorfulTheme: Theme = {
  id: 'creative-colorful',
  name: 'Creative Burst',
  description: 'Thème vibrant et créatif avec couleurs vives',
  category: ThemeCategory.COLORFUL,
  isSystem: true,
  colors: {
    background: '#fffbeb',
    surface: '#fef3c7',
    primary: '#f59e0b',
    secondary: '#fbbf24',
    text: '#78350f',
    textSecondary: '#92400e',
    border: '#fde68a',
    branchColors: [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
      '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
    ],
  },
  nodeStyles: {
    root: {
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      borderRadius: 16,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    level1: {
      backgroundColor: '#fed7aa',
      textColor: '#9a3412',
      fontSize: 18,
      fontWeight: 'semibold',
      borderRadius: 12,
    },
    levelN: {
      backgroundColor: '#ffedd5',
      textColor: '#c2410c',
      fontSize: 16,
      fontWeight: 'normal',
      borderRadius: 8,
    },
  },
};

/**
 * FR: Thème Nature
 * EN: Nature Theme
 */
const natureTheme: Theme = {
  id: 'nature',
  name: 'Nature',
  description: 'Palette inspirée de la nature avec tons verts et terreux',
  category: ThemeCategory.CREATIVE,
  isSystem: true,
  colors: {
    background: '#f0fdf4',
    surface: '#dcfce7',
    primary: '#22c55e',
    secondary: '#4ade80',
    text: '#14532d',
    textSecondary: '#166534',
    border: '#bbf7d0',
    branchColors: [
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#84cc16', '#eab308',
      '#f59e0b', '#f97316', '#8b5cf6', '#6366f1',
    ],
  },
  nodeStyles: {
    root: {
      backgroundColor: '#16a34a',
      textColor: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      borderRadius: 12,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    level1: {
      backgroundColor: '#bbf7d0',
      textColor: '#15803d',
      fontSize: 18,
      fontWeight: 'semibold',
      borderRadius: 8,
    },
    levelN: {
      backgroundColor: '#dcfce7',
      textColor: '#166534',
      fontSize: 16,
      fontWeight: 'normal',
      borderRadius: 6,
    },
  },
};

/**
 * FR: Thème Océan
 * EN: Ocean Theme
 */
const oceanTheme: Theme = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Palette inspirée de l\'océan avec tons bleus et turquoises',
  category: ThemeCategory.CREATIVE,
  isSystem: true,
  colors: {
    background: '#ecfeff',
    surface: '#cffafe',
    primary: '#06b6d4',
    secondary: '#22d3ee',
    text: '#083344',
    textSecondary: '#155e75',
    border: '#a5f3fc',
    branchColors: [
      '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#14b8a6',
      '#10b981', '#22c55e', '#84cc16', '#a855f7',
    ],
  },
  nodeStyles: {
    root: {
      backgroundColor: '#0891b2',
      textColor: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      borderRadius: 12,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    level1: {
      backgroundColor: '#a5f3fc',
      textColor: '#0e7490',
      fontSize: 18,
      fontWeight: 'semibold',
      borderRadius: 8,
    },
    levelN: {
      backgroundColor: '#cffafe',
      textColor: '#155e75',
      fontSize: 16,
      fontWeight: 'normal',
      borderRadius: 6,
    },
  },
};

/**
 * FR: Thème Sunset (Coucher de soleil)
 * EN: Sunset Theme
 */
const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Palette chaleureuse inspirée des couchers de soleil',
  category: ThemeCategory.COLORFUL,
  isSystem: true,
  colors: {
    background: '#fff7ed',
    surface: '#ffedd5',
    primary: '#f97316',
    secondary: '#fb923c',
    text: '#7c2d12',
    textSecondary: '#9a3412',
    border: '#fed7aa',
    branchColors: [
      '#f97316', '#fb923c', '#fbbf24', '#f59e0b', '#ec4899', '#f43f5e',
      '#ef4444', '#dc2626', '#a855f7', '#8b5cf6',
    ],
  },
  nodeStyles: {
    root: {
      backgroundColor: '#ea580c',
      textColor: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      borderRadius: 12,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    level1: {
      backgroundColor: '#fed7aa',
      textColor: '#c2410c',
      fontSize: 18,
      fontWeight: 'semibold',
      borderRadius: 8,
    },
    levelN: {
      backgroundColor: '#ffedd5',
      textColor: '#9a3412',
      fontSize: 16,
      fontWeight: 'normal',
      borderRadius: 6,
    },
  },
};

/**
 * FR: Thème Corporate
 * EN: Corporate Theme
 */
const corporateTheme: Theme = {
  id: 'corporate',
  name: 'Corporate',
  description: 'Thème professionnel sobre pour usage en entreprise',
  category: ThemeCategory.PROFESSIONAL,
  isSystem: true,
  colors: {
    background: '#ffffff',
    surface: '#f9fafb',
    primary: '#1e40af',
    secondary: '#3b82f6',
    text: '#111827',
    textSecondary: '#4b5563',
    border: '#d1d5db',
    branchColors: [
      '#1e40af', '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa',
      '#374151', '#4b5563', '#6b7280', '#9ca3af',
    ],
  },
  nodeStyles: {
    root: {
      backgroundColor: '#1e40af',
      textColor: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      borderRadius: 6,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    level1: {
      backgroundColor: '#e0e7ff',
      textColor: '#1e3a8a',
      fontSize: 18,
      fontWeight: 'semibold',
      borderRadius: 6,
    },
    levelN: {
      backgroundColor: '#f3f4f6',
      textColor: '#374151',
      fontSize: 16,
      fontWeight: 'normal',
      borderRadius: 4,
    },
  },
};

/**
 * FR: Liste de tous les thèmes prédéfinis
 * EN: List of all preset themes
 */
export const PRESET_THEMES: readonly Theme[] = [
  classicTheme,
  darkProfessionalTheme,
  minimalTheme,
  creativeColorfulTheme,
  natureTheme,
  oceanTheme,
  sunsetTheme,
  corporateTheme,
] as const;

/**
 * FR: Obtient un thème par son ID
 * EN: Gets a theme by its ID
 */
export function getThemeById(id: string): Theme | undefined {
  return PRESET_THEMES.find((theme) => theme.id === id);
}

/**
 * FR: Obtient tous les thèmes d'une catégorie
 * EN: Gets all themes of a category
 */
export function getThemesByCategory(category: ThemeCategory): Theme[] {
  return PRESET_THEMES.filter((theme) => theme.category === category);
}

/**
 * FR: Thème par défaut (Classic)
 * EN: Default theme (Classic)
 */
export const DEFAULT_THEME = classicTheme;
