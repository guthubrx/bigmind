/**
 * FR: Hook pour la gestion des templates
 * EN: Hook for template management
 */

import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Template,
  TemplateCategory,
  TemplateComplexity,
  TemplateFilter,
  TemplateUtils,
  MindMap,
} from '@bigmind/core';
import { PRESET_TEMPLATES, searchTemplates } from '@bigmind/design';

interface TemplateState {
  customTemplates: Template[];
  favoriteTemplateIds: string[];
  recentTemplateIds: string[];
  addCustomTemplate: (template: Template) => void;
  deleteCustomTemplate: (templateId: string) => void;
  toggleFavorite: (templateId: string) => void;
  addRecent: (templateId: string) => void;
}

// FR: Store Zustand pour l'état des templates
// EN: Zustand store for template state
const useTemplateStore = create<TemplateState>()(
  persist(
    immer(set => ({
      customTemplates: [],
      favoriteTemplateIds: [],
      recentTemplateIds: [],

      addCustomTemplate: (template: Template) =>
        set(state => {
          if (!TemplateUtils.isValidTemplate(template)) return;
          state.customTemplates.push(template);
        }),

      deleteCustomTemplate: (templateId: string) =>
        set(state => {
          state.customTemplates = state.customTemplates.filter(t => t.metadata.id !== templateId);
        }),

      toggleFavorite: (templateId: string) =>
        set(state => {
          const idx = state.favoriteTemplateIds.indexOf(templateId);
          if (idx !== -1) {
            state.favoriteTemplateIds.splice(idx, 1);
          } else {
            state.favoriteTemplateIds.push(templateId);
          }
        }),

      addRecent: (templateId: string) =>
        set(state => {
          // FR: Retirer si déjà présent
          // EN: Remove if already present
          const idx = state.recentTemplateIds.indexOf(templateId);
          if (idx !== -1) {
            state.recentTemplateIds.splice(idx, 1);
          }

          // FR: Ajouter au début et limiter à 10
          // EN: Add to beginning and limit to 10
          state.recentTemplateIds.unshift(templateId);
          if (state.recentTemplateIds.length > 10) {
            state.recentTemplateIds.pop();
          }
        }),
    })),
    {
      name: 'bigmind-templates',
      version: 1,
    }
  )
);

/**
 * FR: Hook pour la gestion des templates
 * EN: Hook for template management
 */
export function useTemplates() {
  const {
    customTemplates,
    favoriteTemplateIds,
    recentTemplateIds,
    addCustomTemplate,
    deleteCustomTemplate,
    toggleFavorite,
    addRecent,
  } = useTemplateStore();

  // FR: Obtient tous les templates (système + personnalisés)
  // EN: Gets all templates (system + custom)
  const allTemplates = useMemo(() => [...PRESET_TEMPLATES, ...customTemplates], [customTemplates]);

  // FR: Obtient les templates favoris
  // EN: Gets favorite templates
  const favoriteTemplates = useMemo(
    () => allTemplates.filter(t => favoriteTemplateIds.includes(t.metadata.id)),
    [allTemplates, favoriteTemplateIds]
  );

  // FR: Obtient les templates récemment utilisés
  // EN: Gets recently used templates
  const recentTemplates = useMemo(
    () =>
      recentTemplateIds
        .map(id => allTemplates.find(t => t.metadata.id === id))
        .filter((t): t is Template => !!t),
    [allTemplates, recentTemplateIds]
  );

  // FR: Obtient un template par ID
  // EN: Gets a template by ID
  const getTemplateById = useCallback(
    (id: string): Template | undefined => allTemplates.find(t => t.metadata.id === id),
    [allTemplates]
  );

  // FR: Filtre les templates
  // EN: Filters templates
  const filterTemplates = useCallback(
    (filter: TemplateFilter): Template[] => TemplateUtils.filterTemplates(allTemplates, filter),
    [allTemplates]
  );

  // FR: Recherche les templates par texte
  // EN: Searches templates by text
  const searchByText = useCallback(
    (query: string): Template[] => {
      const results = searchTemplates(query);
      // FR: Inclure les templates personnalisés dans la recherche
      // EN: Include custom templates in search
      return [...results, ...customTemplates].filter(t => {
        const name = t.metadata.name.toLowerCase();
        const desc = t.metadata.description.toLowerCase();
        const q = query.toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    },
    [customTemplates]
  );

  // FR: Obtient les templates par catégorie
  // EN: Gets templates by category
  const getTemplatesByCategory = useCallback(
    (category: TemplateCategory): Template[] =>
      allTemplates.filter(t => t.metadata.category === category),
    [allTemplates]
  );

  // FR: Obtient les templates par complexité
  // EN: Gets templates by complexity
  const getTemplatesByComplexity = useCallback(
    (complexity: TemplateComplexity): Template[] =>
      allTemplates.filter(t => t.metadata.complexity === complexity),
    [allTemplates]
  );

  // FR: Crée une carte depuis un template
  // EN: Creates a mind map from a template
  const createMindMapFromTemplate = useCallback(
    (templateId: string, customName?: string): MindMap | null => {
      const template = getTemplateById(templateId);
      if (!template) return null;

      // FR: Enregistrer l'utilisation récente
      // EN: Record recent usage
      addRecent(templateId);

      return TemplateUtils.createMindMapFromTemplate(template, customName);
    },
    [getTemplateById, addRecent]
  );

  // FR: Crée un template depuis une carte
  // EN: Creates a template from a mind map
  const createTemplateFromMindMap = useCallback(
    (mindMap: MindMap, name: string, category: TemplateCategory) => {
      const template = TemplateUtils.createTemplateFromMindMap(mindMap, {
        name,
        category,
        description: `Template créé à partir de "${mindMap.meta.name}"`,
        tags: [category.toLowerCase()],
      });

      addCustomTemplate(template);
      return template;
    },
    [addCustomTemplate]
  );

  // FR: Exporte un template en JSON
  // EN: Exports template to JSON
  const exportTemplate = useCallback(
    (templateId: string): string | null => {
      const template = getTemplateById(templateId);
      if (!template) return null;
      return TemplateUtils.toJSON(template);
    },
    [getTemplateById]
  );

  // FR: Importe un template depuis JSON
  // EN: Imports template from JSON
  const importTemplate = useCallback(
    (json: string): Template | null => {
      const template = TemplateUtils.fromJSON(json);
      if (!template) return null;
      addCustomTemplate(template);
      return template;
    },
    [addCustomTemplate]
  );

  return {
    // État
    allTemplates,
    customTemplates,
    favoriteTemplates,
    recentTemplates,
    favoriteTemplateIds,
    recentTemplateIds,

    // Actions
    addCustomTemplate,
    deleteCustomTemplate,
    toggleFavorite,
    getTemplateById,
    filterTemplates,
    searchByText,
    getTemplatesByCategory,
    getTemplatesByComplexity,
    createMindMapFromTemplate,
    createTemplateFromMindMap,
    exportTemplate,
    importTemplate,
  };
}
