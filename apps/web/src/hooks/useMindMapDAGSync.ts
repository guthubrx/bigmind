/**
 * FR: Hook pour synchroniser le DAG et la MindMap bidirectionnellement
 * EN: Hook to synchronize DAG and MindMap bidirectionally
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNodeTags } from './useNodeTags';
import { eventBus } from '../utils/eventBus';
import { useMindmap } from './useMindmap';

interface UseMindMapDAGSyncOptions {
  enabled?: boolean;
  debounceMs?: number;
}

const DEFAULT_DEBOUNCE_MS = 50;

export function useMindMapDAGSync(options: UseMindMapDAGSyncOptions = {}) {
  const { enabled = true, debounceMs = DEFAULT_DEBOUNCE_MS } = options;

  const nodeTags = useNodeTags();
  const mindmapState = useMindmap();
  const debounceTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // FR: Synchroniser un nœud avec débouncing pour performance
  // EN: Sync a node with debouncing for performance
  const syncNodeTags = useCallback(
    (nodeId: string, immediate = false) => {
      const executeSync = () => {
        const tags = nodeTags.getNodeTags(nodeId);
        // Émettre un événement pour que les composants se mettent à jour
        eventBus.emit('node:updated', {
          nodeId,
          updates: { tags },
        });
        // Nettoyer le timer
        debounceTimerRef.current.delete(nodeId);
      };

      if (immediate) {
        executeSync();
        return;
      }

      // Annuler le timer précédent s'il existe
      const existingTimer = debounceTimerRef.current.get(nodeId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Créer un nouveau timer
      const newTimer = setTimeout(() => {
        executeSync();
      }, debounceMs);

      debounceTimerRef.current.set(nodeId, newTimer);
    },
    [nodeTags, debounceMs]
  );

  // FR: Nettoyer les timers au unmount
  // EN: Clean up timers on unmount
  useEffect(
    () => () => {
      debounceTimerRef.current.forEach(timer => clearTimeout(timer));
      debounceTimerRef.current.clear();
    },
    []
  );

  // FR: Ajouter un tag à un nœud (synchrone)
  // EN: Add a tag to a node (synchronous)
  const tagNodeSync = useCallback(
    (nodeId: string, tagId: string) => {
      nodeTags.tagNode(nodeId, tagId);
      syncNodeTags(nodeId, true); // immediate: true pour opérations critiques
      eventBus.emit('node:tagged', { nodeId, tagId });
    },
    [nodeTags, syncNodeTags]
  );

  // FR: Retirer un tag d'un nœud (synchrone)
  // EN: Remove a tag from a node (synchronous)
  const untagNodeSync = useCallback(
    (nodeId: string, tagId: string) => {
      nodeTags.untagNode(nodeId, tagId);
      syncNodeTags(nodeId, true); // immediate: true pour opérations critiques
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
      // Rafraîchir tous les nœuds immédiatement
      if (mindmapState.mindMap) {
        const { nodes } = mindmapState.mindMap;
        Object.keys(nodes).forEach(nodeId => {
          syncNodeTags(nodeId, true); // immediate: true pour refresh complet
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
