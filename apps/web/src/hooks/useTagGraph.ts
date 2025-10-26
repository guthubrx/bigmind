/**
 * FR: Store Zustand pour le graphe de tags (DAG)
 * EN: Zustand store for tags graph (DAG)
 */

import { create } from 'zustand';
import { DagTag, DagLink, DagValidation, RelationType } from '../types/dag';

interface TagGraphState {
  // FR: Données du DAG
  // EN: DAG data
  tags: Record<string, DagTag>;
  links: DagLink[];
  hiddenTags: string[];
  currentFileId: string | null; // FR: ID du fichier actif / EN: Active file ID

  // FR: Actions de gestion des tags
  // EN: Tag management actions
  addTag(tag: DagTag): void;
  removeTag(tagId: string): void;
  updateTag(tagId: string, updates: Partial<DagTag>): void;
  getTag(tagId: string): DagTag | undefined;
  getAllTags(): DagTag[];
  addParent(tagId: string, parentId: string): void;
  removeParent(tagId: string, parentId: string): void;

  // FR: Actions de gestion des liens
  // EN: Link management actions
  addLink(link: DagLink): void;
  removeLink(linkId: string): void;
  getLink(linkId: string): DagLink | undefined;
  getAllLinks(): DagLink[];
  getLinksBetween(sourceId: string, targetId: string): DagLink[];
  createRelation(sourceId: string, targetId: string, type: RelationType): void;
  updateRelationType(linkId: string, type: RelationType): void;

  // FR: Requêtes sur la hiérarchie
  // EN: Hierarchy queries
  getChildren(tagId: string): DagTag[];
  getParents(tagId: string): DagTag[];
  getAncestors(tagId: string): DagTag[];
  getDescendants(tagId: string): DagTag[];

  // FR: Compteurs
  // EN: Counters
  getChildCount(tagId: string): number;
  getDescendantCount(tagId: string): number;
  getNodeCount(tagId: string): number;

  // FR: Visibilité des tags
  // EN: Tag visibility
  isTagHidden(tagId: string): boolean;
  toggleTagVisibility(tagId: string): void;
  setTagVisibility(tagId: string, hidden: boolean): void;
  getHiddenTags(): string[];

  // FR: Validation
  // EN: Validation
  validateDAG(): { valid: boolean; errors: string[] };
  hasCycle(tagId: string): boolean;

  // FR: Utilitaires
  // EN: Utilities
  clear(): void;
  initialize(tags: Record<string, DagTag>, links: DagLink[]): void;
  loadFileData(fileId: string): void; // FR: Charger les tags d'un fichier / EN: Load tags for a file
  saveFileData(fileId: string): void; // FR: Sauvegarder les tags du fichier / EN: Save tags for a file
}

const getStorageKey = (fileId: string | null) =>
  fileId ? `bigmind-tags-${fileId}` : 'bigmind-tags-temp';

type SetState = (
  partial:
    | TagGraphState
    | Partial<TagGraphState>
    | ((state: TagGraphState) => TagGraphState | Partial<TagGraphState>),
  replace?: boolean
) => void;

type GetState = () => TagGraphState;

export const useTagGraph = create<TagGraphState>()((set: SetState, get: GetState) => ({
  tags: {},
  links: [] as DagLink[],
  hiddenTags: [],
  currentFileId: null,

      addTag: (tag: DagTag) => {
        set((state: TagGraphState) => {
          const newTag: DagTag = {
            ...tag,
            parentIds: tag.parentIds || [],
            children: tag.children || [],
            relations: tag.relations || [],
            createdAt: tag.createdAt || Date.now(),
            updatedAt: Date.now(),
          };

          return {
            tags: {
              ...state.tags,
              [tag.id]: newTag,
            },
          };
        });
      },

      removeTag: (tagId: string) => {
        set((state: TagGraphState) => {
          const { [tagId]: removed, ...remaining } = state.tags;

          if (!removed) return state;

          // FR: Nettoyer les références multi-parent
          // EN: Clean up multi-parent references
          const cleaned = { ...remaining };
          Object.values(cleaned).forEach((tag: DagTag) => {
            // Remove from parentIds array
            tag.parentIds = tag.parentIds.filter(id => id !== tagId);
            // Remove from children array
            tag.children = tag.children.filter(id => id !== tagId);
          });

          const filteredLinks = state.links.filter(
            (link: DagLink) => link.sourceId !== tagId && link.targetId !== tagId
          );

          return {
            tags: cleaned,
            links: filteredLinks,
          };
        });
      },

      updateTag: (tagId: string, updates: Partial<DagTag>) => {
        set((state: TagGraphState) => {
          const tag = state.tags[tagId];
          if (!tag) return state;

          return {
            tags: {
              ...state.tags,
              [tagId]: {
                ...tag,
                ...updates,
                id: tag.id,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      getTag: (tagId: string): DagTag | undefined => {
        const state = get();
        return state.tags[tagId];
      },

      getAllTags: (): DagTag[] => {
        const state = get();
        return Object.values(state.tags);
      },

      addLink: (link: DagLink) => {
        set((state: TagGraphState) => {
          const sourceExists = state.tags[link.sourceId];
          const targetExists = state.tags[link.targetId];

          if (!sourceExists || !targetExists) {
            console.warn('Cannot add link: source or target tag does not exist');
            return state;
          }

          return {
            links: [...state.links, link],
          };
        });
      },

      removeLink: (linkId: string) => {
        set((state: TagGraphState) => ({
          links: state.links.filter((link: DagLink) => link.id !== linkId),
        }));
      },

      getLink: (linkId: string): DagLink | undefined => {
        const state = get();
        return state.links.find((link: DagLink) => link.id === linkId);
      },

      getAllLinks: (): DagLink[] => {
        const state = get();
        return [...state.links];
      },

      getLinksBetween: (sourceId: string, targetId: string): DagLink[] => {
        const state = get();
        return state.links.filter(
          (link: DagLink) => link.sourceId === sourceId && link.targetId === targetId
        );
      },

      createRelation: (sourceId: string, targetId: string, type: RelationType) => {
        const state = get();
        if (!state.tags[sourceId] || !state.tags[targetId]) {
          console.warn('Cannot create relation: source or target tag does not exist');
          return;
        }

        // Check if relation already exists
        const existingLinks = state.links.filter(
          (link: DagLink) => link.sourceId === sourceId && link.targetId === targetId
        );
        if (existingLinks.length > 0) {
          console.warn('Relation already exists between these tags');
          return;
        }

        const newLink: DagLink = {
          id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sourceId,
          targetId,
          type,
        };

        set((s: TagGraphState) => ({
          links: [...s.links, newLink],
        }));
      },

      updateRelationType: (linkId: string, type: RelationType) => {
        set((state: TagGraphState) => {
          const linkIndex = state.links.findIndex((link: DagLink) => link.id === linkId);
          if (linkIndex === -1) return state;

          const updatedLinks = [...state.links];
          updatedLinks[linkIndex] = {
            ...updatedLinks[linkIndex],
            type,
          };

          return { links: updatedLinks };
        });
      },

      getChildren: (tagId: string): DagTag[] => {
        const state = get();
        const tag = state.tags[tagId];
        if (!tag) return [];
        return tag.children.map((id: string) => state.tags[id]).filter(Boolean) as DagTag[];
      },

      getParents: (tagId: string): DagTag[] => {
        const state = get();
        const tag = state.tags[tagId];
        if (!tag?.parentIds || tag.parentIds.length === 0) return [];
        return tag.parentIds.map((id: string) => state.tags[id]).filter(Boolean) as DagTag[];
      },

      addParent: (tagId: string, parentId: string) => {
        console.log(`[useTagGraph] addParent called: child=${tagId}, parent=${parentId}`);

        set((state: TagGraphState) => {
          const tag = state.tags[tagId];
          const parent = state.tags[parentId];

          if (!tag || !parent) {
            console.error('[useTagGraph] Tag ou parent introuvable:', { tag: !!tag, parent: !!parent });
            return state;
          }

          if (tag.parentIds.includes(parentId)) {
            console.log('[useTagGraph] Déjà parent, aucun changement');
            return state; // Already a parent
          }

          console.log(`[useTagGraph] Ajout de ${parentId} comme parent de ${tagId}`);
          console.log(`[useTagGraph] Avant: tag.parentIds=`, tag.parentIds, 'parent.children=', parent.children);

          const newState = {
            tags: {
              ...state.tags,
              [tagId]: {
                ...tag,
                parentIds: [...tag.parentIds, parentId],
                updatedAt: Date.now(),
              },
              [parentId]: {
                ...parent,
                children: parent.children.includes(tagId)
                  ? parent.children
                  : [...parent.children, tagId],
                updatedAt: Date.now(),
              },
            },
          };

          console.log(`[useTagGraph] Après: parentIds=`, newState.tags[tagId].parentIds, 'children=', newState.tags[parentId].children);

          return newState;
        });
      },

      removeParent: (tagId: string, parentId: string) => {
        set((state: TagGraphState) => {
          const tag = state.tags[tagId];
          const parent = state.tags[parentId];

          if (!tag || !parent) return state;

          return {
            tags: {
              ...state.tags,
              [tagId]: {
                ...tag,
                parentIds: tag.parentIds.filter(id => id !== parentId),
                updatedAt: Date.now(),
              },
              [parentId]: {
                ...parent,
                children: parent.children.filter(id => id !== tagId),
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      getAncestors: (tagId: string): DagTag[] => {
        const state = get();
        const ancestorIds = DagValidation.getAncestors(state.tags, tagId);
        return ancestorIds.map((id: string) => state.tags[id]).filter(Boolean) as DagTag[];
      },

      getDescendants: (tagId: string): DagTag[] => {
        const state = get();
        const descendantIds = DagValidation.getDescendants(state.tags, tagId);
        return descendantIds.map((id: string) => state.tags[id]).filter(Boolean) as DagTag[];
      },

      getChildCount: (tagId: string): number => {
        const state = get();
        const tag = state.tags[tagId];
        if (!tag) return 0;
        return tag.children.length;
      },

      getDescendantCount: (tagId: string): number => {
        const state = get();
        const descendantIds = DagValidation.getDescendants(state.tags, tagId);
        return descendantIds.length;
      },

      getNodeCount: (_tagId: string): number =>
        // Compter les nœuds qui ont ce tag (depuis useNodeTags)
        // Pour maintenant, retourner 0 car on n'a pas accès à useNodeTags ici
        // On va améliorer ça en passant useNodeTags depuis le composant
        0,
      validateDAG: (): { valid: boolean; errors: string[] } => {
        const state = get();
        return DagValidation.validateDAG(state.tags);
      },

      hasCycle: (tagId: string): boolean => {
        const state = get();
        return DagValidation.hasCycle(state.tags, tagId);
      },

      isTagHidden: (tagId: string): boolean => {
        const state = get();
        return state.hiddenTags.includes(tagId);
      },

      toggleTagVisibility: (tagId: string) => {
        set((state: TagGraphState) => {
          const newHiddenTags = state.hiddenTags.includes(tagId)
            ? state.hiddenTags.filter(id => id !== tagId)
            : [...state.hiddenTags, tagId];
          return { hiddenTags: newHiddenTags };
        });
      },

      setTagVisibility: (tagId: string, hidden: boolean) => {
        set((state: TagGraphState) => {
          const isCurrentlyHidden = state.hiddenTags.includes(tagId);
          if (hidden === isCurrentlyHidden) {
            // No change needed
            return state;
          }
          const newHiddenTags = hidden
            ? [...state.hiddenTags, tagId]
            : state.hiddenTags.filter(id => id !== tagId);
          return { hiddenTags: newHiddenTags };
        });
      },

      getHiddenTags: (): string[] => {
        const state = get();
        return [...state.hiddenTags];
      },

      clear: () => {
        set({ tags: {}, links: [], hiddenTags: [] });
      },

      initialize: (tags: Record<string, DagTag>, links: DagLink[]) => {
        set({ tags, links });
      },

      // FR: Charger les données d'un fichier spécifique
      // EN: Load data for a specific file
      loadFileData: (fileId: string) => {
        const storageKey = getStorageKey(fileId);
        const stored = localStorage.getItem(storageKey);

        if (stored) {
          try {
            const data = JSON.parse(stored);
            set({
              tags: data.tags || {},
              links: data.links || [],
              hiddenTags: data.hiddenTags || [],
              currentFileId: fileId,
            });
            console.log(`[TagGraph] Chargé ${Object.keys(data.tags || {}).length} tags pour le fichier ${fileId}`);
          } catch (error) {
            console.error('[TagGraph] Erreur lors du chargement:', error);
            set({ tags: {}, links: [], hiddenTags: [], currentFileId: fileId });
          }
        } else {
          // FR: Pas de données sauvegardées, initialiser vide
          // EN: No saved data, initialize empty
          set({ tags: {}, links: [], hiddenTags: [], currentFileId: fileId });
          console.log(`[TagGraph] Aucune donnée pour le fichier ${fileId}, initialisation vide`);
        }
      },

      // FR: Sauvegarder les données du fichier actuel
      // EN: Save data for current file
      saveFileData: (fileId: string) => {
        const state = get();
        const storageKey = getStorageKey(fileId);
        const data = {
          tags: state.tags,
          links: state.links,
          hiddenTags: state.hiddenTags,
        };

        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
          console.log(`[TagGraph] Sauvegardé ${Object.keys(data.tags).length} tags pour le fichier ${fileId}`);
        } catch (error) {
          console.error('[TagGraph] Erreur lors de la sauvegarde:', error);
        }
      },
    }));
