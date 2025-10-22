/**
 * FR: Système de templates pour BigMind
 * EN: Template system for BigMind
 */
// FR: Catégories de templates
// EN: Template categories
export var TemplateCategory;
(function (TemplateCategory) {
    TemplateCategory["BRAINSTORMING"] = "brainstorming";
    TemplateCategory["PROJECT_PLANNING"] = "project-planning";
    TemplateCategory["DECISION_MAKING"] = "decision-making";
    TemplateCategory["ANALYSIS"] = "analysis";
    TemplateCategory["ORGANIZATION"] = "organization";
    TemplateCategory["LEARNING"] = "learning";
    TemplateCategory["BUSINESS"] = "business";
    TemplateCategory["PERSONAL"] = "personal";
    TemplateCategory["CUSTOM"] = "custom";
})(TemplateCategory || (TemplateCategory = {}));
// FR: Niveau de complexité
// EN: Complexity level
export var TemplateComplexity;
(function (TemplateComplexity) {
    TemplateComplexity["SIMPLE"] = "simple";
    TemplateComplexity["MEDIUM"] = "medium";
    TemplateComplexity["ADVANCED"] = "advanced";
})(TemplateComplexity || (TemplateComplexity = {}));
// FR: Utilitaires pour les templates
// EN: Template utilities
export class TemplateUtils {
    /**
     * FR: Valide qu'un template est complet et valide
     * EN: Validates that a template is complete and valid
     */
    static isValidTemplate(template) {
        if (!template || typeof template !== 'object')
            return false;
        const t = template;
        return !!(t.metadata &&
            t.metadata.id &&
            t.metadata.name &&
            t.metadata.category &&
            t.mindMap &&
            t.mindMap.id &&
            t.mindMap.rootId &&
            t.mindMap.nodes);
    }
    /**
     * FR: Filtre les templates selon les critères
     * EN: Filters templates by criteria
     */
    static filterTemplates(templates, filter) {
        let filtered = [...templates];
        // FR: Recherche textuelle
        // EN: Text search
        if (filter.query) {
            const query = filter.query.toLowerCase();
            filtered = filtered.filter((t) => t.metadata.name.toLowerCase().includes(query) ||
                t.metadata.description.toLowerCase().includes(query) ||
                t.metadata.tags.some((tag) => tag.toLowerCase().includes(query)));
        }
        // FR: Filtrer par catégories
        // EN: Filter by categories
        if (filter.categories && filter.categories.length > 0) {
            filtered = filtered.filter((t) => filter.categories.includes(t.metadata.category));
        }
        // FR: Filtrer par complexité
        // EN: Filter by complexity
        if (filter.complexities && filter.complexities.length > 0) {
            filtered = filtered.filter((t) => filter.complexities.includes(t.metadata.complexity));
        }
        // FR: Filtrer par tags
        // EN: Filter by tags
        if (filter.tags && filter.tags.length > 0) {
            filtered = filtered.filter((t) => filter.tags.some((tag) => t.metadata.tags.includes(tag)));
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
    static createTemplateFromMindMap(mindMap, metadata) {
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
    static createMindMapFromTemplate(template, customName) {
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
    static countNodes(template) {
        return Object.keys(template.mindMap.nodes).length;
    }
    /**
     * FR: Calcule la profondeur maximale du template
     * EN: Calculates maximum depth of template
     */
    static calculateMaxDepth(template) {
        const { mindMap } = template;
        const { rootId, nodes } = mindMap;
        const getDepth = (nodeId, currentDepth) => {
            const node = nodes[nodeId];
            if (!node || node.children.length === 0)
                return currentDepth;
            return Math.max(...node.children.map((childId) => getDepth(childId, currentDepth + 1)));
        };
        return getDepth(rootId, 0);
    }
    /**
     * FR: Convertit un template en JSON
     * EN: Converts template to JSON
     */
    static toJSON(template) {
        return JSON.stringify(template, null, 2);
    }
    /**
     * FR: Parse un template depuis JSON
     * EN: Parses template from JSON
     */
    static fromJSON(json) {
        try {
            const parsed = JSON.parse(json);
            return TemplateUtils.isValidTemplate(parsed) ? parsed : null;
        }
        catch {
            return null;
        }
    }
}
//# sourceMappingURL=templates.js.map