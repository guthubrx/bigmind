/**
 * FR: Store Zustand pour les associations nœud-tag
 * EN: Zustand store for node-tag associations (SINGLE SOURCE OF TRUTH)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NodeTagsState {
  // FR: Map nœud -> tags
  // EN: Node to tags mapping
  nodeTagMap: Record<string, Set<string>>;

  // FR: Map tag -> nœuds
  // EN: Tag to nodes mapping
  tagNodeMap: Record<string, Set<string>>;

  // FR: Actions
  // EN: Actions
  tagNode(nodeId: string, tagId: string): void;
  untagNode(nodeId: string, tagId: string): void;
  getNodeTags(nodeId: string): string[];
  getTagNodes(tagId: string): string[];
  removeNodeCompletely(nodeId: string): void;
  removeTagCompletely(tagId: string): void;
  clear(): void;
  initialize(nodeTagMap: Record<string, string[]>, tagNodeMap: Record<string, string[]>): void;
}

const STORAGE_KEY = 'bigmind-node-tags';

export const useNodeTags = create<NodeTagsState>()(
  persist(
    (set, get) => ({
      nodeTagMap: {},
      tagNodeMap: {},

      tagNode: (nodeId: string, tagId: string) => {
        set(state => {
          const newNodeTagMap = { ...state.nodeTagMap };
          const newTagNodeMap = { ...state.tagNodeMap };

          // Ensure sets exist
          if (!newNodeTagMap[nodeId]) {
            newNodeTagMap[nodeId] = new Set();
          }
          if (!newTagNodeMap[tagId]) {
            newTagNodeMap[tagId] = new Set();
          }

          // Add association
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

      getNodeTags: (nodeId: string): string[] => {
        const state = get();
        const tags = state.nodeTagMap[nodeId];
        return tags ? Array.from(tags) : [];
      },

      getTagNodes: (tagId: string): string[] => {
        const state = get();
        const nodes = state.tagNodeMap[tagId];
        return nodes ? Array.from(nodes) : [];
      },

      removeNodeCompletely: (nodeId: string) => {
        set(state => {
          const newNodeTagMap = { ...state.nodeTagMap };
          const newTagNodeMap = { ...state.tagNodeMap };

          // Get all tags for this node
          const tags = state.nodeTagMap[nodeId] || new Set();
          tags.forEach(tagId => {
            if (newTagNodeMap[tagId]) {
              newTagNodeMap[tagId].delete(nodeId);
            }
          });

          // Remove node entry
          delete newNodeTagMap[nodeId];

          return {
            nodeTagMap: newNodeTagMap,
            tagNodeMap: newTagNodeMap,
          };
        });
      },

      removeTagCompletely: (tagId: string) => {
        set(state => {
          const newNodeTagMap = { ...state.nodeTagMap };
          const newTagNodeMap = { ...state.tagNodeMap };

          // Get all nodes with this tag
          const nodes = state.tagNodeMap[tagId] || new Set();
          nodes.forEach(nodeId => {
            if (newNodeTagMap[nodeId]) {
              newNodeTagMap[nodeId].delete(tagId);
            }
          });

          // Remove tag entry
          delete newTagNodeMap[tagId];

          return {
            nodeTagMap: newNodeTagMap,
            tagNodeMap: newTagNodeMap,
          };
        });
      },

      clear: () => {
        set({ nodeTagMap: {}, tagNodeMap: {} });
      },

      initialize: (nodeTagMap: Record<string, string[]>, tagNodeMap: Record<string, string[]>) => {
        const convertedNodeTagMap: Record<string, Set<string>> = {};
        const convertedTagNodeMap: Record<string, Set<string>> = {};

        Object.entries(nodeTagMap).forEach(([nodeId, tags]) => {
          convertedNodeTagMap[nodeId] = new Set(tags);
        });

        Object.entries(tagNodeMap).forEach(([tagId, nodes]) => {
          convertedTagNodeMap[tagId] = new Set(nodes);
        });

        set({
          nodeTagMap: convertedNodeTagMap,
          tagNodeMap: convertedTagNodeMap,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      serialize: state =>
        JSON.stringify({
          state: {
            nodeTagMap: Object.fromEntries(
              Object.entries(state.state.nodeTagMap).map(([key, value]: [string, Set<string>]) => [
                key,
                Array.from(value),
              ])
            ),
            tagNodeMap: Object.fromEntries(
              Object.entries(state.state.tagNodeMap).map(([key, value]: [string, Set<string>]) => [
                key,
                Array.from(value),
              ])
            ),
          },
          version: state.version,
        }),
      deserialize: (str: string) => {
        const data = JSON.parse(str) as {
          state: { nodeTagMap: Record<string, string[]>; tagNodeMap: Record<string, string[]> };
          version: number;
        };
        const { state } = data;

        return {
          state: {
            nodeTagMap: Object.fromEntries(
              Object.entries(state.nodeTagMap).map(([key, value]) => [key, new Set(value)])
            ),
            tagNodeMap: Object.fromEntries(
              Object.entries(state.tagNodeMap).map(([key, value]) => [key, new Set(value)])
            ),
          },
          version: data.version,
        };
      },
    }
  )
);
