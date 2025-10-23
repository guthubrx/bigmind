/**
 * FR: Hook simplifié pour gérer l'état de la carte mentale (version développement)
 * EN: Simplified hook to manage mind map state (development version)
 */

import { useState, useCallback, useEffect } from 'react';
import { eventBus } from '../utils/eventBus';
import { useOpenFiles } from './useOpenFiles';

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
  tags?: string[];
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
}

export interface SelectionState {
  selectedNodes: NodeID[];
  primaryNode: NodeID | null;
  mode: 'single' | 'multiple';
}

export interface FilterState {
  activeTags: string[];
  filteredNodes: NodeID[];
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
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [selection, setSelection] = useState<SelectionState>({
    selectedNodes: [],
    primaryNode: null,
    mode: 'single',
  });
  const [filterState, setFilterState] = useState<FilterState>({
    activeTags: [],
    filteredNodes: [],
  });
  const [editMode, setEditMode] = useState<{
    nodeId: NodeID | null;
    field: 'title' | 'notes' | null;
  }>({
    nodeId: null,
    field: null,
  });

  // FR: Synchroniser avec useOpenFiles
  // EN: Sync with useOpenFiles
  const activeFile = useOpenFiles((state) => state.openFiles.find(f => f.isActive) || null);

  // FR: Effet pour synchroniser la carte mentale avec le fichier actif
  // EN: Effect to sync mindmap with active file
  useEffect(() => {
    console.log('🔄 useMindmap: Synchronisation avec useOpenFiles déclenchée');
    console.log('🔄 useMindmap: Fichier actif:', activeFile ? activeFile.name : 'aucun');

    if (activeFile && activeFile.content) {
      console.log('🔄 useMindmap: Chargement de la carte depuis useOpenFiles');
      console.log('🔄 useMindmap: Contenu de la carte:', {
        id: activeFile.content.id,
        name: activeFile.content.name,
        nodesCount: Object.keys(activeFile.content.nodes || {}).length
      });

      // FR: Convertir le format useOpenFiles vers MindMap
      // EN: Convert useOpenFiles format to MindMap
      const convertedMap: MindMap = {
        id: activeFile.content.id,
        rootId: activeFile.content.rootNode?.id || 'root',
        nodes: activeFile.content.nodes || {},
        meta: {
          name: activeFile.content.name || 'Carte sans nom',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          locale: 'fr',
        },
      };

      setMindMap(convertedMap);
      console.log('✅ useMindmap: Carte synchronisée avec useOpenFiles');
    } else {
      console.log('🗑️ useMindmap: Aucun fichier actif, carte réinitialisée');
      setMindMap(null);
    }
  }, [activeFile?.id, activeFile?.content]);

  // FR: Actions avec useCallback pour éviter les re-renders
  // EN: Actions with useCallback to avoid re-renders
  const actions = useCallback(() => ({
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

    // FR: Filtrer par tags
    // EN: Filter by tags
    filterByTags: (tags: string[]) => {
      setFilterState(prev => {
        if (!mindMap || tags.length === 0) {
          return { activeTags: [], filteredNodes: [] };
        }

        // FR: Trouver tous les nœuds qui ont au moins un des tags sélectionnés
        // EN: Find all nodes that have at least one of the selected tags
        const filteredNodes = Object.values(mindMap.nodes)
          .filter(node => node.tags && tags.some(tag => node.tags!.includes(tag)))
          .map(node => node.id);

        return {
          activeTags: tags,
          filteredNodes,
        };
      });
    },

    // FR: Effacer tous les filtres
    // EN: Clear all filters
    clearFilters: () => {
      setFilterState({
        activeTags: [],
        filteredNodes: [],
      });
    },

    // FR: Ajouter un tag au filtrage
    // EN: Add a tag to filtering
    addFilterTag: (tag: string) => {
      setFilterState(prev => {
        const newTags = [...prev.activeTags, tag];
        if (!mindMap) {
          return { activeTags: newTags, filteredNodes: [] };
        }

        // FR: Recalculer les nœuds filtrés
        // EN: Recalculate filtered nodes
        const filteredNodes = Object.values(mindMap.nodes)
          .filter(node => node.tags && newTags.some(t => node.tags!.includes(t)))
          .map(node => node.id);

        return {
          activeTags: newTags,
          filteredNodes,
        };
      });
    },

    // FR: Retirer un tag du filtrage
    // EN: Remove a tag from filtering
    removeFilterTag: (tag: string) => {
      setFilterState(prev => {
        const newTags = prev.activeTags.filter(t => t !== tag);
        if (!mindMap || newTags.length === 0) {
          return { activeTags: [], filteredNodes: [] };
        }

        // FR: Recalculer les nœuds filtrés
        // EN: Recalculate filtered nodes
        const filteredNodes = Object.values(mindMap.nodes)
          .filter(node => node.tags && newTags.some(t => node.tags!.includes(t)))
          .map(node => node.id);

        return {
          activeTags: newTags,
          filteredNodes,
        };
      });
    },

    // FR: Ajouter un tag à un nœud
    // EN: Add a tag to a node
    addTagToNode: (nodeId: NodeID, tag: string) => {
      setMindMap(prev => {
        if (!prev) return prev;

        const node = prev.nodes[nodeId];
        if (!node) return prev;

        const currentTags = node.tags || [];
        if (currentTags.includes(tag)) return prev; // FR: Tag déjà présent / EN: Tag already exists

        // FR: Émettre l'événement pour la synchronisation avec le DAG
        // EN: Emit event for DAG synchronization
        console.log('🔥 Émission de node:tagged depuis useMindmap pour tag:', tag, 'nodeId:', nodeId);
        setTimeout(() => {
          eventBus.emit('node:tagged', { nodeId, tagId: tag }, 'mindmap');
        }, 0);

        return {
          ...prev,
          nodes: {
            ...prev.nodes,
            [nodeId]: {
              ...node,
              tags: [...currentTags, tag],
            },
          },
        };
      });
    },

    // FR: Retirer un tag d'un nœud
    // EN: Remove a tag from a node
    removeTagFromNode: (nodeId: NodeID, tag: string) => {
      setMindMap(prev => {
        if (!prev) return prev;

        const node = prev.nodes[nodeId];
        if (!node || !node.tags) return prev;

        // FR: Émettre l'événement pour la synchronisation avec le DAG
        // EN: Emit event for DAG synchronization
        console.log('🔥 Émission de node:untagged depuis useMindmap pour tag:', tag, 'nodeId:', nodeId);
        setTimeout(() => {
          eventBus.emit('node:untagged', { nodeId, tagId: tag }, 'mindmap');
        }, 0);

        return {
          ...prev,
          nodes: {
            ...prev.nodes,
            [nodeId]: {
              ...node,
              tags: node.tags.filter(t => t !== tag),
            },
          },
        };
      });
    },
  }), []);

  return {
    mindMap,
    selection,
    filterState,
    editMode,
    canUndo: false, // FR: TODO: Implémenter / EN: TODO: Implement
    canRedo: false, // FR: TODO: Implémenter / EN: TODO: Implement
    actions: actions(),
    nodes: mindMap?.nodes ? Object.values(mindMap.nodes) : [],
  };
};

// FR: Export pour utilisation avec les stores Zustand existants
// EN: Export for use with existing Zustand stores
export const useMindMapStore = useMindmap;

export default useMindmap;
