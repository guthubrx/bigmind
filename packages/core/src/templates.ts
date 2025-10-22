/**
 * FR: Système de templates pour BigMind
 * EN: Template system for BigMind
 */

import type { MindMap } from './model';

// FR: Catégories de templates
// EN: Template categories
export enum TemplateCategory {
  BRAINSTORMING = 'brainstorming',
  PROJECT_PLANNING = 'project-planning',
  DECISION_MAKING = 'decision-making',
  ANALYSIS = 'analysis',
  ORGANIZATION = 'organization',
  LEARNING = 'learning',
  BUSINESS = 'business',
  PERSONAL = 'personal',
  CUSTOM = 'custom',
}

// FR: Niveau de complexité
// EN: Complexity level
export enum TemplateComplexity {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  ADVANCED = 'advanced',
}

// FR: Métadonnées d'un template
// EN: Template metadata
export interface TemplateMetadata {
  // FR: Identifiant unique
  // EN: Unique identifier
  readonly id: string;

  // FR: Nom du template
  // EN: Template name
  readonly name: string;

  // FR: Description détaillée
  // EN: Detailed description
  readonly description: string;

  // FR: Catégorie
  // EN: Category
  readonly category: TemplateCategory;

  // FR: Complexité
  // EN: Complexity
  readonly complexity: TemplateComplexity;

  // FR: URL de la miniature
  // EN: Thumbnail URL
  readonly thumbnail?: string;

  // FR: Tags pour la recherche
  // EN: Search tags
  readonly tags: readonly string[];

  // FR: Auteur
  // EN: Author
  readonly author?: string;

  // FR: Template système (non modifiable)
  // EN: System template (non-editable)
  readonly isSystem: boolean;

  // FR: Date de création
  // EN: Creation date
  readonly createdAt: string;

  // FR: Dernière modification
  // EN: Last modified
  readonly updatedAt: string;

  // FR: Nombre d'utilisations
  // EN: Usage count
  readonly usageCount?: number;
}

// FR: Template complet
// EN: Complete template
export interface Template {
  // FR: Métadonnées
  // EN: Metadata
  readonly metadata: TemplateMetadata;

  // FR: Carte mentale du template
  // EN: Template mind map
  readonly mindMap: MindMap;

  // FR: Instructions optionnelles pour l'utilisateur
  // EN: Optional user instructions
  readonly instructions?: string;

  // FR: Thème suggéré (ID du thème)
  // EN: Suggested theme (theme ID)
  readonly suggestedThemeId?: string;
}

// FR: Collection de templates
// EN: Template collection
export interface TemplateCollection {
  // FR: Nom de la collection
  // EN: Collection name
  readonly name: string;

  // FR: Description
  // EN: Description
  readonly description: string;

  // FR: IDs des templates
  // EN: Template IDs
  readonly templateIds: readonly string[];

  // FR: Icône de la collection
  // EN: Collection icon
  readonly icon?: string;

  // FR: Date de création
  // EN: Creation date
  readonly createdAt: string;
}

// FR: Préférences de templates de l'utilisateur
// EN: User template preferences
export interface TemplatePreferences {
  // FR: Templates favoris (IDs)
  // EN: Favorite templates (IDs)
  favoriteTemplateIds: string[];

  // FR: Templates récemment utilisés (IDs)
  // EN: Recently used templates (IDs)
  recentTemplateIds: string[];

  // FR: Templates personnalisés
  // EN: Custom templates
  customTemplates: Template[];

  // FR: Collections personnalisées
  // EN: Custom collections
  customCollections: TemplateCollection[];

  // FR: Afficher les templates au démarrage
  // EN: Show templates on startup
  showOnStartup: boolean;
}

// FR: Filtre de recherche de templates
// EN: Template search filter
export interface TemplateFilter {
  // FR: Recherche textuelle
  // EN: Text search
  query?: string;

  // FR: Catégories
  // EN: Categories
  categories?: TemplateCategory[];

  // FR: Niveau de complexité
  // EN: Complexity levels
  complexities?: TemplateComplexity[];

  // FR: Tags
  // EN: Tags
  tags?: string[];

  // FR: Favoris uniquement
  // EN: Favorites only
  favoritesOnly?: boolean;

  // FR: Templates système uniquement
  // EN: System templates only
  systemOnly?: boolean;
}

// FR: Utilitaires pour les templates
// EN: Template utilities
export class TemplateUtils {
  /**
   * FR: Valide qu'un template est complet et valide
   * EN: Validates that a template is complete and valid
   */
  static isValidTemplate(template: unknown): template is Template {
    if (!template || typeof template !== 'object') return false;

    const t = template as Partial<Template>;
    return !!(
      t.metadata &&
      t.metadata.id &&
      t.metadata.name &&
      t.metadata.category &&
      t.mindMap &&
      t.mindMap.id &&
      t.mindMap.rootId &&
      t.mindMap.nodes
    );
  }

  /**
   * FR: Filtre les templates selon les critères
   * EN: Filters templates by criteria
   */
  static filterTemplates(templates: Template[], filter: TemplateFilter): Template[] {
    let filtered = [...templates];

    // FR: Recherche textuelle
    // EN: Text search
    if (filter.query) {
      const query = filter.query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.metadata.name.toLowerCase().includes(query) ||
          t.metadata.description.toLowerCase().includes(query) ||
          t.metadata.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // FR: Filtrer par catégories
    // EN: Filter by categories
    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter((t) => filter.categories!.includes(t.metadata.category));
    }

    // FR: Filtrer par complexité
    // EN: Filter by complexity
    if (filter.complexities && filter.complexities.length > 0) {
      filtered = filtered.filter((t) => filter.complexities!.includes(t.metadata.complexity));
    }

    // FR: Filtrer par tags
    // EN: Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((t) =>
        filter.tags!.some((tag) => t.metadata.tags.includes(tag))
      );
    }

    // FR: Favoris uniquement
    // EN: Favorites only
    if (filter.favoritesOnly) {
      // Note: nécessite le contexte des préférences
      // This would require preferences context
    }

    // FR: Templates système uniquement
    // EN: System templates only
    if (filter.systemOnly !== undefined) {
      filtered = filtered.filter((t) => t.metadata.isSystem === filter.systemOnly);
    }

    return filtered;
  }

  /**
   * FR: Crée un template depuis une carte existante
   * EN: Creates a template from an existing mind map
   */
  static createTemplateFromMindMap(
    mindMap: MindMap,
    metadata: Omit<TemplateMetadata, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>
  ): Template {
    const now = new Date().toISOString();

    return {
      metadata: {
        ...metadata,
        id: `template-${Date.now()}`,
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      },
      mindMap: {
        ...mindMap,
        id: `${mindMap.id}-template`,
        meta: {
          ...mindMap.meta,
          createdAt: now,
          updatedAt: now,
        },
      },
    };
  }

  /**
   * FR: Crée une carte depuis un template
   * EN: Creates a mind map from a template
   */
  static createMindMapFromTemplate(template: Template, customName?: string): MindMap {
    const now = new Date().toISOString();

    return {
      ...template.mindMap,
      id: `map-${Date.now()}`,
      meta: {
        ...template.mindMap.meta,
        name: customName || template.metadata.name,
        createdAt: now,
        updatedAt: now,
      },
    };
  }

  /**
   * FR: Compte les nœuds dans un template
   * EN: Counts nodes in a template
   */
  static countNodes(template: Template): number {
    return Object.keys(template.mindMap.nodes).length;
  }

  /**
   * FR: Calcule la profondeur maximale du template
   * EN: Calculates maximum depth of template
   */
  static calculateMaxDepth(template: Template): number {
    const { mindMap } = template;
    const { rootId, nodes } = mindMap;

    const getDepth = (nodeId: string, currentDepth: number): number => {
      const node = nodes[nodeId];
      if (!node || node.children.length === 0) return currentDepth;

      return Math.max(
        ...node.children.map((childId) => getDepth(childId, currentDepth + 1))
      );
    };

    return getDepth(rootId, 0);
  }

  /**
   * FR: Convertit un template en JSON
   * EN: Converts template to JSON
   */
  static toJSON(template: Template): string {
    return JSON.stringify(template, null, 2);
  }

  /**
   * FR: Parse un template depuis JSON
   * EN: Parses template from JSON
   */
  static fromJSON(json: string): Template | null {
    try {
      const parsed = JSON.parse(json);
      return TemplateUtils.isValidTemplate(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}
