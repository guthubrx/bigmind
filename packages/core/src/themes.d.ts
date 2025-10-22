/**
 * FR: Système de thèmes avancés pour BigMind
 * EN: Advanced theme system for BigMind
 */
export interface ThemeColorScheme {
    readonly background: string;
    readonly surface: string;
    readonly primary: string;
    readonly secondary?: string;
    readonly text: string;
    readonly textSecondary: string;
    readonly border: string;
    readonly branchColors: readonly string[];
}
export interface ThemeNodeStyles {
    readonly root: {
        readonly backgroundColor: string;
        readonly textColor: string;
        readonly fontSize: number;
        readonly fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
        readonly borderRadius: number;
        readonly borderWidth: number;
        readonly borderColor: string;
    };
    readonly level1: {
        readonly backgroundColor: string;
        readonly textColor: string;
        readonly fontSize: number;
        readonly fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
        readonly borderRadius: number;
    };
    readonly levelN: {
        readonly backgroundColor: string;
        readonly textColor: string;
        readonly fontSize: number;
        readonly fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
        readonly borderRadius: number;
    };
}
export interface Theme {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: ThemeCategory;
    readonly thumbnail?: string;
    readonly colors: ThemeColorScheme;
    readonly nodeStyles: ThemeNodeStyles;
    readonly isSystem: boolean;
    readonly author?: string;
    readonly createdAt?: string;
}
export declare enum ThemeCategory {
    PROFESSIONAL = "professional",
    CREATIVE = "creative",
    MINIMAL = "minimal",
    COLORFUL = "colorful",
    DARK = "dark",
    LIGHT = "light",
    CUSTOM = "custom"
}
export interface ThemePreferences {
    activeThemeId: string;
    customThemes: Theme[];
    favoriteThemeIds: string[];
    autoTheme: boolean;
}
export declare class ThemeUtils {
    /**
     * FR: Valide qu'un thème a tous les champs requis
     * EN: Validates that a theme has all required fields
     */
    static isValidTheme(theme: unknown): theme is Theme;
    /**
     * FR: Obtient la couleur de branche pour un index donné (avec rotation)
     * EN: Gets branch color for a given index (with rotation)
     */
    static getBranchColor(theme: Theme, index: number): string;
    /**
     * FR: Crée un thème personnalisé à partir d'un thème existant
     * EN: Creates a custom theme from an existing theme
     */
    static createCustomTheme(baseTheme: Theme, customizations: Partial<Omit<Theme, 'id' | 'isSystem'>>): Theme;
    /**
     * FR: Convertit un thème en format JSON sérialisable
     * EN: Converts a theme to serializable JSON format
     */
    static toJSON(theme: Theme): string;
    /**
     * FR: Parse un thème depuis JSON
     * EN: Parses a theme from JSON
     */
    static fromJSON(json: string): Theme | null;
}
//# sourceMappingURL=themes.d.ts.map