/**
 * FR: Système de thèmes avancés pour BigMind
 * EN: Advanced theme system for BigMind
 */
// FR: Catégories de thèmes
// EN: Theme categories
export var ThemeCategory;
(function (ThemeCategory) {
    ThemeCategory["PROFESSIONAL"] = "professional";
    ThemeCategory["CREATIVE"] = "creative";
    ThemeCategory["MINIMAL"] = "minimal";
    ThemeCategory["COLORFUL"] = "colorful";
    ThemeCategory["DARK"] = "dark";
    ThemeCategory["LIGHT"] = "light";
    ThemeCategory["CUSTOM"] = "custom";
})(ThemeCategory || (ThemeCategory = {}));
// FR: Utilitaires pour la gestion des thèmes
// EN: Theme management utilities
export class ThemeUtils {
    /**
     * FR: Valide qu'un thème a tous les champs requis
     * EN: Validates that a theme has all required fields
     */
    static isValidTheme(theme) {
        if (!theme || typeof theme !== 'object')
            return false;
        const t = theme;
        return !!(t.id &&
            t.name &&
            t.category &&
            t.colors &&
            t.nodeStyles &&
            typeof t.isSystem === 'boolean' &&
            t.colors.branchColors &&
            t.colors.branchColors.length >= 6);
    }
    /**
     * FR: Obtient la couleur de branche pour un index donné (avec rotation)
     * EN: Gets branch color for a given index (with rotation)
     */
    static getBranchColor(theme, index) {
        const colors = theme.colors.branchColors;
        return colors[index % colors.length];
    }
    /**
     * FR: Crée un thème personnalisé à partir d'un thème existant
     * EN: Creates a custom theme from an existing theme
     */
    static createCustomTheme(baseTheme, customizations) {
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
    static toJSON(theme) {
        return JSON.stringify(theme, null, 2);
    }
    /**
     * FR: Parse un thème depuis JSON
     * EN: Parses a theme from JSON
     */
    static fromJSON(json) {
        try {
            const parsed = JSON.parse(json);
            return ThemeUtils.isValidTheme(parsed) ? parsed : null;
        }
        catch {
            return null;
        }
    }
}
//# sourceMappingURL=themes.js.map