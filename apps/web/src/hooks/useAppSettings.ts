import { create } from 'zustand';
import {
  getTheme,
  applyThemeToDocument,
  COLOR_THEMES,
  type ColorTheme,
} from '../themes/colorThemes';

type AppSettingsState = {
  // FR: Couleur d'accent personnalisée
  // EN: Custom accent color
  accentColor: string;
  setAccentColor: (color: string) => void;

  // FR: Thème de couleurs
  // EN: Color theme
  themeId: string;
  setTheme: (themeId: string) => void;
  getCurrentTheme: () => ColorTheme;

  // FR: Chargement des paramètres
  // EN: Load settings
  load: () => void;
};

const STORAGE_KEY = 'bigmind_app_settings';

export const useAppSettings = create<AppSettingsState>((set, get) => ({
  accentColor: '#3b82f6',
  themeId: 'light',

  setAccentColor: (color: string) => {
    set({ accentColor: color });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.accentColor = color;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
    // Update CSS variable globally
    try {
      document.documentElement.style.setProperty('--accent-color', color);
    } catch (e) {
      // Ignore CSS errors
    }
  },

  setTheme: (themeId: string) => {
    // FR: Vérifier que le thème existe
    // EN: Check that theme exists
    if (!COLOR_THEMES[themeId]) {
      // eslint-disable-next-line no-console
      console.warn(`Theme "${themeId}" not found, falling back to light`);
      // eslint-disable-next-line no-param-reassign
      themeId = 'light';
    }

    set({ themeId });

    // FR: Sauvegarder dans localStorage
    // EN: Save to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.themeId = themeId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }

    // FR: Appliquer le thème au document
    // EN: Apply theme to document
    const theme = getTheme(themeId);
    applyThemeToDocument(theme);

    // FR: Si le thème a une couleur d'accent, l'utiliser
    // EN: If theme has an accent color, use it
    const currentAccent = get().accentColor;
    const themeAccent = theme.colors.accent;

    // FR: Ne changer l'accent que si c'est la première fois ou si l'utilisateur n'a pas personnalisé
    // EN: Only change accent if it's first time or user hasn't customized
    if (currentAccent === COLOR_THEMES.light.colors.accent || !currentAccent) {
      get().setAccentColor(themeAccent);
    }
  },

  getCurrentTheme: () => {
    const { themeId } = get();
    return getTheme(themeId);
  },

  load: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);

        // FR: Charger le thème en premier
        // EN: Load theme first
        if (obj.themeId) {
          get().setTheme(obj.themeId);
        } else {
          // FR: Appliquer le thème par défaut
          // EN: Apply default theme
          const defaultTheme = getTheme('light');
          applyThemeToDocument(defaultTheme);
        }

        // FR: Puis charger la couleur d'accent personnalisée (si elle existe)
        // EN: Then load custom accent color (if exists)
        if (obj.accentColor) {
          get().setAccentColor(obj.accentColor);
        }
      } else {
        // FR: Initialiser avec le thème par défaut
        // EN: Initialize with default theme
        const defaultTheme = getTheme('light');
        applyThemeToDocument(defaultTheme);
        document.documentElement.style.setProperty('--accent-color', get().accentColor);
      }
    } catch (e) {
      // Ignore errors, use defaults
      const defaultTheme = getTheme('light');
      applyThemeToDocument(defaultTheme);
      document.documentElement.style.setProperty('--accent-color', get().accentColor);
    }
  },
}));
