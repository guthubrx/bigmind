/**
 * FR: Hook pour gérer les associations entre nœuds et tags
 * EN: Hook to manage associations between nodes and tags
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NodeTag, TagUsage } from '../types/nodeTag';
import { eventBus } from '../utils/eventBus';

interface NodeTagsStore {
  // FR: Associations nœud-tag
  // EN: Node-tag associations
  nodeTags: NodeTag[];

  // FR: Index pour accès rapide
  // EN: Index for quick access
  nodeIndex: Map<string, Set<string>>; // nodeId -> Set<tagId>
  tagIndex: Map<string, Set<string>>;  // tagId -> Set<nodeId>

  // FR: Actions CRUD
  // EN: CRUD actions
  addNodeTag: (nodeId: string, tagId: string) => void;
  removeNodeTag: (nodeId: string, tagId: string) => void;
  removeAllNodeTags: (nodeId: string) => void;
  removeTagFromAllNodes: (tagId: string) => void;

  // FR: Requêtes
  // EN: Queries
  getNodeTags: (nodeId: string) => string[];
  getTagNodes: (tagId: string) => string[];
  getTagUsage: () => TagUsage[];
  hasTag: (nodeId: string, tagId: string) => boolean;

  // FR: Synchronisation
  // EN: Synchronization
  syncFromMindMap: (nodes: any[]) => void;
  syncFromDAG: (tags: any[]) => void;

  // FR: Réinitialisation
  // EN: Reset
  reset: () => void;
}

export const useNodeTagsStore = create<NodeTagsStore>()(
  persist(
    (set, get) => ({
      nodeTags: [],
      nodeIndex: new Map(),
      tagIndex: new Map(),

      addNodeTag: (nodeId: string, tagId: string) => {
        const state = get();

        // Vérifier si l'association existe déjà
        if (state.hasTag(nodeId, tagId)) return;

        const newNodeTag: NodeTag = {
          nodeId,
          tagId,
          appliedAt: Date.now()
        };

        set((s) => {
          const newNodeTags = [...s.nodeTags, newNodeTag];

          // Mettre à jour les index
          const newNodeIndex = new Map(s.nodeIndex);
          if (!newNodeIndex.has(nodeId)) {
            newNodeIndex.set(nodeId, new Set());
          }
          newNodeIndex.get(nodeId)!.add(tagId);

          const newTagIndex = new Map(s.tagIndex);
          if (!newTagIndex.has(tagId)) {
            newTagIndex.set(tagId, new Set());
          }
          newTagIndex.get(tagId)!.add(nodeId);

          // Émettre l'événement
          eventBus.emit('node:tagged', { nodeId, tagId }, 'system');

          return {
            nodeTags: newNodeTags,
            nodeIndex: newNodeIndex,
            tagIndex: newTagIndex
          };
        });
      },

      removeNodeTag: (nodeId: string, tagId: string) => {
        set((state) => {
          const newNodeTags = state.nodeTags.filter(
            nt => !(nt.nodeId === nodeId && nt.tagId === tagId)
          );

          // Mettre à jour les index
          const newNodeIndex = new Map(state.nodeIndex);
          const nodeTags = newNodeIndex.get(nodeId);
          if (nodeTags) {
            nodeTags.delete(tagId);
            if (nodeTags.size === 0) {
              newNodeIndex.delete(nodeId);
            }
          }

          const newTagIndex = new Map(state.tagIndex);
          const tagNodes = newTagIndex.get(tagId);
          if (tagNodes) {
            tagNodes.delete(nodeId);
            if (tagNodes.size === 0) {
              newTagIndex.delete(tagId);
            }
          }

          // Émettre l'événement
          eventBus.emit('node:untagged', { nodeId, tagId }, 'system');

          return {
            nodeTags: newNodeTags,
            nodeIndex: newNodeIndex,
            tagIndex: newTagIndex
          };
        });
      },

      removeAllNodeTags: (nodeId: string) => {
        const state = get();
        const tagIds = state.getNodeTags(nodeId);

        tagIds.forEach(tagId => {
          state.removeNodeTag(nodeId, tagId);
        });
      },

      removeTagFromAllNodes: (tagId: string) => {
        const state = get();
        const nodeIds = state.getTagNodes(tagId);

        nodeIds.forEach(nodeId => {
          state.removeNodeTag(nodeId, tagId);
        });
      },

      getNodeTags: (nodeId: string) => {
        const state = get();
        return Array.from(state.nodeIndex.get(nodeId) || []);
      },

      getTagNodes: (tagId: string) => {
        const state = get();
        return Array.from(state.tagIndex.get(tagId) || []);
      },

      getTagUsage: () => {
        const state = get();
        const usage: TagUsage[] = [];

        state.tagIndex.forEach((nodeIds, tagId) => {
          usage.push({
            tagId,
            nodeIds: Array.from(nodeIds),
            count: nodeIds.size
          });
        });

        return usage;
      },

      hasTag: (nodeId: string, tagId: string) => {
        const state = get();
        return state.nodeIndex.get(nodeId)?.has(tagId) || false;
      },

      syncFromMindMap: (nodes: any[]) => {
        // FR: Synchroniser depuis les nœuds de la MindMap
        // EN: Sync from MindMap nodes
        nodes.forEach(node => {
          if (node.tags && Array.isArray(node.tags)) {
            node.tags.forEach((tagId: string) => {
              get().addNodeTag(node.id, tagId);
            });
          }
        });
      },

      syncFromDAG: (tags: any[]) => {
        // FR: Synchroniser depuis les tags du DAG
        // EN: Sync from DAG tags
        tags.forEach(tag => {
          if (tag.nodeIds && Array.isArray(tag.nodeIds)) {
            tag.nodeIds.forEach((nodeId: string) => {
              get().addNodeTag(nodeId, tag.id);
            });
          }
        });
      },

      reset: () => {
        set({
          nodeTags: [],
          nodeIndex: new Map(),
          tagIndex: new Map()
        });
      }
    }),
    {
      name: 'node-tags-storage',
      partialize: (state) => ({
        nodeTags: state.nodeTags
      }),
      onRehydrateStorage: () => (state) => {
        // Reconstruire les index après réhydratation
        if (state) {
          const nodeIndex = new Map<string, Set<string>>();
          const tagIndex = new Map<string, Set<string>>();

          state.nodeTags.forEach(nt => {
            if (!nodeIndex.has(nt.nodeId)) {
              nodeIndex.set(nt.nodeId, new Set());
            }
            nodeIndex.get(nt.nodeId)!.add(nt.tagId);

            if (!tagIndex.has(nt.tagId)) {
              tagIndex.set(nt.tagId, new Set());
            }
            tagIndex.get(nt.tagId)!.add(nt.nodeId);
          });

          state.nodeIndex = nodeIndex;
          state.tagIndex = tagIndex;
        }
      }
    }
  )
);

// Hook personnalisé
export function useNodeTags() {
  const store = useNodeTagsStore();
  return {
    nodeTags: store.nodeTags,
    addNodeTag: store.addNodeTag,
    removeNodeTag: store.removeNodeTag,
    removeAllNodeTags: store.removeAllNodeTags,
    removeTagFromAllNodes: store.removeTagFromAllNodes,
    getNodeTags: store.getNodeTags,
    getTagNodes: store.getTagNodes,
    getTagUsage: store.getTagUsage,
    hasTag: store.hasTag,
    syncFromMindMap: store.syncFromMindMap,
    syncFromDAG: store.syncFromDAG,
    reset: store.reset
  };
}