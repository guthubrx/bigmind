/**
 * FR: Système de templates pour BigMind
 * EN: Template system for BigMind
 */
import type { MindMap } from './model';
export declare enum TemplateCategory {
    BRAINSTORMING = "brainstorming",
    PROJECT_PLANNING = "project-planning",
    DECISION_MAKING = "decision-making",
    ANALYSIS = "analysis",
    ORGANIZATION = "organization",
    LEARNING = "learning",
    BUSINESS = "business",
    PERSONAL = "personal",
    CUSTOM = "custom"
}
export declare enum TemplateComplexity {
    SIMPLE = "simple",
    MEDIUM = "medium",
    ADVANCED = "advanced"
}
export interface TemplateMetadata {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: TemplateCategory;
    readonly complexity: TemplateComplexity;
    readonly thumbnail?: string;
    readonly tags: readonly string[];
    readonly author?: string;
    readonly isSystem: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly usageCount?: number;
}
export interface Template {
    readonly metadata: TemplateMetadata;
    readonly mindMap: MindMap;
    readonly instructions?: string;
    readonly suggestedThemeId?: string;
}
export interface TemplateCollection {
    readonly name: string;
    readonly description: string;
    readonly templateIds: readonly string[];
    readonly icon?: string;
    readonly createdAt: string;
}
export interface TemplatePreferences {
    favoriteTemplateIds: string[];
    recentTemplateIds: string[];
    customTemplates: Template[];
    customCollections: TemplateCollection[];
    showOnStartup: boolean;
}
export interface TemplateFilter {
    query?: string;
    categories?: TemplateCategory[];
    complexities?: TemplateComplexity[];
    tags?: string[];
    favoritesOnly?: boolean;
    systemOnly?: boolean;
}
export declare class TemplateUtils {
    /**
     * FR: Valide qu'un template est complet et valide
     * EN: Validates that a template is complete and valid
     */
    static isValidTemplate(template: unknown): template is Template;
    /**
     * FR: Filtre les templates selon les critères
     * EN: Filters templates by criteria
     */
    static filterTemplates(templates: Template[], filter: TemplateFilter): Template[];
    /**
     * FR: Crée un template depuis une carte existante
     * EN: Creates a template from an existing mind map
     */
    static createTemplateFromMindMap(mindMap: MindMap, metadata: Omit<TemplateMetadata, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>): Template;
    /**
     * FR: Crée une carte depuis un template
     * EN: Creates a mind map from a template
     */
    static createMindMapFromTemplate(template: Template, customName?: string): MindMap;
    /**
     * FR: Compte les nœuds dans un template
     * EN: Counts nodes in a template
     */
    static countNodes(template: Template): number;
    /**
     * FR: Calcule la profondeur maximale du template
     * EN: Calculates maximum depth of template
     */
    static calculateMaxDepth(template: Template): number;
    /**
     * FR: Convertit un template en JSON
     * EN: Converts template to JSON
     */
    static toJSON(template: Template): string;
    /**
     * FR: Parse un template depuis JSON
     * EN: Parses template from JSON
     */
    static fromJSON(json: string): Template | null;
}
//# sourceMappingURL=templates.d.ts.map