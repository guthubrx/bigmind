/**
 * FR: Store Zustand unifié pour TOUS les tags (volatile, en mémoire uniquement)
 * EN: Unified Zustand store for ALL tags (volatile, in-memory only)
 *
 * Ce store contient :
 * - Tags (label, couleur, etc.)
 * - Filiations (parentIds, children, links)
 * - Associations nœud→tag
 * - Visibilité des tags
 *
 * IMPORTANT: Ce store est VOLATILE - pas de persistance localStorage
 * La persistance se fait uniquement via bigmind.json
 */

import { create } from 'zustand';
import { DagTag, DagLink, RelationType } from '../types/dag';

interface TagStoreState {
  // FR: Catalogue des tags
  // EN: Tags catalog
  tags: Record<string, DagTag>;

  // FR: Relations entre tags (filiations)
  // EN: Relations between tags (lineage)
  links: DagLink[];

  // FR: Associations nœud → tags
  // EN: Node to tags mapping
  nodeTagMap: Record<string, Set<string>>;

  // FR: Associations tag → nœuds
  // EN: Tag to nodes mapping
  tagNodeMap: Record<string, Set<string>>;

  // FR: Tags masqués
  // EN: Hidden tags
  hiddenTags: string[];

  // === Actions sur les tags ===

  addTag(tag: DagTag): void;
  removeTag(tagId: string): void;
  updateTag(tagId: string, updates: Partial<DagTag>): void;
  getTag(tagId: string): DagTag | undefined;
  getAllTags(): DagTag[];

  // === Actions sur les filiations ===

  addParent(tagId: string, parentId: string): void;
  removeParent(tagId: string, parentId: string): void;
  getChildren(tagId: string): DagTag[];
  getParents(tagId: string): DagTag[];

  // === Actions sur les liens ===

  addLink(link: DagLink): void;
  removeLink(linkId: string): void;
  getLinksBetween(sourceId: string, targetId: string): DagLink[];
  createRelation(sourceId: string, targetId: string, type: RelationType): void;

  // === Actions sur les associations nœud↔tag ===

  tagNode(nodeId: string, tagId: string): void;
  untagNode(nodeId: string, tagId: string): void;
  getNodeTags(nodeId: string): string[];
  getTagNodes(tagId: string): string[];

  // === Actions sur la visibilité ===

  isTagHidden(tagId: string): boolean;
  toggleTagVisibility(tagId: string): void;
  setTagVisibility(tagId: string, hidden: boolean): void;

  // === Utilitaires ===

  clear(): void;
  initialize(data: {
    tags?: Record<string, DagTag>;
    links?: DagLink[];
    nodeTags?: Record<string, string[]>;
    tagNodes?: Record<string, string[]>;
    hiddenTags?: string[];
  }): void;
  export(): {
    tags: Record<string, DagTag>;
    links: DagLink[];
    nodeTags: Record<string, string[]>;
    tagNodes: Record<string, string[]>;
    hiddenTags: string[];
  };
}

export const useTagStore = create<TagStoreState>((set, get) => ({
  tags: {},
  links: [],
  nodeTagMap: {},
  tagNodeMap: {},
  hiddenTags: [],

  // === Tags ===

  addTag: (tag: DagTag) => {
    set(state => ({
      tags: {
        ...state.tags,
        [tag.id]: {
          ...tag,
          parentIds: tag.parentIds || [],
          children: tag.children || [],
          relations: tag.relations || [],
          createdAt: tag.createdAt || Date.now(),
          updatedAt: Date.now(),
        },
      },
    }));
  },

  removeTag: (tagId: string) => {
    set(state => {
      const { [tagId]: removed, ...remainingTags } = state.tags;
      if (!removed) return state;

      // Nettoyer les références dans les autres tags
      const cleanedTags = { ...remainingTags };
      Object.values(cleanedTags).forEach(tag => {
        tag.parentIds = tag.parentIds.filter(id => id !== tagId);
        tag.children = tag.children.filter(id => id !== tagId);
      });

      // Nettoyer les liens
      const cleanedLinks = state.links.filter(
        link => link.sourceId !== tagId && link.targetId !== tagId
      );

      // Nettoyer les associations nœud↔tag
      const cleanedNodeTagMap = { ...state.nodeTagMap };
      Object.keys(cleanedNodeTagMap).forEach(nodeId => {
        cleanedNodeTagMap[nodeId].delete(tagId);
      });

      // Supprimer le tag de tagNodeMap
      const cleanedTagNodeMap = { ...state.tagNodeMap };
      delete cleanedTagNodeMap[tagId];

      return {
        tags: cleanedTags,
        links: cleanedLinks,
        nodeTagMap: cleanedNodeTagMap,
        tagNodeMap: cleanedTagNodeMap,
      };
    });
  },

  updateTag: (tagId: string, updates: Partial<DagTag>) => {
    set(state => {
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

  getTag: (tagId: string) => get().tags[tagId],

  getAllTags: () => Object.values(get().tags),

  // === Filiations ===

  addParent: (tagId: string, parentId: string) => {
    set(state => {
      const tag = state.tags[tagId];
      const parent = state.tags[parentId];

      if (!tag || !parent || tag.parentIds.includes(parentId)) return state;

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
            children: parent.children.includes(tagId)
              ? parent.children
              : [...parent.children, tagId],
            updatedAt: Date.now(),
          },
        },
      };
    });
  },

  removeParent: (tagId: string, parentId: string) => {
    set(state => {
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

  getChildren: (tagId: string) => {
    const state = get();
    const tag = state.tags[tagId];
    if (!tag) return [];
    return tag.children.map(id => state.tags[id]).filter(Boolean);
  },

  getParents: (tagId: string) => {
    const state = get();
    const tag = state.tags[tagId];
    if (!tag) return [];
    return tag.parentIds.map(id => state.tags[id]).filter(Boolean);
  },

  // === Liens ===

  addLink: (link: DagLink) => {
    set(state => {
      const sourceExists = state.tags[link.sourceId];
      const targetExists = state.tags[link.targetId];

      if (!sourceExists || !targetExists) return state;

      return {
        links: [...state.links, link],
      };
    });
  },

  removeLink: (linkId: string) => {
    set(state => ({
      links: state.links.filter(link => link.id !== linkId),
    }));
  },

  getLinksBetween: (sourceId: string, targetId: string) =>
    get().links.filter(link => link.sourceId === sourceId && link.targetId === targetId),

  createRelation: (sourceId: string, targetId: string, type: RelationType) => {
    const state = get();
    if (!state.tags[sourceId] || !state.tags[targetId]) return;

    const existingLinks = state.links.filter(
      link => link.sourceId === sourceId && link.targetId === targetId
    );
    if (existingLinks.length > 0) return;

    const newLink: DagLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId,
      targetId,
      type,
    };

    set({ links: [...state.links, newLink] });
  },

  // === Associations nœud↔tag ===

  tagNode: (nodeId: string, tagId: string) => {
    set(state => {
      const newNodeTagMap = { ...state.nodeTagMap };
      const newTagNodeMap = { ...state.tagNodeMap };

      if (!newNodeTagMap[nodeId]) {
        newNodeTagMap[nodeId] = new Set();
      }
      if (!newTagNodeMap[tagId]) {
        newTagNodeMap[tagId] = new Set();
      }

      newNodeTagMap[nodeId].add(tagId);
      newTagNodeMap[tagId].add(nodeId);

      return {
        nodeTagMap: newNodeTagMap,
        tagNodeMap: newTagNodeMap,
      };
    });
  },

  untagNode: (nodeId: string, tagId: string) => {
    set(state => {
      const newNodeTagMap = { ...state.nodeTagMap };
      const newTagNodeMap = { ...state.tagNodeMap };

      if (newNodeTagMap[nodeId]) {
        newNodeTagMap[nodeId].delete(tagId);
      }
      if (newTagNodeMap[tagId]) {
        newTagNodeMap[tagId].delete(nodeId);
      }

      return {
        nodeTagMap: newNodeTagMap,
        tagNodeMap: newTagNodeMap,
      };
    });
  },

  getNodeTags: (nodeId: string) => {
    const state = get();
    const tags = state.nodeTagMap[nodeId];
    return tags ? Array.from(tags) : [];
  },

  getTagNodes: (tagId: string) => {
    const state = get();
    const nodes = state.tagNodeMap[tagId];
    return nodes ? Array.from(nodes) : [];
  },

  // === Visibilité ===

  isTagHidden: (tagId: string) => get().hiddenTags.includes(tagId),

  toggleTagVisibility: (tagId: string) => {
    set(state => {
      const isHidden = state.hiddenTags.includes(tagId);
      return {
        hiddenTags: isHidden
          ? state.hiddenTags.filter(id => id !== tagId)
          : [...state.hiddenTags, tagId],
      };
    });
  },

  setTagVisibility: (tagId: string, hidden: boolean) => {
    set(state => {
      const isHidden = state.hiddenTags.includes(tagId);
      if (hidden === isHidden) return state;

      return {
        hiddenTags: hidden
          ? [...state.hiddenTags, tagId]
          : state.hiddenTags.filter(id => id !== tagId),
      };
    });
  },

  // === Utilitaires ===

  clear: () => {
    set({
      tags: {},
      links: [],
      nodeTagMap: {},
      tagNodeMap: {},
      hiddenTags: [],
    });
  },

  initialize: data => {
    set({
      tags: data.tags || {},
      links: data.links || [],
      nodeTagMap: Object.fromEntries(
        Object.entries(data.nodeTags || {}).map(([nodeId, tagIds]) => [nodeId, new Set(tagIds)])
      ),
      tagNodeMap: Object.fromEntries(
        Object.entries(data.tagNodes || {}).map(([tagId, nodeIds]) => [tagId, new Set(nodeIds)])
      ),
      hiddenTags: data.hiddenTags || [],
    });
  },

  export: () => {
    const state = get();
    return {
      tags: state.tags,
      links: state.links,
      nodeTags: Object.fromEntries(
        Object.entries(state.nodeTagMap).map(([nodeId, tagSet]) => [nodeId, Array.from(tagSet)])
      ),
      tagNodes: Object.fromEntries(
        Object.entries(state.tagNodeMap).map(([tagId, nodeSet]) => [tagId, Array.from(nodeSet)])
      ),
      hiddenTags: state.hiddenTags,
    };
  },
}));
