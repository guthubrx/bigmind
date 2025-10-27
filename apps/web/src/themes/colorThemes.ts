/**
 * FR: Définitions des thèmes d'interface (Light/Dark) pour BigMind
 * EN: Interface theme definitions (Light/Dark) for BigMind
 */

export interface InterfaceTheme {
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

// FR: Type pour rétro-compatibilité
// EN: Type for backward compatibility
export interface ColorTheme extends InterfaceTheme {
  palette?: string[];
}

/**
 * FR: Thèmes d'interface Light et Dark uniquement
 * EN: Light and Dark interface themes only
 */
export const INTERFACE_THEMES: Record<string, InterfaceTheme> = {
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
};

// FR: Alias pour rétro-compatibilité
// EN: Alias for backward compatibility
export const COLOR_THEMES: Record<string, ColorTheme> = {
  light: {
    ...INTERFACE_THEMES.light,
    palette: [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#ef4444',
      '#f59e0b',
      '#eab308',
      '#84cc16',
      '#10b981',
      '#14b8a6',
      '#06b6d4',
    ],
  },
  dark: {
    ...INTERFACE_THEMES.dark,
    palette: [
      '#60a5fa',
      '#a78bfa',
      '#f472b6',
      '#f87171',
      '#fb923c',
      '#fbbf24',
      '#a3e635',
      '#34d399',
      '#2dd4bf',
      '#22d3ee',
    ],
  },
};

/**
 * FR: Obtenir un thème d'interface par son ID
 * EN: Get an interface theme by its ID
 */
export function getInterfaceTheme(themeId: string): InterfaceTheme {
  return INTERFACE_THEMES[themeId] || INTERFACE_THEMES.light;
}

/**
 * FR: Obtenir la liste de tous les thèmes d'interface
 * EN: Get list of all interface themes
 */
export function getAllInterfaceThemes(): InterfaceTheme[] {
  return Object.values(INTERFACE_THEMES);
}

/**
 * FR: Appliquer un thème d'interface au document HTML
 * EN: Apply an interface theme to the HTML document
 */
export function applyInterfaceThemeToDocument(theme: InterfaceTheme): void {
  const root = document.documentElement;

  // FR: Appliquer les variables CSS
  // EN: Apply CSS variables
  root.style.setProperty('--bg', theme.colors.background);
  root.style.setProperty('--bg-secondary', theme.colors.backgroundSecondary);
  root.style.setProperty('--bg-tertiary', theme.colors.backgroundTertiary);
  root.style.setProperty('--border-color', theme.colors.backgroundTertiary);

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

// FR: Fonctions pour rétro-compatibilité
// EN: Functions for backward compatibility

/**
 * FR: Obtenir un thème par son ID (rétro-compatibilité)
 * EN: Get a theme by its ID (backward compatibility)
 */
export function getTheme(themeId: string): ColorTheme {
  return COLOR_THEMES[themeId] || COLOR_THEMES.light;
}

/**
 * FR: Obtenir la liste de tous les thèmes (rétro-compatibilité)
 * EN: Get list of all themes (backward compatibility)
 */
export function getAllThemes(): ColorTheme[] {
  return Object.values(COLOR_THEMES);
}

/**
 * FR: Appliquer un thème au document HTML (rétro-compatibilité)
 * EN: Apply a theme to the HTML document (backward compatibility)
 */
export function applyThemeToDocument(theme: ColorTheme): void {
  applyInterfaceThemeToDocument(theme);
}
