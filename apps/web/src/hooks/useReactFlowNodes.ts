/**
 * FR: Hook pour convertir les nœuds BigMind en nœuds ReactFlow
 * EN: Hook to convert BigMind nodes to ReactFlow nodes
 */

import { useCallback } from 'react';
import type { Node } from '@xyflow/react';
import { getTotalDescendantsCount } from '../utils/nodeUtils';
import { useOpenFiles } from './useOpenFiles';
import type { OpenFile } from './useOpenFiles';
import { useTagLayers } from './useTagLayers';

interface UseReactFlowNodesParams {
  fileId?: string;
  activeSheetId?: string;
  nodesWithColors: Record<string, any>;
  dragTarget: string | null;
  draggedDescendants: string[];
  ghostNode: Node | null;
  draggedNodeId: string | null;
}

interface UseReactFlowNodesReturn {
  convertToReactFlowNodes: () => Node[];
}

// FR: Constantes de layout
// EN: Layout constants
const LEVEL_WIDTH = 320; // Distance entre niveaux
const NODE_WIDTH = 200; // Largeur fixe des nœuds
const LINE_HEIGHT = 20; // Hauteur de ligne approx
const NODE_VPAD = 16; // Padding vertical
const SIBLING_GAP = 16; // Espace entre sous-arbres

/**
 * FR: Estimer la hauteur d'un nœud en fonction de son texte
 * EN: Estimate node height based on its text
 */
function estimateTextHeight(text: string): number {
  if (!text) return LINE_HEIGHT + NODE_VPAD;
  const words = text.split(/\s+/);
  const avgCharWidth = 7;
  const maxCharsPerLine = Math.max(8, Math.floor((NODE_WIDTH - 24) / avgCharWidth));
  let lines = 1;
  let current = 0;
  words.forEach(w => {
    const len = w.length + 1;
    if (current + len > maxCharsPerLine) {
      lines += 1;
      current = len;
    } else {
      current += len;
    }
  });
  return Math.max(LINE_HEIGHT + NODE_VPAD, lines * LINE_HEIGHT + NODE_VPAD);
}

/**
 * FR: Hook pour gérer la conversion des nœuds BigMind vers ReactFlow
 * EN: Hook to manage BigMind nodes to ReactFlow conversion
 */
export function useReactFlowNodes({
  fileId,
  activeSheetId,
  nodesWithColors,
  dragTarget,
  draggedDescendants,
  ghostNode,
  draggedNodeId,
}: UseReactFlowNodesParams): UseReactFlowNodesReturn {
  // FR: Récupérer le fichier actif depuis le store
  // EN: Get active file from store
  const activeFile = useOpenFiles(
    state => state.openFiles.find(f => f.id === fileId && f.activeSheetId === activeSheetId) || null
  );

  // FR: Récupérer uniquement nodeVisibility du store, pas les fonctions
  // EN: Get only nodeVisibility from store, not functions
  const nodeVisibility = useTagLayers(state => state.nodeVisibility);

  // FR: Convertir les nœuds du fichier actif en nœuds ReactFlow
  // EN: Convert active file nodes to ReactFlow nodes
  const convertToReactFlowNodes = useCallback((): Node[] => {
    if (!activeFile?.content?.nodes) {
      return [];
    }

    const nodes: Node[] = [];

    // FR: Le parser XMind crée rootNode, pas nodes.root
    // EN: XMind parser creates rootNode, not nodes.root
    const rootNode = activeFile.content.rootNode || activeFile.content.nodes?.root;

    if (!rootNode) {
      return [];
    }

    // FR: Calcul de la hauteur (px) par sous-arbre
    // EN: Compute subtree total height in pixels
    const subtreeHeightById: Record<string, number> = {};
    const nodeOwnHeightById: Record<string, number> = {};

    const computeSubtreeHeights = (node: any): number => {
      const own = estimateTextHeight(node.title || '');
      nodeOwnHeightById[node.id] = own;
      // Si le nœud est replié, ignorer sa descendance
      if (node.collapsed || !node.children || node.children.length === 0) {
        subtreeHeightById[node.id] = own;
        return own;
      }
      let total = 0;
      node.children.forEach((childId: string, idx: number) => {
        const childNode = nodesWithColors[childId];
        if (childNode) {
          total += computeSubtreeHeights(childNode);
          if (idx < node.children.length - 1) total += SIBLING_GAP;
        }
      });
      const height = Math.max(own, total);
      subtreeHeightById[node.id] = height;
      return height;
    };

    // FR: Positionner un sous-arbre dans une bande verticale (px)
    // EN: Position a subtree within a vertical band (px)
    const positionSubtree = (
      node: any,
      level: number,
      direction: number, // -1 left, 0 root, +1 right
      baseY: number // début de la bande verticale allouée
    ) => {
      const totalHeight = subtreeHeightById[node.id] || LINE_HEIGHT + NODE_VPAD;
      const x = level === 0 ? 0 : direction * level * LEVEL_WIDTH;
      const nodeCenterY = baseY + totalHeight / 2 - nodeOwnHeightById[node.id] / 2;

      // FR: Vérifier si le nœud doit être affiché selon sa visibilité individuelle et celle de ses tags
      // EN: Check if node should be displayed based on individual visibility and tag visibility
      // FR: Appeler directement les fonctions du store pour éviter les dépendances instables
      // EN: Call store functions directly to avoid unstable dependencies
      const tagLayersState = useTagLayers.getState();
      const isNodeVisibleByTag = tagLayersState.isNodeVisible(node.tags);
      const isIndividuallyVisible = nodeVisibility[node.id] !== false;
      const shouldShow = isNodeVisibleByTag && isIndividuallyVisible;

      // FR: Ajouter le nœud seulement s'il doit être affiché
      // EN: Add node only if it should be displayed
      if (shouldShow) {
        const opacity = tagLayersState.getNodeOpacity(node.tags);

        nodes.push({
          id: node.id,
          type: 'mindmap',
          position: { x, y: nodeCenterY },
          data: {
            id: node.id,
            title: node.title,
            parentId: level === 0 ? null : 'parent', // fixé plus tard
            children: node.children || [],
            style: node.style,
            computedStyle: node.computedStyle,
            isSelected: false,
            isPrimary: level === 0,
            direction,
            childCounts: {
              total: getTotalDescendantsCount(node.id, nodesWithColors),
            },
            isDragTarget: dragTarget === node.id,
            isDescendantOfDragged: draggedDescendants.includes(node.id),
            isBeingDragged: draggedNodeId === node.id,
            opacity,
            tags: node.tags || [], // FR: Transmettre les tags au composant MindMapNode
          },
        });
      }

      // Si replié, ne pas positionner les enfants
      if (node.collapsed || !node.children || node.children.length === 0) return;

      const childIds: string[] = node.children;
      if (childIds.length === 1) {
        // FR: Cas enfant unique: aligner verticalement le centre de l'enfant sur le parent
        // EN: Single child: align child's center with parent's center
        const onlyId = childIds[0];
        const ch = subtreeHeightById[onlyId] || LINE_HEIGHT + NODE_VPAD;
        const parentCenterY =
          nodeCenterY + (nodeOwnHeightById[node.id] || LINE_HEIGHT + NODE_VPAD) / 2;
        // FR: Respecter la bande verticale allouée pour éviter de chevaucher d'autres branches
        // EN: Respect allocated vertical band to avoid overlapping other branches
        const bandStart = baseY;
        const bandEnd = baseY + totalHeight;
        let base = parentCenterY - ch / 2;
        if (base < bandStart) base = bandStart;
        if (base + ch > bandEnd) base = Math.max(bandStart, bandEnd - ch);
        const childNode = nodesWithColors[onlyId];
        const childDirection = level === 0 ? (direction === 0 ? +1 : direction) : direction;
        positionSubtree(childNode, level + 1, childDirection, base);
      } else if (level === 0) {
        // FR: Au niveau racine: répartition alternée droite/gauche
        const rightIds: string[] = [];
        const leftIds: string[] = [];
        childIds.forEach((id, idx) => (idx % 2 === 0 ? rightIds : leftIds).push(id));

        // FR: Injecter les compteurs gauche/droite sur la racine
        const rootIndex = nodes.findIndex(n => n.id === node.id);
        if (rootIndex !== -1) {
          const leftTotal = leftIds.reduce(
            (sum, id) => sum + getTotalDescendantsCount(id, nodesWithColors) + 1,
            0
          );
          const rightTotal = rightIds.reduce(
            (sum, id) => sum + getTotalDescendantsCount(id, nodesWithColors) + 1,
            0
          );
          (nodes[rootIndex].data as any).childCounts = {
            left: leftTotal,
            right: rightTotal,
            total: leftTotal + rightTotal,
          };
        }

        // Droite
        let offsetRight =
          nodeCenterY -
          (rightIds.reduce(
            (acc, id) => acc + (subtreeHeightById[id] || LINE_HEIGHT + NODE_VPAD),
            0
          ) +
            SIBLING_GAP * Math.max(0, rightIds.length - 1)) /
            2;
        rightIds.forEach(childId => {
          const ch = subtreeHeightById[childId] || LINE_HEIGHT + NODE_VPAD;
          positionSubtree(nodesWithColors[childId], level + 1, +1, offsetRight);
          offsetRight += ch + SIBLING_GAP;
        });

        // Gauche
        let offsetLeft =
          nodeCenterY -
          (leftIds.reduce(
            (acc, id) => acc + (subtreeHeightById[id] || LINE_HEIGHT + NODE_VPAD),
            0
          ) +
            SIBLING_GAP * Math.max(0, leftIds.length - 1)) /
            2;
        leftIds.forEach(childId => {
          const ch = subtreeHeightById[childId] || LINE_HEIGHT + NODE_VPAD;
          positionSubtree(nodesWithColors[childId], level + 1, -1, offsetLeft);
          offsetLeft += ch + SIBLING_GAP;
        });
      } else {
        // FR: Conserver l'ordre et la direction du parent
        if (childIds.length === 1) {
          const onlyId = childIds[0];
          const ch = subtreeHeightById[onlyId] || LINE_HEIGHT + NODE_VPAD;
          const parentCenterY =
            nodeCenterY + (nodeOwnHeightById[node.id] || LINE_HEIGHT + NODE_VPAD) / 2;
          const start = parentCenterY - ch / 2;
          positionSubtree(nodesWithColors[onlyId], level + 1, direction, start);
        } else {
          let currentY = baseY;
          childIds.forEach((childId: string) => {
            const ch = subtreeHeightById[childId] || LINE_HEIGHT + NODE_VPAD;
            positionSubtree(nodesWithColors[childId], level + 1, direction, currentY);
            currentY += ch + SIBLING_GAP;
          });
        }
      }
    };

    // FR: Corriger les parentId après positionnement
    // EN: Fix parentId after positioning
    const fixParentIds = (node: any, parentId: string | null = null): void => {
      const nodeIndex = nodes.findIndex(n => n.id === node.id);
      if (nodeIndex !== -1) {
        nodes[nodeIndex].data.parentId = parentId;
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((childId: string) => {
          const childNode = nodesWithColors[childId];
          if (childNode) {
            fixParentIds(childNode, node.id);
          }
        });
      }
    };

    // FR: Calcul préalable des tailles de sous-arbres
    // EN: Pre-compute subtree sizes
    const totalHeight = computeSubtreeHeights(rootNode);
    const startY = -totalHeight / 2;

    // FR: Positionner depuis la racine
    // EN: Position from root
    positionSubtree(rootNode, 0, 0, startY);

    // FR: Corriger les parentId
    // EN: Fix parentId
    fixParentIds(rootNode);

    // FR: Ajouter le nœud fantôme si on est en train de glisser un nœud
    // EN: Add ghost node if we're dragging a node
    if (ghostNode) {
      nodes.push(ghostNode);
    }

    return nodes;
  }, [
    activeFile,
    // FR: Utiliser la référence directe du fichier récupérée depuis le store
    // EN: Use direct file reference retrieved from store
    dragTarget,
    draggedDescendants,
    ghostNode,
    draggedNodeId,
    nodesWithColors,
    nodeVisibility,
  ]);

  return { convertToReactFlowNodes };
}
