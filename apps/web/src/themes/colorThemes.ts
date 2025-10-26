/**
 * FR: Définitions des thèmes de couleurs pour BigMind
 * EN: Color theme definitions for BigMind
 */

export interface ColorTheme {
  id: string;
  name: string;
  colors: {
    // FR: Couleurs de fond
    // EN: Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;

    // FR: Couleurs de texte
    // EN: Text colors
    foreground: string;
    foregroundSecondary: string;
    foregroundMuted: string;

    // FR: Couleurs des nœuds
    // EN: Node colors
    nodeBackground: string;
    nodeText: string;
    nodeBorder: string;

    // FR: Couleur d'accent (défaut)
    // EN: Accent color (default)
    accent: string;

    // FR: Couleurs d'état
    // EN: State colors
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const COLOR_THEMES: Record<string, ColorTheme> = {
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      background: '#f8fafc',
      backgroundSecondary: '#ffffff',
      backgroundTertiary: '#f1f5f9',
      foreground: '#0f172a',
      foregroundSecondary: '#475569',
      foregroundMuted: '#94a3b8',
      nodeBackground: '#ffffff',
      nodeText: '#0f172a',
      nodeBorder: '#e2e8f0',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },

  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      backgroundTertiary: '#334155',
      foreground: '#f1f5f9',
      foregroundSecondary: '#cbd5e1',
      foregroundMuted: '#64748b',
      nodeBackground: '#1e293b',
      nodeText: '#f1f5f9',
      nodeBorder: '#334155',
      accent: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
  },

  nord: {
    id: 'nord',
    name: 'Nord',
    colors: {
      background: '#2e3440',
      backgroundSecondary: '#3b4252',
      backgroundTertiary: '#434c5e',
      foreground: '#eceff4',
      foregroundSecondary: '#d8dee9',
      foregroundMuted: '#81a1c1',
      nodeBackground: '#3b4252',
      nodeText: '#eceff4',
      nodeBorder: '#4c566a',
      accent: '#88c0d0',
      success: '#a3be8c',
      warning: '#ebcb8b',
      error: '#bf616a',
      info: '#81a1c1',
    },
  },

  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox',
    colors: {
      background: '#282828',
      backgroundSecondary: '#3c3836',
      backgroundTertiary: '#504945',
      foreground: '#ebdbb2',
      foregroundSecondary: '#d5c4a1',
      foregroundMuted: '#928374',
      nodeBackground: '#3c3836',
      nodeText: '#ebdbb2',
      nodeBorder: '#504945',
      accent: '#83a598',
      success: '#b8bb26',
      warning: '#fabd2f',
      error: '#fb4934',
      info: '#83a598',
    },
  },

  'gruvbox-light': {
    id: 'gruvbox-light',
    name: 'Gruvbox Light',
    colors: {
      background: '#fbf1c7',
      backgroundSecondary: '#f2e5bc',
      backgroundTertiary: '#ebdbb2',
      foreground: '#3c3836',
      foregroundSecondary: '#504945',
      foregroundMuted: '#7c6f64',
      nodeBackground: '#f2e5bc',
      nodeText: '#3c3836',
      nodeBorder: '#d5c4a1',
      accent: '#076678',
      success: '#79740e',
      warning: '#b57614',
      error: '#9d0006',
      info: '#076678',
    },
  },

  solarized: {
    id: 'solarized',
    name: 'Solarized Dark',
    colors: {
      background: '#002b36',
      backgroundSecondary: '#073642',
      backgroundTertiary: '#586e75',
      foreground: '#fdf6e3',
      foregroundSecondary: '#eee8d5',
      foregroundMuted: '#93a1a1',
      nodeBackground: '#073642',
      nodeText: '#fdf6e3',
      nodeBorder: '#586e75',
      accent: '#268bd2',
      success: '#859900',
      warning: '#b58900',
      error: '#dc322f',
      info: '#268bd2',
    },
  },

  'solarized-light': {
    id: 'solarized-light',
    name: 'Solarized Light',
    colors: {
      background: '#fdf6e3',
      backgroundSecondary: '#eee8d5',
      backgroundTertiary: '#93a1a1',
      foreground: '#002b36',
      foregroundSecondary: '#073642',
      foregroundMuted: '#586e75',
      nodeBackground: '#eee8d5',
      nodeText: '#002b36',
      nodeBorder: '#93a1a1',
      accent: '#268bd2',
      success: '#859900',
      warning: '#b58900',
      error: '#dc322f',
      info: '#268bd2',
    },
  },

  dracula: {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      background: '#282a36',
      backgroundSecondary: '#44475a',
      backgroundTertiary: '#6272a4',
      foreground: '#f8f8f2',
      foregroundSecondary: '#e9e9e4',
      foregroundMuted: '#6272a4',
      nodeBackground: '#44475a',
      nodeText: '#f8f8f2',
      nodeBorder: '#6272a4',
      accent: '#bd93f9',
      success: '#50fa7b',
      warning: '#f1fa8c',
      error: '#ff5555',
      info: '#8be9fd',
    },
  },

  monokai: {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      background: '#272822',
      backgroundSecondary: '#3e3d32',
      backgroundTertiary: '#49483e',
      foreground: '#f8f8f2',
      foregroundSecondary: '#e6e6e1',
      foregroundMuted: '#75715e',
      nodeBackground: '#3e3d32',
      nodeText: '#f8f8f2',
      nodeBorder: '#49483e',
      accent: '#66d9ef',
      success: '#a6e22e',
      warning: '#e6db74',
      error: '#f92672',
      info: '#66d9ef',
    },
  },
};

/**
 * FR: Obtenir un thème par son ID
 * EN: Get a theme by its ID
 */
export function getTheme(themeId: string): ColorTheme {
  return COLOR_THEMES[themeId] || COLOR_THEMES.light;
}

/**
 * FR: Obtenir la liste de tous les thèmes
 * EN: Get list of all themes
 */
export function getAllThemes(): ColorTheme[] {
  return Object.values(COLOR_THEMES);
}

/**
 * FR: Appliquer un thème au document HTML
 * EN: Apply a theme to the HTML document
 */
export function applyThemeToDocument(theme: ColorTheme): void {
  const root = document.documentElement;

  // FR: Appliquer les variables CSS
  // EN: Apply CSS variables
  root.style.setProperty('--bg', theme.colors.background);
  root.style.setProperty('--bg-secondary', theme.colors.backgroundSecondary);
  root.style.setProperty('--bg-tertiary', theme.colors.backgroundTertiary);

  root.style.setProperty('--fg', theme.colors.foreground);
  root.style.setProperty('--fg-secondary', theme.colors.foregroundSecondary);
  root.style.setProperty('--fg-muted', theme.colors.foregroundMuted);

  root.style.setProperty('--node-bg', theme.colors.nodeBackground);
  root.style.setProperty('--node-text', theme.colors.nodeText);
  root.style.setProperty('--node-border', theme.colors.nodeBorder);

  root.style.setProperty('--accent-color', theme.colors.accent);
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--warning', theme.colors.warning);
  root.style.setProperty('--error', theme.colors.error);
  root.style.setProperty('--info', theme.colors.info);

  // FR: Ajouter des variations d'opacité pour l'accent
  // EN: Add opacity variations for accent
  root.style.setProperty('--accent-light', `${theme.colors.accent}20`);
  root.style.setProperty('--accent-hover', `${theme.colors.accent}dd`);
}
