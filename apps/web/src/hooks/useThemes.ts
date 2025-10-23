/**
 * FR: Hook pour la gestion des thèmes
 * EN: Hook for theme management
 */

import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Theme, ThemeCategory, ThemeUtils } from '@bigmind/core';
import { PRESET_THEMES, DEFAULT_THEME } from '@bigmind/design';

interface ThemeState {
  activeThemeId: string;
  customThemes: Theme[];
  favoriteThemeIds: string[];
  setActiveTheme: (themeId: string) => void;
  addCustomTheme: (theme: Theme) => void;
  updateCustomTheme: (themeId: string, updates: Partial<Theme>) => void;
  deleteCustomTheme: (themeId: string) => void;
  toggleFavorite: (themeId: string) => void;
}

// FR: Store Zustand pour l'état des thèmes
// EN: Zustand store for theme state
const useThemeStore = create<ThemeState>()(
  persist(
    immer(set => ({
      activeThemeId: DEFAULT_THEME.id,
      customThemes: [],
      favoriteThemeIds: [],

      setActiveTheme: (themeId: string) =>
        set(state => {
          state.activeThemeId = themeId;
        }),

      addCustomTheme: (theme: Theme) =>
        set(state => {
          if (!ThemeUtils.isValidTheme(theme)) return;
          state.customThemes.push(theme);
        }),

      updateCustomTheme: (themeId: string, updates: Partial<Theme>) =>
        set(state => {
          const idx = state.customThemes.findIndex(t => t.id === themeId);
          if (idx !== -1) {
            state.customThemes[idx] = { ...state.customThemes[idx], ...updates };
          }
        }),

      deleteCustomTheme: (themeId: string) =>
        set(state => {
          state.customThemes = state.customThemes.filter(t => t.id !== themeId);
          if (state.activeThemeId === themeId) {
            state.activeThemeId = DEFAULT_THEME.id;
          }
        }),

      toggleFavorite: (themeId: string) =>
        set(state => {
          const idx = state.favoriteThemeIds.indexOf(themeId);
          if (idx !== -1) {
            state.favoriteThemeIds.splice(idx, 1);
          } else {
            state.favoriteThemeIds.push(themeId);
          }
        }),
    })),
    {
      name: 'bigmind-themes',
      version: 1,
    }
  )
);

/**
 * FR: Hook pour la gestion des thèmes
 * EN: Hook for theme management
 */
export function useThemes() {
  const {
    activeThemeId,
    customThemes,
    favoriteThemeIds,
    setActiveTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    toggleFavorite,
  } = useThemeStore();

  // FR: Obtient le thème actif
  // EN: Gets the active theme
  const activeTheme = useMemo(
    () =>
      PRESET_THEMES.find(t => t.id === activeThemeId) ||
      customThemes.find(t => t.id === activeThemeId) ||
      DEFAULT_THEME,
    [activeThemeId, customThemes]
  );

  // FR: Obtient tous les thèmes disponibles
  // EN: Gets all available themes
  const allThemes = useMemo(() => [...PRESET_THEMES, ...customThemes], [customThemes]);

  // FR: Obtient les thèmes favorites
  // EN: Gets favorite themes
  const favoriteThemes = useMemo(
    () => allThemes.filter(t => favoriteThemeIds.includes(t.id)),
    [allThemes, favoriteThemeIds]
  );

  // FR: Obtient les thèmes par catégorie
  // EN: Gets themes by category
  const getThemesByCategory = useCallback(
    (category: ThemeCategory): Theme[] => allThemes.filter(t => t.category === category),
    [allThemes]
  );

  // FR: Crée un thème personnalisé
  // EN: Creates a custom theme
  const createCustomTheme = useCallback(
    (name: string, customizations: Partial<Omit<Theme, 'id' | 'isSystem'>>) => {
      const customTheme = ThemeUtils.createCustomTheme(activeTheme, {
        name,
        ...customizations,
      });
      addCustomTheme(customTheme);
      return customTheme;
    },
    [activeTheme, addCustomTheme]
  );

  // FR: Exporte un thème en JSON
  // EN: Exports theme to JSON
  const exportTheme = useCallback(
    (themeId: string): string | null => {
      const theme = allThemes.find(t => t.id === themeId);
      if (!theme) return null;
      return ThemeUtils.toJSON(theme);
    },
    [allThemes]
  );

  // FR: Importe un thème depuis JSON
  // EN: Imports theme from JSON
  const importTheme = useCallback(
    (json: string): Theme | null => {
      const theme = ThemeUtils.fromJSON(json);
      if (!theme) return null;
      addCustomTheme(theme);
      return theme;
    },
    [addCustomTheme]
  );

  return {
    // État
    activeThemeId,
    activeTheme,
    customThemes,
    favoriteThemeIds,
    allThemes,
    favoriteThemes,

    // Actions
    setActiveTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    toggleFavorite,
    createCustomTheme,
    getThemesByCategory,
    exportTheme,
    importTheme,
  };
}
