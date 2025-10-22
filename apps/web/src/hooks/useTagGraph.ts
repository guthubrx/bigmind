/**
 * FR: Hook pour la gestion du graphe DAG de tags avec synchronisation
 * EN: Hook for DAG tag graph management with synchronization
 */

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  DagTag,
  TagLink,
  TagGraph,
  TagRelationType,
  TagDagState,
  TagGraphOptions
} from '../types/dag';
import { eventBus } from '../utils/eventBus';
import { useNodeTags, useNodeTagsStore } from './useNodeTags';

// FR: Store Zustand pour le graphe de tags (sans persistance)
// EN: Zustand store for tag graph (without persistence)
const useTagGraphStore = create<TagDagState>()(
  immer((set, get) => ({
    tags: [], // FR: Tags synchronisés avec la carte active uniquement
    links: [], // FR: Liens synchronisés avec la carte active uniquement
      selectedTagId: null,
      hoveredTagId: null,
      graphView: 'list',
      graphOptions: {
        width: 800,
        height: 600,
        nodeRadius: 20,
        linkDistance: 100,
        chargeStrength: -300,
        showLabels: true,
        showRelationTypes: true,
        enableDrag: true,
        enableZoom: true,
        enablePan: true,
        hideSecondaryRelations: false,
      },

      // FR: Ajouter un tag
      // EN: Add a tag
      addTag: (tag: DagTag) =>
        set((draft) => {
          // Vérifier l'unicité de l'ID
          if (!draft.tags.find((t) => t.id === tag.id)) {
            draft.tags.push(tag);

            // Créer automatiquement les liens pour les parents
            if (tag.parents) {
              tag.parents.forEach((parentId) => {
                const link: TagLink = {
                  source: parentId,
                  target: tag.id,
                  type: 'is-type-of'
                };
                if (!draft.links.find(l =>
                  l.source === link.source && l.target === link.target
                )) {
                  draft.links.push(link);
                }
              });
            }
          }
        }),

      // FR: Mettre à jour un tag
      // EN: Update a tag
      updateTag: (id: string, updates: Partial<DagTag>) =>
        set((draft) => {
          const tagIndex = draft.tags.findIndex((t) => t.id === id);
          if (tagIndex !== -1) {
            draft.tags[tagIndex] = { ...draft.tags[tagIndex], ...updates };
          }
        }),

      // FR: Supprimer un tag
      // EN: Delete a tag
      deleteTag: (id: string) =>
        set((draft) => {
          // Supprimer le tag
          draft.tags = draft.tags.filter((t) => t.id !== id);

          // Supprimer tous les liens associés
          draft.links = draft.links.filter(
            (l) => l.source !== id && l.target !== id
          );

          // Nettoyer les références de parents dans les autres tags
          draft.tags.forEach((tag) => {
            if (tag.parents) {
              tag.parents = tag.parents.filter((p) => p !== id);
            }
          });
        }),

      // FR: Ajouter un lien entre tags
      // EN: Add a link between tags
      addLink: (link: TagLink) =>
        set((draft) => {
          // Vérifier que le lien n'existe pas déjà
          const exists = draft.links.find(
            (l) => l.source === link.source && l.target === link.target
          );

          if (!exists) {
            // Vérifier qu'il n'y a pas de cycle
            if (!get().checkCycle(link.source, link.target)) {
              draft.links.push(link);

              // Mettre à jour les parents du tag cible
              const targetTag = draft.tags.find((t) => t.id === link.target);
              if (targetTag) {
                if (!targetTag.parents) {
                  targetTag.parents = [];
                }
                if (!targetTag.parents.includes(link.source)) {
                  targetTag.parents.push(link.source);
                }
              }
            } else {
              // Cycle détecté: impossible d'ajouter le lien
            }
          }
        }),

      // FR: Supprimer un lien
      // EN: Remove a link
      removeLink: (source: string, target: string) =>
        set((draft) => {
          draft.links = draft.links.filter(
            (l) => !(l.source === source && l.target === target)
          );

          // Mettre à jour les parents du tag cible
          const targetTag = draft.tags.find((t) => t.id === target);
          if (targetTag && targetTag.parents) {
            targetTag.parents = targetTag.parents.filter((p) => p !== source);
          }
        }),

      // FR: Sélectionner un tag
      // EN: Select a tag
      selectTag: (id: string | null) =>
        set((draft) => {
          draft.selectedTagId = id;
        }),

      // FR: Survoler un tag
      // EN: Hover a tag
      hoverTag: (id: string | null) =>
        set((draft) => {
          draft.hoveredTagId = id;
        }),

      // FR: Changer la vue
      // EN: Change view
      setGraphView: (view: 'list' | 'graph') =>
        set((draft) => {
          draft.graphView = view;
        }),

      // FR: Mettre à jour les options du graphe
      // EN: Update graph options
      updateGraphOptions: (options: Partial<TagGraphOptions>) =>
        set((draft) => {
          draft.graphOptions = { ...draft.graphOptions, ...options };
        }),

      // FR: Associer un tag à un nœud MindMap
      // EN: Associate a tag to a MindMap node
      associateTagToNode: (tagId: string, nodeId: string) =>
        set((draft) => {
          const tag = draft.tags.find((t) => t.id === tagId);
          if (tag) {
            if (!tag.nodeIds) {
              tag.nodeIds = [];
            }
            if (!tag.nodeIds.includes(nodeId)) {
              tag.nodeIds.push(nodeId);
            }
          }
        }),

      // FR: Dissocier un tag d'un nœud
      // EN: Dissociate a tag from a node
      dissociateTagFromNode: (tagId: string, nodeId: string) =>
        set((draft) => {
          const tag = draft.tags.find((t) => t.id === tagId);
          if (tag && tag.nodeIds) {
            tag.nodeIds = tag.nodeIds.filter((id) => id !== nodeId);
          }
        }),

      // FR: Importer des tags
      // EN: Import tags
      importTags: (graph: TagGraph) =>
        set((draft) => {
          draft.tags = graph.tags;
          draft.links = graph.links || [];

          // Reconstruire les liens depuis les parents
          draft.tags.forEach((tag) => {
            if (tag.parents) {
              tag.parents.forEach((parentId) => {
                const linkExists = draft.links.find(
                  (l) => l.source === parentId && l.target === tag.id
                );
                if (!linkExists) {
                  draft.links.push({
                    source: parentId,
                    target: tag.id,
                    type: 'is-type-of'
                  });
                }
              });
            }
          });
        }),

      // FR: Exporter les tags
      // EN: Export tags
      exportTags: (): TagGraph => {
        const state = get();
        return {
          tags: state.tags,
          links: state.links
        };
      },

      // FR: Effacer tous les tags
      // EN: Clear all tags
      clearTags: () =>
        set((draft) => {
          draft.tags = [];
          draft.links = [];
          draft.selectedTagId = null;
          draft.hoveredTagId = null;
        }),

      // FR: Vérifier la présence de cycles
      // EN: Check for cycles
      checkCycle: (source: string, target: string): boolean => {
        const state = get();

        // FR: Parcours en profondeur pour détecter les cycles
        // EN: Depth-first search to detect cycles
        const visited = new Set<string>();
        const recStack = new Set<string>();

        const hasCycleDFS = (nodeId: string): boolean => {
          visited.add(nodeId);
          recStack.add(nodeId);

          // Trouver tous les enfants du nœud
          const children = state.links
            .filter((l) => l.source === nodeId)
            .map((l) => l.target);

          // Si on ajoute le nouveau lien, ajouter aussi cette connexion
          if (nodeId === source) {
            children.push(target);
          }

          // eslint-disable-next-line no-restricted-syntax
          for (const child of children) {
            if (!visited.has(child)) {
              if (hasCycleDFS(child)) {
                return true;
              }
            } else if (recStack.has(child)) {
              return true;
            }
          }

          recStack.delete(nodeId);
          return false;
        };

        // Vérifier depuis tous les nœuds non visités
        // eslint-disable-next-line no-restricted-syntax
        for (const tag of state.tags) {
          if (!visited.has(tag.id)) {
            if (hasCycleDFS(tag.id)) {
              return true;
            }
          }
        }

        return false;
      },
    }))
);

/**
 * FR: Hook personnalisé pour utiliser le graphe de tags avec synchronisation
 * EN: Custom hook to use tag graph with synchronization
 */
export function useTagGraph() {
  const state = useTagGraphStore();
  const nodeTags = useNodeTags();

  // FR: Synchronisation avec le bus d'événements
  // EN: Synchronization with event bus
  useEffect(() => {
    console.log('🎯 useTagGraph: Enregistrement des listeners');

    // FR: Écouter les événements de la MindMap
    // EN: Listen to MindMap events
    const unsubNodeTagged = eventBus.on('node:tagged', (event) => {
      console.log('🎯 useTagGraph: Event node:tagged reçu', event);
      if (event.source === 'mindmap') {
        const { nodeId, tagId } = event.payload;

        // FR: Accéder directement au store pour avoir l'état actuel
        // EN: Access store directly to get current state
        const currentState = useTagGraphStore.getState();
        const currentNodeTags = useNodeTagsStore.getState();

        // FR: Créer le tag s'il n'existe pas
        // EN: Create tag if it doesn't exist
        const tagExists = currentState.tags.find(t => t.id === tagId);
        console.log('🔍 Tag existe déjà?', !!tagExists, 'pour tagId:', tagId);

        if (!tagExists) {
          console.log('➕ Création du nouveau tag:', tagId);
          currentState.addTag({
            id: tagId,
            label: tagId.charAt(0).toUpperCase() + tagId.slice(1), // Capitaliser
            visible: true,
            nodeIds: [nodeId]
          });
        } else {
          // Associer le tag existant au nœud
          console.log('🔗 Association du tag existant au nœud');
          currentState.associateTagToNode(tagId, nodeId);
        }

        // Mettre à jour les associations nœud-tag
        currentNodeTags.addNodeTag(nodeId, tagId);
      }
    });

    const unsubNodeUntagged = eventBus.on('node:untagged', (event) => {
      if (event.source === 'mindmap') {
        const { nodeId, tagId } = event.payload;
        // FR: Accéder directement aux stores
        // EN: Access stores directly
        const currentState = useTagGraphStore.getState();
        const currentNodeTags = useNodeTagsStore.getState();
        // Retirer l'association du DAG
        currentState.dissociateTagFromNode(tagId, nodeId);
        currentNodeTags.removeNodeTag(nodeId, tagId);
      }
    });

    // FR: Écouter les événements du DAG
    // EN: Listen to DAG events
    const unsubTagAdded = eventBus.on('tag:added', (event) => {
      if (event.source === 'dag') {
        // La MindMap peut réagir si nécessaire
        console.log('Tag ajouté depuis le DAG:', event.payload);
      }
    });

    const unsubTagRemoved = eventBus.on('tag:removed', (event) => {
      if (event.source === 'dag') {
        const { tagId } = event.payload;
        // Retirer le tag de tous les nœuds
        const currentNodeTags = useNodeTagsStore.getState();
        currentNodeTags.removeTagFromAllNodes(tagId);
      }
    });

    const unsubTagSelected = eventBus.on('tag:selected', (event) => {
      if (event.source === 'dag') {
        const { tagId } = event.payload;
        // Mettre en surbrillance les nœuds associés dans la MindMap
        const currentNodeTags = useNodeTagsStore.getState();
        const nodeIds = currentNodeTags.getTagNodes(tagId);
        eventBus.emit('node:selected', { nodeIds }, 'dag');
      }
    });

    // FR: Demande de rafraîchissement global
    // EN: Global refresh request
    const unsubSyncRefresh = eventBus.on('sync:refresh', () => {
      // Rafraîchir toutes les données
      const currentState = useTagGraphStore.getState();
      const currentNodeTags = useNodeTagsStore.getState();
      const tagUsage = currentNodeTags.getTagUsage();
      tagUsage.forEach(usage => {
        const tag = currentState.tags.find(t => t.id === usage.tagId);
        if (tag) {
          tag.nodeIds = usage.nodeIds;
        }
      });
    });

    return () => {
      unsubNodeTagged();
      unsubNodeUntagged();
      unsubTagAdded();
      unsubTagRemoved();
      unsubTagSelected();
      unsubSyncRefresh();
    };
  }, []); // FR: Pas de dépendances pour éviter les ré-enregistrements
  // EN: No dependencies to avoid re-registrations

  // FR: Obtenir les ancêtres d'un tag
  // EN: Get ancestors of a tag
  const getAncestors = (tagId: string): string[] => {
    const ancestors: string[] = [];
    const visited = new Set<string>();

    const findAncestors = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const parents = state.links
        .filter((l) => l.target === id)
        .map((l) => l.source);

      parents.forEach((parentId) => {
        ancestors.push(parentId);
        findAncestors(parentId);
      });
    };

    findAncestors(tagId);
    return [...new Set(ancestors)];
  };

  // FR: Obtenir les descendants d'un tag
  // EN: Get descendants of a tag
  const getDescendants = (tagId: string): string[] => {
    const descendants: string[] = [];
    const visited = new Set<string>();

    const findDescendants = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const children = state.links
        .filter((l) => l.source === id)
        .map((l) => l.target);

      children.forEach((childId) => {
        descendants.push(childId);
        findDescendants(childId);
      });
    };

    findDescendants(tagId);
    return [...new Set(descendants)];
  };

  // FR: Obtenir les tags racines (sans parents)
  // EN: Get root tags (without parents)
  const getRootTags = (): DagTag[] => {
    return state.tags.filter((tag) => !tag.parents || tag.parents.length === 0);
  };

  // FR: Obtenir les tags feuilles (sans enfants)
  // EN: Get leaf tags (without children)
  const getLeafTags = (): DagTag[] => {
    const hasChildren = new Set(state.links.map((l) => l.source));
    return state.tags.filter((tag) => !hasChildren.has(tag.id));
  };

  // FR: Créer une relation entre deux tags
  // EN: Create a relationship between two tags
  const createRelation = (
    sourceId: string,
    targetId: string,
    type: TagRelationType = 'is-type-of'
  ) => {
    state.addLink({ source: sourceId, target: targetId, type });
  };

  // FR: Méthodes de synchronisation enrichies
  // EN: Enhanced synchronization methods
  const addTagWithSync = (tag: DagTag) => {
    state.addTag(tag);
    eventBus.emit('tag:added', { tag }, 'dag');
  };

  const deleteTagWithSync = (tagId: string) => {
    state.deleteTag(tagId);
    nodeTags.removeTagFromAllNodes(tagId);
    eventBus.emit('tag:removed', { tagId }, 'dag');
  };

  const selectTagWithSync = (tagId: string | null) => {
    state.selectTag(tagId);
    if (tagId) {
      eventBus.emit('tag:selected', { tagId }, 'dag');
    }
  };

  const getTagGraphData = () => {
    const usage: Record<string, string[]> = {};
    nodeTags.getTagUsage().forEach(u => {
      usage[u.tagId] = u.nodeIds;
    });

    return {
      tags: state.tags,
      links: state.links,
      usage
    };
  };

  // FR: Synchroniser les tags depuis la carte mentale
  // EN: Sync tags from mindmap
  const syncFromMindMap = (mindMap: any) => {
    // Effacer tous les tags existants
    state.clearTags();
    nodeTags.reset();

    if (!mindMap || !mindMap.nodes) return;

    // Parcourir tous les nœuds et collecter les tags uniques
    const uniqueTags = new Set<string>();
    Object.values(mindMap.nodes).forEach((node: any) => {
      if (node.tags && Array.isArray(node.tags)) {
        node.tags.forEach((tag: string) => {
          uniqueTags.add(tag);
        });
      }
    });

    // Créer un tag DAG pour chaque tag unique
    uniqueTags.forEach((tagId) => {
      state.addTag({
        id: tagId,
        label: tagId.charAt(0).toUpperCase() + tagId.slice(1),
        visible: true,
        nodeIds: []
      });
    });

    // Associer les tags aux nœuds
    Object.values(mindMap.nodes).forEach((node: any) => {
      if (node.tags && Array.isArray(node.tags)) {
        node.tags.forEach((tagId: string) => {
          state.associateTagToNode(tagId, node.id);
          nodeTags.addNodeTag(node.id, tagId);
        });
      }
    });
  };

  // FR: Vider tous les tags (pour quand on ferme la carte)
  // EN: Clear all tags (for when closing the map)
  const clearAllTags = () => {
    state.clearTags();
    nodeTags.reset();
  };

  return {
    ...state,
    getAncestors,
    getDescendants,
    getRootTags,
    getLeafTags,
    createRelation,
    // Méthodes avec synchronisation
    addTag: addTagWithSync,
    deleteTag: deleteTagWithSync,
    selectTag: selectTagWithSync,
    getTagGraphData,
    syncFromMindMap,
    clearAllTags,
    // Accès aux associations nœud-tag
    getNodeTags: nodeTags.getNodeTags,
    getTagNodes: nodeTags.getTagNodes,
    addNodeTag: nodeTags.addNodeTag,
    removeNodeTag: nodeTags.removeNodeTag,
  };
}

export default useTagGraph;