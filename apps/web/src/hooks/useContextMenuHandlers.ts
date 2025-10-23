/**
 * FR: Hook pour gérer les actions du menu contextuel des nœuds
 * EN: Hook to manage node context menu actions
 */

import { useCallback } from 'react';
import { getNodeDepth } from '../utils/nodeUtils';
import type { OpenFile } from './useOpenFiles';

interface UseContextMenuHandlersParams {
  activeFile: OpenFile | null;
  updateActiveFileNode: (nodeId: string, updates: any) => void;
}

interface UseContextMenuHandlersReturn {
  onToggleCollapse: (nodeId: string) => void;
  onToggleCollapseSiblings: (nodeId: string) => void;
  onToggleCollapseGeneration: (nodeId: string) => void;
  onExpand: (nodeId: string) => void;
  onExpandSiblings: (nodeId: string) => void;
  onExpandGeneration: (nodeId: string) => void;
}

/**
 * FR: Hook pour gérer les actions du menu contextuel
 * EN: Hook to manage context menu actions
 */
export function useContextMenuHandlers({
  activeFile,
  updateActiveFileNode,
}: UseContextMenuHandlersParams): UseContextMenuHandlersReturn {
  // FR: Basculer l'état collapsed d'un nœud
  // EN: Toggle collapsed state of a node
  const onToggleCollapse = useCallback(
    (nodeId: string) => {
      const node = activeFile?.content?.nodes?.[nodeId];
      if (!node) return;
      updateActiveFileNode(nodeId, { collapsed: !node.collapsed });
    },
    [activeFile, updateActiveFileNode]
  );

  // FR: Basculer l'état collapsed de tous les frères du nœud
  // EN: Toggle collapsed state of all siblings
  const onToggleCollapseSiblings = useCallback(
    (nodeId: string) => {
      const node = activeFile?.content?.nodes?.[nodeId];
      if (!node || !node.parentId) return;
      const parent = activeFile?.content?.nodes?.[node.parentId];
      if (!parent?.children) return;
      parent.children.forEach((cid: string) => {
        const child = activeFile?.content?.nodes?.[cid];
        if (!child) return;
        updateActiveFileNode(cid, { collapsed: !child.collapsed });
      });
    },
    [activeFile, updateActiveFileNode]
  );

  // FR: Replier tous les nœuds de niveau > N (où N est le niveau du nœud cliqué)
  // EN: Collapse all nodes at depth > N (where N is the clicked node's depth)
  const onToggleCollapseGeneration = useCallback(
    (nodeId: string) => {
      console.log('🔄 Replier génération pour nœud:', nodeId);
      const nodes = activeFile?.content?.nodes;
      if (!nodes) return;

      // FR: Trouver la racine (nœud sans parent)
      // EN: Find root (node without parent)
      const rootId = Object.keys(nodes).find(id => !nodes[id]?.parentId);
      if (!rootId) return;

      // FR: Calculer la profondeur du nœud cliqué
      // EN: Calculate depth of clicked node
      const clickedNodeDepth = getNodeDepth(nodeId, nodes);
      console.log('📍 Profondeur du nœud cliqué:', clickedNodeDepth);

      // FR: Parcours en largeur pour trouver tous les nœuds de profondeur > clickedNodeDepth
      // EN: BFS traversal to find all nodes at depth > clickedNodeDepth
      const queue: Array<{ id: string; depth: number }> = [{ id: rootId, depth: 0 }];
      const toCollapse: string[] = [];

      while (queue.length > 0) {
        const current = queue.shift()!;
        const currentNode = nodes[current.id];
        if (!currentNode) continue;

        console.log(
          `🔍 Nœud ${current.id} à profondeur ${current.depth} (cible: >${clickedNodeDepth})`
        );

        // FR: Replier les nœuds plus profonds que le nœud cliqué ET leurs parents directs
        // EN: Collapse nodes deeper than the clicked node AND their direct parents
        if (current.depth > clickedNodeDepth) {
          toCollapse.push(current.id);
          console.log(`✅ Ajouté à la liste de repli: ${current.id}`);

          // FR: Aussi replier le parent direct pour masquer les enfants
          // EN: Also collapse the direct parent to hide children
          const currentNode = nodes[current.id];
          if (currentNode?.parentId && !toCollapse.includes(currentNode.parentId)) {
            toCollapse.push(currentNode.parentId);
            console.log(`✅ Ajouté le parent à la liste de repli: ${currentNode.parentId}`);
          }
        }

        const children: string[] = Array.isArray(currentNode.children) ? currentNode.children : [];
        children.forEach(cid => {
          queue.push({ id: cid, depth: current.depth + 1 });
        });
      }

      // FR: Forcer l'état replié pour tous les nœuds plus profonds
      // EN: Force collapsed state for all deeper nodes
      console.log('📦 Nœuds à replier:', toCollapse);
      toCollapse.forEach(nId => {
        console.log(`🔄 Repliage du nœud ${nId}`);
        updateActiveFileNode(nId, { collapsed: true });
      });
      console.log('✅ Repliage terminé pour', toCollapse.length, 'nœuds');
    },
    [activeFile, updateActiveFileNode]
  );

  // FR: Déplier le nœud (forcer collapsed: false)
  // EN: Expand the node (force collapsed: false)
  const onExpand = useCallback(
    (nodeId: string) => {
      updateActiveFileNode(nodeId, { collapsed: false });
    },
    [updateActiveFileNode]
  );

  // FR: Déplier tous les frères du nœud
  // EN: Expand all siblings of the node
  const onExpandSiblings = useCallback(
    (nodeId: string) => {
      const node = activeFile?.content?.nodes?.[nodeId];
      if (!node || !node.parentId) return;
      const parent = activeFile?.content?.nodes?.[node.parentId];
      if (!parent?.children) return;
      parent.children.forEach((cid: string) => {
        updateActiveFileNode(cid, { collapsed: false });
      });
    },
    [activeFile, updateActiveFileNode]
  );

  // FR: Déplier l'arbre jusqu'au niveau N (inclus) et replier tout ce qui est au-delà
  // EN: Expand tree up to level N (inclusive) and collapse everything beyond
  const onExpandGeneration = useCallback(
    (nodeId: string) => {
      const nodes = activeFile?.content?.nodes;
      if (!nodes) return;

      // FR: Trouver la racine (nœud sans parent)
      // EN: Find root (node without parent)
      const rootId = Object.keys(nodes).find(id => !nodes[id]?.parentId);
      if (!rootId) return;

      // FR: Calculer la profondeur du nœud cliqué
      // EN: Calculate depth of clicked node
      const clickedNodeDepth = getNodeDepth(nodeId, nodes);
      console.log("🔄 Déplier génération jusqu'au niveau:", clickedNodeDepth);

      // FR: Parcours en largeur de TOUT l'arbre
      // EN: BFS traversal of the ENTIRE tree
      const queue: Array<{ id: string; depth: number }> = [{ id: rootId, depth: 0 }];
      const toExpand: string[] = [];
      const toCollapse: string[] = [];

      while (queue.length > 0) {
        const current = queue.shift()!;
        const currentNode = nodes[current.id];
        if (!currentNode) continue;

        if (current.depth <= clickedNodeDepth) {
          // FR: Déplier tous les nœuds jusqu'au niveau N (inclus)
          // EN: Expand all nodes up to level N (inclusive)
          toExpand.push(current.id);
          console.log(`✅ À déplier: ${current.id} (profondeur ${current.depth})`);
        } else {
          // FR: Replier tous les nœuds au-delà du niveau N
          // EN: Collapse all nodes beyond level N
          toCollapse.push(current.id);
          console.log(`📦 À replier: ${current.id} (profondeur ${current.depth})`);
        }

        const children: string[] = Array.isArray(currentNode.children) ? currentNode.children : [];
        children.forEach(cid => {
          queue.push({ id: cid, depth: current.depth + 1 });
        });
      }

      // FR: Appliquer les changements
      // EN: Apply changes
      toExpand.forEach(nId => {
        updateActiveFileNode(nId, { collapsed: false });
      });

      toCollapse.forEach(nId => {
        updateActiveFileNode(nId, { collapsed: true });
      });

      console.log(
        '✅ Dépliage terminé: déplié',
        toExpand.length,
        'nœuds, replié',
        toCollapse.length,
        'nœuds'
      );
    },
    [activeFile, updateActiveFileNode]
  );

  return {
    onToggleCollapse,
    onToggleCollapseSiblings,
    onToggleCollapseGeneration,
    onExpand,
    onExpandSiblings,
    onExpandGeneration,
  };
}
