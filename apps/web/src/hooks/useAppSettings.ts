import { create } from 'zustand';
import {
  getTheme,
  applyThemeToDocument,
  COLOR_THEMES,
  type ColorTheme,
} from '../themes/colorThemes';
import { COLOR_PALETTES } from '../themes/colorPalettes';
import { loadObject, updateProperty } from '../utils/storageManager';
import { emitSettingsChanged } from '../utils/mindmapEvents';

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
  defaultNodeHeight: number;
  setDefaultNodeHeight: (height: number) => void;
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
  defaultNodeHeight: 0,
  defaultNodeFontFamily: 'inherit',

  setAccentColor: (color: string) => {
    set({ accentColor: color });
    updateProperty(STORAGE_KEY, 'accentColor', color);

    // Update CSS variable globally
    try {
      document.documentElement.style.setProperty('--accent-color', color);
    } catch (e) {
      // Ignore CSS errors
    }

    // Emit settings changed event
    emitSettingsChanged({ setting: 'accentColor', value: color });
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
    updateProperty(STORAGE_KEY, 'themeId', themeId);

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

    // Emit settings changed event
    emitSettingsChanged({ setting: 'themeId', value: themeId });
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
    updateProperty(STORAGE_KEY, 'defaultNodePaletteId', paletteId);

    // Emit settings changed event
    emitSettingsChanged({ setting: 'defaultNodePaletteId', value: paletteId });
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
    updateProperty(STORAGE_KEY, 'defaultTagPaletteId', paletteId);

    // Emit settings changed event
    emitSettingsChanged({ setting: 'defaultTagPaletteId', value: paletteId });
  },

  setShowMinimap: (show: boolean) => {
    set({ showMinimap: show });
    updateProperty(STORAGE_KEY, 'showMinimap', show);

    // Emit settings changed event
    emitSettingsChanged({ setting: 'showMinimap', value: show });
  },

  setReopenFilesOnStartup: (reopen: boolean) => {
    set({ reopenFilesOnStartup: reopen });
    updateProperty(STORAGE_KEY, 'reopenFilesOnStartup', reopen);

    // Emit settings changed event
    emitSettingsChanged({ setting: 'reopenFilesOnStartup', value: reopen });
  },

  setDefaultNodeFontSize: (size: number) => {
    set({ defaultNodeFontSize: size });
    updateProperty(STORAGE_KEY, 'defaultNodeFontSize', size);

    // Emit settings changed event
    emitSettingsChanged({ setting: 'defaultNodeFontSize', value: size });
  },

  setDefaultNodeWidth: (width: number) => {
    set({ defaultNodeWidth: width });
    updateProperty(STORAGE_KEY, 'defaultNodeWidth', width);

    // Emit settings changed event
    emitSettingsChanged({ setting: 'defaultNodeWidth', value: width });
  },

  setDefaultNodeHeight: (height: number) => {
    set({ defaultNodeHeight: height });
    updateProperty(STORAGE_KEY, 'defaultNodeHeight', height);

    // Emit settings changed event
    emitSettingsChanged({ setting: 'defaultNodeHeight', value: height });
  },

  setDefaultNodeFontFamily: (fontFamily: string) => {
    set({ defaultNodeFontFamily: fontFamily });
    updateProperty(STORAGE_KEY, 'defaultNodeFontFamily', fontFamily);

    // Emit settings changed event
    emitSettingsChanged({ setting: 'defaultNodeFontFamily', value: fontFamily });
  },

  load: () => {
    const obj = loadObject<any>(STORAGE_KEY, null);

    if (obj) {
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
      if (obj.defaultNodeHeight !== undefined) {
        set({ defaultNodeHeight: obj.defaultNodeHeight });
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
  },
}));
