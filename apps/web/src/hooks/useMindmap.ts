/**
 * FR: Hook simplifié pour gérer l'état de la carte mentale (version développement)
 * EN: Simplified hook to manage mind map state (development version)
 */

import { useState, useCallback } from 'react';
import { useAppSettings } from './useAppSettings';
import { getNodeColor } from '../utils/nodeColors';
import { pluginSystem } from '../utils/pluginManager';

// FR: Types simplifiés pour le développement
// EN: Simplified types for development
export type NodeID = string;

export interface MindNode {
  id: NodeID;
  parentId: NodeID | null;
  title: string;
  notes?: string;
  collapsed?: boolean;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  };
  children: NodeID[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface MindMap {
  id: string;
  rootId: NodeID;
  nodes: Record<NodeID, MindNode>;
  meta: {
    name: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
  };
  // FR: Palettes de couleurs personnalisées (optionnelles)
  // EN: Custom color palettes (optional)
  nodePaletteId?: string;
  tagPaletteId?: string;
}

export interface SelectionState {
  selectedNodes: NodeID[];
  primaryNode: NodeID | null;
  mode: 'single' | 'multiple';
}

// FR: Factory pour créer des nœuds
// EN: Factory to create nodes
const createNode = (title: string, parentId: NodeID | null = null): MindNode => ({
  id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  parentId,
  title,
  children: [],
  collapsed: false,
  x: 0,
  y: 0,
  width: 200,
  height: 40,
});

// FR: Factory pour créer une carte vide
// EN: Factory to create empty map
const createEmptyMindMap = (name: string = 'Nouvelle carte'): MindMap => {
  const rootNode = createNode('Racine');

  return {
    id: `map_${Date.now()}`,
    rootId: rootNode.id,
    nodes: {
      [rootNode.id]: rootNode,
    },
    meta: {
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locale: 'fr',
    },
  };
};

// FR: Hook personnalisé pour utiliser le store
// EN: Custom hook to use the store
export const useMindmap = () => {
  const getCurrentTheme = useAppSettings(s => s.getCurrentTheme);
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [selection, setSelection] = useState<SelectionState>({
    selectedNodes: [],
    primaryNode: null,
    mode: 'single',
  });
  const [editMode, setEditMode] = useState<{
    nodeId: NodeID | null;
    field: 'title' | 'notes' | null;
  }>({
    nodeId: null,
    field: null,
  });

  // FR: Actions avec useCallback pour éviter les re-renders
  // EN: Actions with useCallback to avoid re-renders
  const actions = useCallback(
    () => ({
      // FR: Initialiser une nouvelle carte
      // EN: Initialize a new map
      createNewMap: (name = 'Nouvelle carte') => {
        setMindMap(createEmptyMindMap(name));
        setSelection({
          selectedNodes: [],
          primaryNode: null,
          mode: 'single',
        });
      },

      // FR: Charger une carte existante
      // EN: Load an existing map
      loadMap: (map: MindMap) => {
        setMindMap(map);
        setSelection({
          selectedNodes: [],
          primaryNode: null,
          mode: 'single',
        });
      },

      // FR: Ajouter un nœud
      // EN: Add a node
      addNode: (parentId: NodeID | null, title: string, position = { x: 0, y: 0 }) => {
        setMindMap(prev => {
          if (!prev) return prev;

          const newNode = createNode(title, parentId);
          newNode.x = position.x;
          newNode.y = position.y;

          const newNodes = { ...prev.nodes, [newNode.id]: newNode };

          if (parentId) {
            const parent = newNodes[parentId];
            if (parent) {
              parent.children.push(newNode.id);
            }
          }

          // FR: Appliquer la couleur automatique basée sur le thème
          // EN: Apply automatic color based on theme
          const theme = getCurrentTheme();
          const autoColor = getNodeColor(newNode.id, newNodes, prev.rootId, theme);
          newNode.style = {
            ...newNode.style,
            backgroundColor: autoColor,
          };

          // FR: Déclencher l'événement pour les plugins
          // EN: Trigger event for plugins
          pluginSystem.hookSystem
            .applyFilters('mindmap.nodeCreated', {
              nodeId: newNode.id,
              parentId,
              title,
              node: newNode,
            })
            .catch(error => {
              console.error('[useMindmap] Error triggering nodeCreated hook:', error);
            });

          return {
            ...prev,
            nodes: newNodes,
          };
        });
      },

      // FR: Supprimer un nœud
      // EN: Delete a node
      deleteNode: (nodeId: NodeID) => {
        setMindMap(prev => {
          if (!prev) return prev;

          const node = prev.nodes[nodeId];
          if (!node) return prev;

          const newNodes = { ...prev.nodes };
          delete newNodes[nodeId];

          // FR: Retirer l'enfant du parent
          // EN: Remove child from parent
          if (node.parentId) {
            const parent = newNodes[node.parentId];
            if (parent) {
              parent.children = parent.children.filter(id => id !== nodeId);
            }
          }

          // FR: Déclencher l'événement pour les plugins
          // EN: Trigger event for plugins
          pluginSystem.hookSystem
            .applyFilters('mindmap.nodeDeleted', {
              nodeId,
              node,
            })
            .catch(error => {
              console.error('[useMindmap] Error triggering nodeDeleted hook:', error);
            });

          return {
            ...prev,
            nodes: newNodes,
          };
        });

        // FR: Retirer de la sélection si nécessaire
        // EN: Remove from selection if needed
        setSelection(prev => ({
          ...prev,
          selectedNodes: prev.selectedNodes.filter(id => id !== nodeId),
          primaryNode: prev.primaryNode === nodeId ? null : prev.primaryNode,
        }));
      },

      // FR: Modifier le titre d'un nœud
      // EN: Update node title
      updateNodeTitle: (nodeId: NodeID, title: string) => {
        setMindMap(prev => {
          if (!prev) return prev;

          const node = prev.nodes[nodeId];
          if (!node) return prev;

          // FR: Déclencher l'événement pour les plugins
          // EN: Trigger event for plugins
          pluginSystem.hookSystem
            .applyFilters('mindmap.nodeUpdated', {
              nodeId,
              title,
              node: { ...node, title },
            })
            .catch(error => {
              console.error('[useMindmap] Error triggering nodeUpdated hook:', error);
            });

          return {
            ...prev,
            nodes: {
              ...prev.nodes,
              [nodeId]: { ...node, title },
            },
          };
        });
      },

      // FR: Déplacer un nœud
      // EN: Move a node
      moveNode: (nodeId: NodeID, position: { x: number; y: number }) => {
        setMindMap(prev => {
          if (!prev) return prev;

          const node = prev.nodes[nodeId];
          if (!node) return prev;

          return {
            ...prev,
            nodes: {
              ...prev.nodes,
              [nodeId]: { ...node, x: position.x, y: position.y },
            },
          };
        });
      },

      // FR: Changer le parent d'un nœud
      // EN: Change node parent
      reparentNode: (nodeId: NodeID, newParentId: NodeID | null, newIndex = 0) => {
        setMindMap(prev => {
          if (!prev) return prev;

          const node = prev.nodes[nodeId];
          if (!node) return prev;

          const newNodes = { ...prev.nodes };

          // FR: Retirer de l'ancien parent
          // EN: Remove from old parent
          if (node.parentId) {
            const oldParent = newNodes[node.parentId];
            if (oldParent) {
              oldParent.children = oldParent.children.filter(id => id !== nodeId);
            }
          }

          // FR: Ajouter au nouveau parent
          // EN: Add to new parent
          const updatedNode = { ...node, parentId: newParentId };
          newNodes[nodeId] = updatedNode;

          if (newParentId) {
            const newParent = newNodes[newParentId];
            if (newParent) {
              newParent.children.splice(newIndex, 0, nodeId);
            }
          }

          return {
            ...prev,
            nodes: newNodes,
          };
        });
      },

      // FR: Sélectionner des nœuds
      // EN: Select nodes
      selectNodes: (nodeIds: NodeID[], mode: 'single' | 'multiple' = 'single') => {
        setSelection({
          selectedNodes: mode === 'single' ? [nodeIds[0]] : nodeIds,
          primaryNode: nodeIds[0] || null,
          mode,
        });
      },

      // FR: Annuler la dernière action (simplifié)
      // EN: Undo last action (simplified)
      undo: () => {
        // FR: TODO: Implémenter l'historique
        // EN: TODO: Implement history
        console.warn('Undo not implemented yet');
      },

      // FR: Refaire la dernière action (simplifié)
      // EN: Redo last action (simplified)
      redo: () => {
        // FR: TODO: Implémenter l'historique
        // EN: TODO: Implement history
        console.warn('Redo not implemented yet');
      },

      // FR: Basculer le mode d'édition
      // EN: Toggle edit mode
      setEditMode: (nodeId: NodeID | null, field: 'title' | 'notes' | null) => {
        setEditMode({ nodeId, field });
      },

      // FR: Appliquer les couleurs automatiques à tous les nœuds
      // EN: Apply automatic colors to all nodes
      applyAutomaticColorsToAll: () => {
        setMindMap(prev => {
          if (!prev) return prev;

          const theme = getCurrentTheme();
          const updatedNodes: Record<NodeID, MindNode> = {};

          Object.keys(prev.nodes).forEach(nodeId => {
            const node = prev.nodes[nodeId];
            const autoColor = getNodeColor(nodeId, prev.nodes, prev.rootId, theme);

            updatedNodes[nodeId] = {
              ...node,
              style: {
                ...node.style,
                backgroundColor: autoColor,
              },
            };
          });

          return {
            ...prev,
            nodes: updatedNodes,
          };
        });
      },
    }),
    [getCurrentTheme]
  );

  return {
    mindMap,
    selection,
    editMode,
    canUndo: false, // FR: TODO: Implémenter / EN: TODO: Implement
    canRedo: false, // FR: TODO: Implémenter / EN: TODO: Implement
    actions: actions(),
  };
};
