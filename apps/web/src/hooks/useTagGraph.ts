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

  // FR: Actions de gestion des tags
  // EN: Tag management actions
  addTag(tag: DagTag): void;
  removeTag(tagId: string): void;
  updateTag(tagId: string, updates: Partial<DagTag>): void;
  getTag(tagId: string): DagTag | undefined;
  getAllTags(): DagTag[];

  // FR: Actions de gestion des liens
  // EN: Link management actions
  addLink(link: DagLink): void;
  removeLink(linkId: string): void;
  getLink(linkId: string): DagLink | undefined;
  getAllLinks(): DagLink[];

  // FR: Requêtes sur la hiérarchie
  // EN: Hierarchy queries
  getChildren(tagId: string): DagTag[];
  getParent(tagId: string): DagTag | undefined;
  getAncestors(tagId: string): DagTag[];
  getDescendants(tagId: string): DagTag[];

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

      addTag: (tag: DagTag) => {
        set((state: TagGraphState) => {
          const newTag: DagTag = {
            ...tag,
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

          // FR: Nettoyer les références
          // EN: Clean up references
          const cleaned = { ...remaining };
          Object.values(cleaned).forEach((tag: DagTag) => {
            if (tag.parentId === tagId) {
              tag.parentId = undefined;
            }
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

      getParent: (tagId: string): DagTag | undefined => {
        const state = get();
        const tag = state.tags[tagId];
        if (!tag?.parentId) return undefined;
        return state.tags[tag.parentId];
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

      validateDAG: (): { valid: boolean; errors: string[] } => {
        const state = get();
        return DagValidation.validateDAG(state.tags);
      },

      hasCycle: (tagId: string): boolean => {
        const state = get();
        return DagValidation.hasCycle(state.tags, tagId);
      },

      clear: () => {
        set({ tags: {}, links: [] });
      },

      initialize: (tags: Record<string, DagTag>, links: DagLink[]) => {
        set({ tags, links });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);
