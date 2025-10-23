/**
 * FR: Hook pour gérer la navigation clavier dans la carte mentale
 * EN: Hook to manage keyboard navigation in the mind map
 */

import { useEffect, useRef } from 'react';
import type { Node } from '@xyflow/react';
import { shouldIgnoreShortcut } from '../utils/inputUtils';
import { useCanvasOptions } from './useCanvasOptions';
import type { OpenFile } from './useOpenFiles';

interface UseKeyboardNavigationParams {
  activeFile: OpenFile | null;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  nodesWithColors: Record<string, any>;
  updateActiveFileNode: (nodeId: string, updates: any) => void;
  addSiblingToActive: (nodeId: string, title: string) => string | null;
  addChildToActive: (nodeId: string, title: string) => string | null;
  removeNodeFromActive: (nodeId: string) => string | null;
  getShortcut: (action: any) => string;
  nodes: Node[];
}

interface UseKeyboardNavigationReturn {
  // Ce hook ne retourne rien, il gère les événements clavier globalement
}

/**
 * FR: Hook pour gérer la navigation clavier dans la carte mentale
 * EN: Hook to manage keyboard navigation in the mind map
 */
export function useKeyboardNavigation({
  activeFile,
  selectedNodeId,
  setSelectedNodeId,
  nodesWithColors,
  updateActiveFileNode,
  addSiblingToActive,
  addChildToActive,
  removeNodeFromActive,
  getShortcut,
  nodes,
}: UseKeyboardNavigationParams): UseKeyboardNavigationReturn {
  // FR: Conserver une référence aux nœuds positionnés pour la navigation
  // EN: Keep a ref to positioned nodes for navigation
  const nodesRef = useRef<Node[]>(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // FR: Navigation clavier dans l'arborescence avec les flèches
  // EN: Keyboard navigation in the tree using arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!activeFile?.content?.nodes) return;

      // FR: Ignorer les raccourcis sans modificateurs si on tape dans un champ
      // EN: Ignore shortcuts without modifiers when typing in a field
      if (shouldIgnoreShortcut(e)) {
        return;
      }

      const { key } = e;
      // toggle follow
      if (key.toLowerCase() === (getShortcut('view.follow') || 'F').toLowerCase()) {
        e.preventDefault();
        const cur = useCanvasOptions.getState().followSelection;
        useCanvasOptions.getState().setFollowSelection(!cur);
        return;
      }
      if (key === 'Enter') {
        if (!activeFile?.content?.nodes) return;
        const currentId: string =
          selectedNodeId || activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
        if (!currentId) return;
        e.preventDefault();
        const newId = addSiblingToActive(currentId, 'Nouveau nœud');
        if (newId) setSelectedNodeId(newId);
        return;
      }
      if (key === ' ') {
        // Espace: toggle collapse/expand of current node descendants
        if (!activeFile?.content?.nodes) return;
        const rootIdSpace: string =
          activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
        const currentIdSpace: string = selectedNodeId || rootIdSpace;
        if (!currentIdSpace) return;
        e.preventDefault();
        const nodesMapAny: any = nodesWithColors;
        const cur = nodesMapAny[currentIdSpace];
        const newCollapsed = !cur?.collapsed;
        updateActiveFileNode(currentIdSpace, { collapsed: newCollapsed });
        return;
      }
      if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight')
        return;
      const nodesMap: any = nodesWithColors;
      // pick current or root
      const rootId: string = activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
      const currentId: string = selectedNodeId || rootId;
      const current = nodesMap[currentId];
      if (!current) return;
      e.preventDefault();

      const select = (id?: string) => {
        if (id && nodesMap[id]) setSelectedNodeId(id);
      };

      const positioned = nodesRef.current;
      const curNode = positioned.find(n => n.id === currentId);
      const curX = curNode?.position?.x || 0;
      const isLeftSide = currentId !== rootId && curX < 0;

      const gotoClosestChild = () => {
        const childIds: string[] = current.children || [];
        if (childIds.length === 0) return;
        if (currentId === rootId) {
          // root: choose by side using key
          const desiredRight = key === 'ArrowRight';
          let candidates = childIds.filter(cid => {
            const c = positioned.find(n => n.id === cid);
            return desiredRight ? (c?.position?.x || 0) > 0 : (c?.position?.x || 0) < 0;
          });
          if (candidates.length === 0) candidates = childIds;
          // pick nearest in Euclidean distance
          const curCenterX =
            (curNode?.position?.x || 0) + ((curNode?.data as any)?.width || 200) / 2;
          const curCenterY =
            (curNode?.position?.y || 0) + ((curNode?.data as any)?.height || 40) / 2;
          let bestId: string | undefined;
          let bestD = Number.POSITIVE_INFINITY;
          for (const cid of candidates) {
            const c = positioned.find(n => n.id === cid);
            if (!c) continue;
            const cx = (c.position?.x || 0) + ((c.data as any)?.width || 200) / 2;
            const cy = (c.position?.y || 0) + ((c.data as any)?.height || 40) / 2;
            const dx = cx - curCenterX;
            const dy = cy - curCenterY;
            const d2 = dx * dx + dy * dy;
            if (d2 < bestD) {
              bestD = d2;
              bestId = cid;
            }
          }
          select(bestId || candidates[0]);
          return;
        }
        // non-root: closest child irrespective of side
        const curCenterX = (curNode?.position?.x || 0) + ((curNode?.data as any)?.width || 200) / 2;
        const curCenterY = (curNode?.position?.y || 0) + ((curNode?.data as any)?.height || 40) / 2;
        let bestId: string | undefined;
        let bestD = Number.POSITIVE_INFINITY;
        for (const cid of childIds) {
          const c = positioned.find(n => n.id === cid);
          if (!c) continue;
          const cx = (c.position?.x || 0) + ((c.data as any)?.width || 200) / 2;
          const cy = (c.position?.y || 0) + ((c.data as any)?.height || 40) / 2;
          const dx = cx - curCenterX;
          const dy = cy - curCenterY;
          const d2 = dx * dx + dy * dy;
          if (d2 < bestD) {
            bestD = d2;
            bestId = cid;
          }
        }
        select(bestId || childIds[0]);
      };

      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        const goParent = () => select(current.parentId);
        if (currentId === rootId) {
          // Root: Left -> closest child on the left, Right -> closest child on the right
          gotoClosestChild();
          return;
        }
        if (isLeftSide) {
          // Left side: Right -> parent (to the right), Left -> child (to the left)
          if (key === 'ArrowRight') {
            goParent();
            return;
          }
          if (key === 'ArrowLeft') {
            gotoClosestChild();
            return;
          }
        } else {
          // Right side: Left -> parent, Right -> child
          if (key === 'ArrowLeft') {
            goParent();
            return;
          }
          if (key === 'ArrowRight') {
            gotoClosestChild();
            return;
          }
        }
      }

      // siblings navigation
      const { parentId } = current;
      if (!parentId) return; // root has no up/down among siblings
      const parent = nodesMap[parentId];
      const siblings: string[] = parent?.children || [];
      const idx = siblings.indexOf(currentId);
      if (idx === -1) return;
      if (key === 'ArrowUp') {
        if (idx > 0) {
          select(siblings[idx - 1]);
        } else {
          // FR: Rechercher un cousin au-dessus (chez les frères du parent précédents) le plus proche en Y
          const grandParentId = parent?.parentId;
          if (!grandParentId) return;
          const grandParent = nodesMap[grandParentId];
          const parentSiblings: string[] = grandParent?.children || [];
          const pIdx = parentSiblings.indexOf(parentId);
          if (pIdx > 0) {
            const positionedA = nodesRef.current;
            const curNodeA = positionedA.find(n => n.id === currentId);
            const curCY =
              (curNodeA?.position?.y || 0) + ((curNodeA?.data as any)?.height || 40) / 2;
            let bestId: string | undefined;
            let bestDY = Number.POSITIVE_INFINITY;
            // parcourir les parents précédents (du plus proche au plus lointain)
            for (let i = pIdx - 1; i >= 0; i -= 1) {
              const cousinParentId = parentSiblings[i];
              const cousinChildren: string[] = nodesMap[cousinParentId]?.children || [];
              for (let j = 0; j < cousinChildren.length; j += 1) {
                const cid = cousinChildren[j];
                const n = positionedA.find(nn => nn.id === cid);
                if (n) {
                  const cy = (n.position?.y || 0) + ((n.data as any)?.height || 40) / 2;
                  const dy = Math.abs(cy - curCY);
                  if (dy < bestDY) {
                    bestDY = dy;
                    bestId = cid;
                  }
                }
              }
              if (bestId) break; // on prend sur le parent le plus proche
            }
            if (bestId) select(bestId);
          }
        }
        return;
      }
      if (key === 'ArrowDown') {
        if (idx < siblings.length - 1) {
          select(siblings[idx + 1]);
        } else {
          // FR: Rechercher un cousin en dessous (chez les frères du parent suivants) le plus proche en Y
          const grandParentId = parent?.parentId;
          if (!grandParentId) return;
          const grandParent = nodesMap[grandParentId];
          const parentSiblings: string[] = grandParent?.children || [];
          const pIdx = parentSiblings.indexOf(parentId);
          if (pIdx !== -1 && pIdx < parentSiblings.length - 1) {
            const positionedB = nodesRef.current;
            const curNodeB = positionedB.find(n => n.id === currentId);
            const curCY =
              (curNodeB?.position?.y || 0) + ((curNodeB?.data as any)?.height || 40) / 2;
            let bestId: string | undefined;
            let bestDY = Number.POSITIVE_INFINITY;
            // parcourir les parents suivants (du plus proche au plus lointain)
            for (let i = pIdx + 1; i < parentSiblings.length; i += 1) {
              const cousinParentId = parentSiblings[i];
              const cousinChildren: string[] = nodesMap[cousinParentId]?.children || [];
              for (let j = 0; j < cousinChildren.length; j += 1) {
                const cid = cousinChildren[j];
                const n = positionedB.find(nn => nn.id === cid);
                if (n) {
                  const cy = (n.position?.y || 0) + ((n.data as any)?.height || 40) / 2;
                  const dy = Math.abs(cy - curCY);
                  if (dy < bestDY) {
                    bestDY = dy;
                    bestId = cid;
                  }
                }
              }
              if (bestId) break; // on prend sur le parent le plus proche
            }
            if (bestId) select(bestId);
          }
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [
    activeFile,
    selectedNodeId,
    setSelectedNodeId,
    getShortcut,
    addSiblingToActive,
    nodesWithColors,
    updateActiveFileNode,
  ]);

  // FR: Raccourci Tab pour créer un enfant du nœud sélectionné
  // EN: Tab shortcut to create child of selected node
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!activeFile?.content?.nodes) return;

      // FR: Ignorer les raccourcis sans modificateurs si on tape dans un champ
      // EN: Ignore shortcuts without modifiers when typing in a field
      if (shouldIgnoreShortcut(e)) {
        return;
      }

      const parentId: string =
        selectedNodeId || activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
      if (!parentId) return;
      e.preventDefault();
      const newId = addChildToActive(parentId, 'Nouveau nœud');
      if (newId) setSelectedNodeId(newId);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [activeFile, selectedNodeId, addChildToActive, setSelectedNodeId]);

  // FR: Backspace/Delete pour supprimer le nœud sélectionné (et sous-arbre)
  // EN: Backspace/Delete to delete selected node (and subtree)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;
      if (!activeFile?.content?.nodes) return;

      // FR: Ignorer les raccourcis sans modificateurs si on tape dans un champ
      // EN: Ignore shortcuts without modifiers when typing in a field
      if (shouldIgnoreShortcut(e)) {
        return;
      }

      const currentId: string | undefined =
        selectedNodeId || activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
      if (!currentId) return;
      // Ne pas supprimer la racine
      const rootId: string | undefined =
        activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
      if (currentId === rootId) return;
      e.preventDefault();
      const parentId = removeNodeFromActive(currentId);
      if (parentId) setSelectedNodeId(parentId);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [activeFile, selectedNodeId, removeNodeFromActive, setSelectedNodeId]);

  return {};
}
