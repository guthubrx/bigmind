/**
 * FR: Hook pour synchroniser le DAG et la MindMap bidirectionnellement
 * EN: Hook to synchronize DAG and MindMap bidirectionally
 */

import { useEffect, useCallback } from 'react';
import { useNodeTags } from './useNodeTags';
import { eventBus } from '../utils/eventBus';
import { useMindmap } from './useMindmap';

interface UseMindMapDAGSyncOptions {
  enabled?: boolean;
}

export function useMindMapDAGSync(options: UseMindMapDAGSyncOptions = {}) {
  const { enabled = true } = options;

  const nodeTags = useNodeTags();
  const mindmapState = useMindmap();

  // FR: Synchroniser un nœud avec les tags du DAG
  // EN: Sync a node with tags from DAG
  const syncNodeTags = useCallback(
    (nodeId: string) => {
      const tags = nodeTags.getNodeTags(nodeId);
      // Émettre un événement pour que les composants se mettent à jour
      eventBus.emit('node:updated', {
        nodeId,
        updates: { tags },
      });
    },
    [nodeTags]
  );

  // FR: Ajouter un tag à un nœud
  // EN: Add a tag to a node
  const tagNodeSync = useCallback(
    (nodeId: string, tagId: string) => {
      nodeTags.tagNode(nodeId, tagId);
      syncNodeTags(nodeId);
      eventBus.emit('node:tagged', { nodeId, tagId });
    },
    [nodeTags, syncNodeTags]
  );

  // FR: Retirer un tag d'un nœud
  // EN: Remove a tag from a node
  const untagNodeSync = useCallback(
    (nodeId: string, tagId: string) => {
      nodeTags.untagNode(nodeId, tagId);
      syncNodeTags(nodeId);
      eventBus.emit('node:untagged', { nodeId, tagId });
    },
    [nodeTags, syncNodeTags]
  );

  // FR: Écouter les événements de création de tags
  // EN: Listen to tag creation events
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const unsubscribe = eventBus.on('tag:created', ({ tagId }) => {
      // Initialiser un set vide pour ce tag s'il n'existe pas
      const nodes = nodeTags.getTagNodes(tagId);
      if (nodes.length === 0) {
        // Tag is created but has no nodes yet
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, nodeTags]);

  // FR: Écouter les événements de suppression de tags
  // EN: Listen to tag removal events
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const unsubscribe = eventBus.on('tag:removed', ({ tagId }) => {
      // Supprimer complètement le tag de tous les nœuds
      nodeTags.removeTagCompletely(tagId);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, nodeTags]);

  // FR: Écouter les événements de suppression de nœuds
  // EN: Listen to node deletion events
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const unsubscribe = eventBus.on('node:deleted', ({ nodeId }) => {
      // Supprimer tous les tags de ce nœud
      nodeTags.removeNodeCompletely(nodeId);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, nodeTags]);

  // FR: Écouter les demandes de synchronisation
  // EN: Listen to sync refresh requests
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const unsubscribe = eventBus.on('sync:refresh', () => {
      // Rafraîchir tous les nœuds
      if (mindmapState.mindMap) {
        const { nodes } = mindmapState.mindMap;
        Object.keys(nodes).forEach(nodeId => {
          syncNodeTags(nodeId);
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, mindmapState.mindMap, syncNodeTags]);

  return {
    tagNodeSync,
    untagNodeSync,
    syncNodeTags,
  };
}
