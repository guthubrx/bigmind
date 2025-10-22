/**
 * FR: Hook d'intégration pour synchroniser la MindMap avec le DAG sémantique
 * EN: Integration hook to synchronize MindMap with semantic DAG
 */

import { useEffect, useRef } from 'react';
import { useMindMapStore } from './useMindMap';
import { useTagGraph } from './useTagGraph';
import { useNodeTags } from './useNodeTags';
import { eventBus } from '../utils/eventBus';

export function useMindMapDAGSync() {
  const mindMap = useMindMapStore();
  const tagGraph = useTagGraph();
  const nodeTags = useNodeTags();
  const isSyncing = useRef(false);

  // FR: Synchroniser les modifications de la MindMap vers le DAG
  // EN: Sync MindMap changes to DAG
  useEffect(() => {
    // FR: Écouter les changements de nœuds
    // EN: Listen to node changes
    const handleNodeUpdate = (nodeId: string) => {
      if (isSyncing.current) return;

      const node = mindMap.nodes.find(n => n.id === nodeId);
      if (!node) return;

      // FR: Si le nœud a des tags, les synchroniser
      // EN: If node has tags, sync them
      if (node.data?.tags) {
        const currentTags = nodeTags.getNodeTags(nodeId);
        const newTags = node.data.tags as string[];

        // Ajouter les nouveaux tags
        newTags.forEach(tagId => {
          if (!currentTags.includes(tagId)) {
            nodeTags.addNodeTag(nodeId, tagId);
            eventBus.emit('node:tagged', { nodeId, tagId }, 'mindmap');
          }
        });

        // Retirer les tags supprimés
        currentTags.forEach(tagId => {
          if (!newTags.includes(tagId)) {
            nodeTags.removeNodeTag(nodeId, tagId);
            eventBus.emit('node:untagged', { nodeId, tagId }, 'mindmap');
          }
        });
      }
    };

    // FR: Écouter les suppressions de nœuds
    // EN: Listen to node deletions
    const handleNodeDelete = (nodeId: string) => {
      if (isSyncing.current) return;

      nodeTags.removeAllNodeTags(nodeId);
    };

    // FR: S'abonner aux événements de la MindMap
    // EN: Subscribe to MindMap events
    // Note: Ces événements doivent être émis par le composant MindMapCanvas
    const unsubUpdate = eventBus.on('node:updated', (event) => {
      if (event.source === 'mindmap') {
        handleNodeUpdate(event.payload.nodeId);
      }
    });

    const unsubDelete = eventBus.on('node:deleted', (event) => {
      if (event.source === 'mindmap') {
        handleNodeDelete(event.payload.nodeId);
      }
    });

    return () => {
      unsubUpdate();
      unsubDelete();
    };
  }, [mindMap.nodes, nodeTags]);

  // FR: Synchroniser les modifications du DAG vers la MindMap
  // EN: Sync DAG changes to MindMap
  useEffect(() => {
    // FR: Écouter la sélection de tags dans le DAG
    // EN: Listen to tag selection in DAG
    const handleNodeSelection = (event: any) => {
      if (event.source !== 'dag') return;

      isSyncing.current = true;
      const { nodeIds } = event.payload;

      // FR: Mettre en surbrillance les nœuds dans la MindMap
      // EN: Highlight nodes in MindMap
      mindMap.nodes.forEach(node => {
        const isHighlighted = nodeIds.includes(node.id);
        mindMap.updateNode(node.id, {
          style: {
            ...node.style,
            opacity: isHighlighted ? 1 : 0.3,
            borderColor: isHighlighted ? '#3B82F6' : undefined,
            borderWidth: isHighlighted ? 2 : 1,
          }
        });
      });

      setTimeout(() => {
        isSyncing.current = false;
      }, 100);
    };

    const unsubNodeSelection = eventBus.on('node:selected', handleNodeSelection);

    return () => {
      unsubNodeSelection();
    };
  }, [mindMap]);

  // FR: Méthodes d'interaction
  // EN: Interaction methods
  const tagNode = (nodeId: string, tagId: string) => {
    // Vérifier que le tag existe
    const tag = tagGraph.tags.find(t => t.id === tagId);
    if (!tag) {
      console.error(`Tag ${tagId} n'existe pas`);
      return;
    }

    // Ajouter l'association
    nodeTags.addNodeTag(nodeId, tagId);

    // Mettre à jour le nœud de la MindMap
    const node = mindMap.nodes.find(n => n.id === nodeId);
    if (node) {
      const currentTags = (node.data?.tags as string[]) || [];
      if (!currentTags.includes(tagId)) {
        mindMap.updateNode(nodeId, {
          data: {
            ...node.data,
            tags: [...currentTags, tagId]
          }
        });
      }
    }

    // Émettre l'événement
    eventBus.emit('node:tagged', { nodeId, tagId }, 'mindmap');
  };

  const untagNode = (nodeId: string, tagId: string) => {
    // Retirer l'association
    nodeTags.removeNodeTag(nodeId, tagId);

    // Mettre à jour le nœud de la MindMap
    const node = mindMap.nodes.find(n => n.id === nodeId);
    if (node) {
      const currentTags = (node.data?.tags as string[]) || [];
      mindMap.updateNode(nodeId, {
        data: {
          ...node.data,
          tags: currentTags.filter(t => t !== tagId)
        }
      });
    }

    // Émettre l'événement
    eventBus.emit('node:untagged', { nodeId, tagId }, 'mindmap');
  };

  const getNodeTags = (nodeId: string) => {
    return nodeTags.getNodeTags(nodeId).map(tagId => {
      const tag = tagGraph.tags.find(t => t.id === tagId);
      return tag || { id: tagId, label: tagId };
    });
  };

  const getTaggedNodes = (tagId: string) => {
    return nodeTags.getTagNodes(tagId).map(nodeId => {
      const node = mindMap.nodes.find(n => n.id === nodeId);
      return node;
    }).filter(Boolean);
  };

  const highlightTaggedNodes = (tagId: string) => {
    const nodeIds = nodeTags.getTagNodes(tagId);
    eventBus.emit('node:selected', { nodeIds }, 'dag');
  };

  const refreshSync = () => {
    eventBus.emit('sync:refresh', {}, 'system');
  };

  return {
    // Méthodes de tagging
    tagNode,
    untagNode,
    getNodeTags,
    getTaggedNodes,
    highlightTaggedNodes,

    // État de synchronisation
    isSyncing: isSyncing.current,
    refreshSync,

    // État global
    tags: tagGraph.tags,
    nodes: mindMap.nodes,
    tagUsage: nodeTags.getTagUsage(),
  };
}

export default useMindMapDAGSync;