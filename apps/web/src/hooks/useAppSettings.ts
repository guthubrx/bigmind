import { create } from 'zustand';
import {
  getTheme,
  applyThemeToDocument,
  COLOR_THEMES,
  type ColorTheme,
} from '../themes/colorThemes';
import { COLOR_PALETTES } from '../themes/colorPalettes';

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

  // FR: Palette par défaut pour les nœuds
  // EN: Default palette for nodes
  defaultNodePaletteId: string;
  setDefaultNodePalette: (paletteId: string) => void;

  // FR: Palette par défaut pour les tags
  // EN: Default palette for tags
  defaultTagPaletteId: string;
  setDefaultTagPalette: (paletteId: string) => void;

  // FR: Affichage de la minimap
  // EN: Show minimap
  showMinimap: boolean;
  setShowMinimap: (show: boolean) => void;

  // FR: Réouvrir les cartes au démarrage
  // EN: Reopen files on startup
  reopenFilesOnStartup: boolean;
  setReopenFilesOnStartup: (reopen: boolean) => void;

  // FR: Style par défaut des nœuds
  // EN: Default node style
  defaultNodeFontSize: number;
  setDefaultNodeFontSize: (size: number) => void;
  defaultNodeWidth: number;
  setDefaultNodeWidth: (width: number) => void;
  defaultNodeFontFamily: string;
  setDefaultNodeFontFamily: (fontFamily: string) => void;

  // FR: Chargement des paramètres
  // EN: Load settings
  load: () => void;
};

const STORAGE_KEY = 'bigmind_app_settings';

export const useAppSettings = create<AppSettingsState>((set, get) => ({
  accentColor: '#3b82f6',
  themeId: 'light',
  defaultNodePaletteId: 'vibrant',
  defaultTagPaletteId: 'vibrant',
  showMinimap: false,
  reopenFilesOnStartup: true,
  defaultNodeFontSize: 14,
  defaultNodeWidth: 200,
  defaultNodeFontFamily: 'inherit',

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

  setDefaultNodePalette: (paletteId: string) => {
    // FR: Vérifier que la palette existe
    // EN: Check that palette exists
    if (!COLOR_PALETTES[paletteId]) {
      // eslint-disable-next-line no-console
      console.warn(`Palette "${paletteId}" not found, falling back to vibrant`);
      // eslint-disable-next-line no-param-reassign
      paletteId = 'vibrant';
    }

    set({ defaultNodePaletteId: paletteId });

    // FR: Sauvegarder dans localStorage
    // EN: Save to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.defaultNodePaletteId = paletteId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },

  setDefaultTagPalette: (paletteId: string) => {
    // FR: Vérifier que la palette existe
    // EN: Check that palette exists
    if (!COLOR_PALETTES[paletteId]) {
      // eslint-disable-next-line no-console
      console.warn(`Palette "${paletteId}" not found, falling back to vibrant`);
      // eslint-disable-next-line no-param-reassign
      paletteId = 'vibrant';
    }

    set({ defaultTagPaletteId: paletteId });

    // FR: Sauvegarder dans localStorage
    // EN: Save to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.defaultTagPaletteId = paletteId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },

  setShowMinimap: (show: boolean) => {
    set({ showMinimap: show });

    // FR: Sauvegarder dans localStorage
    // EN: Save to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.showMinimap = show;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },

  setReopenFilesOnStartup: (reopen: boolean) => {
    set({ reopenFilesOnStartup: reopen });

    // FR: Sauvegarder dans localStorage
    // EN: Save to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.reopenFilesOnStartup = reopen;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },

  setDefaultNodeFontSize: (size: number) => {
    set({ defaultNodeFontSize: size });

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.defaultNodeFontSize = size;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },

  setDefaultNodeWidth: (width: number) => {
    set({ defaultNodeWidth: width });

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.defaultNodeWidth = width;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
  },

  setDefaultNodeFontFamily: (fontFamily: string) => {
    set({ defaultNodeFontFamily: fontFamily });

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.defaultNodeFontFamily = fontFamily;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
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

        // FR: Charger les palettes par défaut
        // EN: Load default palettes
        if (obj.defaultNodePaletteId) {
          set({ defaultNodePaletteId: obj.defaultNodePaletteId });
        }
        if (obj.defaultTagPaletteId) {
          set({ defaultTagPaletteId: obj.defaultTagPaletteId });
        }

        // FR: Charger l'option d'affichage de la minimap
        // EN: Load minimap display option
        if (obj.showMinimap !== undefined) {
          set({ showMinimap: obj.showMinimap });
        }

        // FR: Charger l'option de réouverture des fichiers
        // EN: Load reopen files option
        if (obj.reopenFilesOnStartup !== undefined) {
          set({ reopenFilesOnStartup: obj.reopenFilesOnStartup });
        }

        // FR: Charger le style par défaut des nœuds
        // EN: Load default node style
        if (obj.defaultNodeFontSize !== undefined) {
          set({ defaultNodeFontSize: obj.defaultNodeFontSize });
        }
        if (obj.defaultNodeWidth !== undefined) {
          set({ defaultNodeWidth: obj.defaultNodeWidth });
        }
        if (obj.defaultNodeFontFamily !== undefined) {
          set({ defaultNodeFontFamily: obj.defaultNodeFontFamily });
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
