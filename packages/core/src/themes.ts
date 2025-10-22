/**
 * FR: Système de thèmes avancés pour BigMind
 * EN: Advanced theme system for BigMind
 */

// FR: Configuration de couleurs d'un thème
// EN: Theme color configuration
export interface ThemeColorScheme {
  // FR: Couleur de fond principale
  // EN: Main background color
  readonly background: string;

  // FR: Couleur de surface (cartes, panneaux)
  // EN: Surface color (cards, panels)
  readonly surface: string;

  // FR: Couleur d'accent primaire
  // EN: Primary accent color
  readonly primary: string;

  // FR: Couleur d'accent secondaire
  // EN: Secondary accent color
  readonly secondary?: string;

  // FR: Couleur de texte principale
  // EN: Primary text color
  readonly text: string;

  // FR: Couleur de texte secondaire
  // EN: Secondary text color
  readonly textSecondary: string;

  // FR: Couleur de bordure
  // EN: Border color
  readonly border: string;

  // FR: Palette de couleurs pour les branches (min 6 couleurs)
  // EN: Branch color palette (min 6 colors)
  readonly branchColors: readonly string[];
}

// FR: Styles de nœuds pour un thème
// EN: Node styles for a theme
export interface ThemeNodeStyles {
  // FR: Style du nœud racine
  // EN: Root node style
  readonly root: {
    readonly backgroundColor: string;
    readonly textColor: string;
    readonly fontSize: number;
    readonly fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    readonly borderRadius: number;
    readonly borderWidth: number;
    readonly borderColor: string;
  };

  // FR: Style des nœuds de premier niveau
  // EN: First level nodes style
  readonly level1: {
    readonly backgroundColor: string;
    readonly textColor: string;
    readonly fontSize: number;
    readonly fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    readonly borderRadius: number;
  };

  // FR: Style des nœuds de second niveau et plus
  // EN: Second level and deeper nodes style
  readonly levelN: {
    readonly backgroundColor: string;
    readonly textColor: string;
    readonly fontSize: number;
    readonly fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    readonly borderRadius: number;
  };
}

// FR: Configuration complète d'un thème
// EN: Complete theme configuration
export interface Theme {
  // FR: Identifiant unique du thème
  // EN: Unique theme identifier
  readonly id: string;

  // FR: Nom du thème
  // EN: Theme name
  readonly name: string;

  // FR: Description courte
  // EN: Short description
  readonly description: string;

  // FR: Catégorie du thème
  // EN: Theme category
  readonly category: ThemeCategory;

  // FR: URL de la miniature
  // EN: Thumbnail URL
  readonly thumbnail?: string;

  // FR: Schéma de couleurs
  // EN: Color scheme
  readonly colors: ThemeColorScheme;

  // FR: Styles de nœuds
  // EN: Node styles
  readonly nodeStyles: ThemeNodeStyles;

  // FR: Indique si c'est un thème système (non modifiable)
  // EN: Indicates if it's a system theme (non-editable)
  readonly isSystem: boolean;

  // FR: Auteur du thème
  // EN: Theme author
  readonly author?: string;

  // FR: Date de création
  // EN: Creation date
  readonly createdAt?: string;
}

// FR: Catégories de thèmes
// EN: Theme categories
export enum ThemeCategory {
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
  MINIMAL = 'minimal',
  COLORFUL = 'colorful',
  DARK = 'dark',
  LIGHT = 'light',
  CUSTOM = 'custom',
}

// FR: Préférences de thème de l'utilisateur
// EN: User theme preferences
export interface ThemePreferences {
  // FR: ID du thème actif
  // EN: Active theme ID
  activeThemeId: string;

  // FR: Thèmes personnalisés de l'utilisateur
  // EN: User custom themes
  customThemes: Theme[];

  // FR: Thèmes favoris
  // EN: Favorite themes
  favoriteThemeIds: string[];

  // FR: Mode sombre/clair automatique selon le système
  // EN: Auto dark/light mode based on system
  autoTheme: boolean;
}

// FR: Utilitaires pour la gestion des thèmes
// EN: Theme management utilities
export class ThemeUtils {
  /**
   * FR: Valide qu'un thème a tous les champs requis
   * EN: Validates that a theme has all required fields
   */
  static isValidTheme(theme: unknown): theme is Theme {
    if (!theme || typeof theme !== 'object') return false;

    const t = theme as Partial<Theme>;
    return !!(
      t.id &&
      t.name &&
      t.category &&
      t.colors &&
      t.nodeStyles &&
      typeof t.isSystem === 'boolean' &&
      t.colors.branchColors &&
      t.colors.branchColors.length >= 6
    );
  }

  /**
   * FR: Obtient la couleur de branche pour un index donné (avec rotation)
   * EN: Gets branch color for a given index (with rotation)
   */
  static getBranchColor(theme: Theme, index: number): string {
    const colors = theme.colors.branchColors;
    return colors[index % colors.length];
  }

  /**
   * FR: Crée un thème personnalisé à partir d'un thème existant
   * EN: Creates a custom theme from an existing theme
   */
  static createCustomTheme(
    baseTheme: Theme,
    customizations: Partial<Omit<Theme, 'id' | 'isSystem'>>
  ): Theme {
    return {
      ...baseTheme,
      ...customizations,
      id: `custom-${Date.now()}`,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * FR: Convertit un thème en format JSON sérialisable
   * EN: Converts a theme to serializable JSON format
   */
  static toJSON(theme: Theme): string {
    return JSON.stringify(theme, null, 2);
  }

  /**
   * FR: Parse un thème depuis JSON
   * EN: Parses a theme from JSON
   */
  static fromJSON(json: string): Theme | null {
    try {
      const parsed = JSON.parse(json);
      return ThemeUtils.isValidTheme(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}
