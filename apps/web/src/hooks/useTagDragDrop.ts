/**
 * FR: Hook pour gérer le drag & drop de tags entre nœuds avec Option
 * EN: Hook to handle tag drag & drop between nodes with Option
 */

import { useState, useCallback, useEffect } from 'react';
import { useMindMapDAGSync } from './useMindMapDAGSync';

export interface TagDragState {
  isDragging: boolean;
  draggedTagId: string | null;
  sourceNodeId: string | null;
  targetNodeId: string | null;
  isCopyMode: boolean;
}

export function useTagDragDrop() {
  const [dragState, setDragState] = useState<TagDragState>({
    isDragging: false,
    draggedTagId: null,
    sourceNodeId: null,
    targetNodeId: null,
    isCopyMode: false,
  });

  const sync = useMindMapDAGSync();

  // FR: Démarrer le drag d'un tag
  // EN: Start dragging a tag
  const startDrag = useCallback((tagId: string, sourceNodeId: string, event: React.MouseEvent) => {
    // FR: Vérifier si la touche Option (Alt) est enfoncée
    // EN: Check if Option (Alt) key is pressed
    const isCopyMode = event.altKey;

    setDragState({
      isDragging: true,
      draggedTagId: tagId,
      sourceNodeId,
      targetNodeId: null,
      isCopyMode,
    });

    // FR: Ajouter un écouteur pour détecter la touche Option pendant le drag
    // EN: Add listener to detect Option key during drag
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setDragState(prev => ({ ...prev, isCopyMode: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setDragState(prev => ({ ...prev, isCopyMode: false }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // FR: Définir la cible du drag
  // EN: Set drag target
  const setTargetNode = useCallback((nodeId: string | null) => {
    setDragState(prev => ({ ...prev, targetNodeId: nodeId }));
  }, []);

  // FR: Terminer le drag et appliquer l'opération
  // EN: End drag and apply operation
  const endDrag = useCallback(() => {
    const { draggedTagId, sourceNodeId, targetNodeId, isCopyMode } = dragState;

    if (draggedTagId && sourceNodeId && targetNodeId && sourceNodeId !== targetNodeId) {
      // FR: Appliquer l'opération selon le mode
      // EN: Apply operation based on mode
      if (isCopyMode) {
        // FR: Copier le tag vers le nœud cible
        // EN: Copy tag to target node
        sync.tagNode(targetNodeId, draggedTagId);
      } else {
        // FR: Déplacer le tag (retirer de la source, ajouter à la cible)
        // EN: Move tag (remove from source, add to target)
        sync.untagNode(sourceNodeId, draggedTagId);
        sync.tagNode(targetNodeId, draggedTagId);
      }
    }

    // FR: Réinitialiser l'état
    // EN: Reset state
    setDragState({
      isDragging: false,
      draggedTagId: null,
      sourceNodeId: null,
      targetNodeId: null,
      isCopyMode: false,
    });
  }, [dragState, sync]);

  // FR: Annuler le drag
  // EN: Cancel drag
  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedTagId: null,
      sourceNodeId: null,
      targetNodeId: null,
      isCopyMode: false,
    });
  }, []);

  // FR: Écouter les événements globaux pour annuler le drag
  // EN: Listen to global events to cancel drag
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseUp = (e: MouseEvent) => {
      // FR: Si on relâche en dehors d'un nœud, annuler
      // EN: If released outside a node, cancel
      if (!dragState.targetNodeId) {
        cancelDrag();
      } else {
        endDrag();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDrag();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dragState.isDragging, dragState.targetNodeId, cancelDrag, endDrag]);

  return {
    dragState,
    startDrag,
    setTargetNode,
    endDrag,
    cancelDrag,
  };
}
