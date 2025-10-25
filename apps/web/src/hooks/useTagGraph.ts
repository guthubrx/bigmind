/**
 * FR: Store Zustand pour le graphe de tags (DAG)
 * EN: Zustand store for tags graph (DAG)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DagTag, DagLink, DagValidation } from '../types/dag';

interface TagGraphState {
  // FR: Données du DAG
  // EN: DAG data
  tags: Record<string, DagTag>;
  links: DagLink[];
  hiddenTags: string[];

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
}

const STORAGE_KEY = 'bigmind-tags';

type SetState = (
  partial:
    | TagGraphState
    | Partial<TagGraphState>
    | ((state: TagGraphState) => TagGraphState | Partial<TagGraphState>),
  replace?: boolean
) => void;

type GetState = () => TagGraphState;

export const useTagGraph = create<TagGraphState>()(
  persist(
    (set: SetState, get: GetState) => ({
      tags: {},
      links: [] as DagLink[],
      hiddenTags: [],

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
        set((state: TagGraphState) => {
          const tag = state.tags[tagId];
          const parent = state.tags[parentId];

          if (!tag || !parent) return state;
          if (tag.parentIds.includes(parentId)) return state; // Already a parent

          return {
            tags: {
              ...state.tags,
              [tagId]: {
                ...tag,
                parentIds: [...tag.parentIds, parentId],
                updatedAt: Date.now(),
              },
              [parentId]: {
                ...parent,
                children: parent.children.includes(tagId) ? parent.children : [...parent.children, tagId],
                updatedAt: Date.now(),
              },
            },
          };
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
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      migrate: (persistedState: any, version: number) => {
        let migratedState = persistedState;
        let currentVersion = version;

        if (currentVersion === 1) {
          // Migrate from version 1 to 2: add hiddenTags if missing
          migratedState.hiddenTags = migratedState.hiddenTags || [];
          currentVersion = 2;
        }
        if (currentVersion === 2) {
          // Migrate from version 2 to 3: convert parentId to parentIds array
          const tags = migratedState.tags || {};
          Object.values(tags).forEach((tag: any) => {
            if (tag.parentId !== undefined && tag.parentId !== null) {
              tag.parentIds = [tag.parentId];
              delete tag.parentId;
            } else if (!tag.parentIds) {
              tag.parentIds = [];
            }
          });
          migratedState.tags = tags;
          currentVersion = 3;
        }
        return migratedState;
      },
    }
  )
);
