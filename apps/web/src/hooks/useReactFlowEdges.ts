/**
 * FR: Hook pour convertir les connexions BigMind en arêtes ReactFlow
 * EN: Hook to convert BigMind connections to ReactFlow edges
 */

import { useCallback } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { useOpenFiles } from './useOpenFiles';
import type { OpenFile } from './useOpenFiles';

interface UseReactFlowEdgesParams {
  fileId?: string;
  activeSheetId?: string;
  nodesWithColors: Record<string, any>;
  draggedNodeId: string | null;
  ghostNode: Node | null;
  draggedDescendants: string[];
  linkStyle?: string;
}

interface UseReactFlowEdgesReturn {
  convertToReactFlowEdges: () => Edge[];
}

/**
 * FR: Obtenir la couleur de fond d'un nœud
 * EN: Get background color of a node
 */
function getNodeColor(nodeId: string, nodesWithColors: Record<string, any>): string {
  const node = nodesWithColors[nodeId];
  if (!node) return '#dc2626';
  return (
    node.computedStyle?.backgroundColor ||
    node.style?.backgroundColor ||
    (node.style as any)?.fill ||
    (node.style as any)?.background ||
    (node.style as any)?.bgColor ||
    '#dc2626'
  );
}

/**
 * FR: Obtenir la couleur de la branche (héritée du parent)
 * EN: Get branch color (inherited from parent)
 */
function getBranchColor(
  nodeId: string,
  parentId: string | null,
  nodesWithColors: Record<string, any>
): string {
  if (!parentId) {
    return '#dc2626';
  }

  const parentNode = nodesWithColors[parentId];
  if (!parentNode) return '#dc2626';

  return getNodeColor(parentId, nodesWithColors);
}

/**
 * FR: Obtenir le type d'arête selon le style configuré
 * EN: Get edge type based on configured style
 */
function getEdgeType(linkStyle?: string): string {
  switch (linkStyle) {
    case 'straight':
      return 'straight';
    case 'curved':
      return 'smoothstep';
    case 'rounded':
      return 'step';
    case 'orthogonal':
      return 'straight';
    default:
      return 'smoothstep';
  }
}

/**
 * FR: Hook pour gérer la conversion des connexions BigMind vers ReactFlow
 * EN: Hook to manage BigMind connections to ReactFlow conversion
 */
export function useReactFlowEdges({
  fileId,
  activeSheetId,
  nodesWithColors,
  draggedNodeId,
  ghostNode,
  draggedDescendants,
  linkStyle,
}: UseReactFlowEdgesParams): UseReactFlowEdgesReturn {
  // FR: Récupérer le fichier actif depuis le store
  // EN: Get active file from store
  const activeFile = useOpenFiles(
    state => state.openFiles.find(f => f.id === fileId && f.activeSheetId === activeSheetId) || null
  );

  const convertToReactFlowEdges = useCallback((): Edge[] => {
    if (!activeFile?.content?.nodes) {
      return [];
    }

    const edges: Edge[] = [];

    // FR: Le parser XMind crée rootNode, pas nodes.root
    // EN: XMind parser creates rootNode, not nodes.root
    const rootNode = activeFile.content.rootNode || activeFile.content.nodes?.root;

    if (!rootNode) return edges;

    const edgeType = getEdgeType(linkStyle);

    // FR: Fonction récursive pour créer les connexions
    // EN: Recursive function to create connections
    const createConnections = (node: any, level: number, direction: number): void => {
      if (node.collapsed || !node.children || node.children.length === 0) return;

      const childIds: string[] = node.children;

      if (level === 0) {
        // FR: Même partition qu'au layout: alternance droite/gauche
        const rightIds: string[] = [];
        const leftIds: string[] = [];
        childIds.forEach((id, idx) => (idx % 2 === 0 ? rightIds : leftIds).push(id));

        rightIds.forEach(childId => {
          const edgeColor = getNodeColor(childId, nodesWithColors);

          if (draggedNodeId !== childId && draggedNodeId !== node.id) {
            edges.push({
              id: `edge-${node.id}-${childId}`,
              source: node.id,
              target: childId,
              sourceHandle: 'right',
              type: edgeType,
              style: { stroke: edgeColor, strokeWidth: 2 },
              data: { isSelected: false, parentId: node.id, childId },
            });
          }

          const childNode = nodesWithColors[childId];
          if (childNode) createConnections(childNode, level + 1, +1);
        });

        leftIds.forEach(childId => {
          const edgeColor = getNodeColor(childId, nodesWithColors);

          if (draggedNodeId !== childId && draggedNodeId !== node.id) {
            edges.push({
              id: `edge-${node.id}-${childId}`,
              source: node.id,
              target: childId,
              sourceHandle: 'left',
              type: edgeType,
              style: { stroke: edgeColor, strokeWidth: 2 },
              data: { isSelected: false, parentId: node.id, childId },
            });
          }

          const childNode = nodesWithColors[childId];
          if (childNode) createConnections(childNode, level + 1, -1);
        });
      } else {
        // FR: Aux niveaux > 0, conserver la direction du parent
        const handleId = direction === -1 ? 'left' : 'right';
        childIds.forEach(childId => {
          const edgeColor = getBranchColor(childId, node.id, nodesWithColors);

          if (draggedNodeId !== childId && draggedNodeId !== node.id) {
            edges.push({
              id: `edge-${node.id}-${childId}`,
              source: node.id,
              target: childId,
              sourceHandle: handleId,
              type: edgeType,
              style: { stroke: edgeColor, strokeWidth: 2 },
              data: { isSelected: false, parentId: node.id, childId },
            });
          }

          const childNode = nodesWithColors[childId];
          if (childNode) createConnections(childNode, level + 1, direction);
        });
      }
    };

    // FR: Commencer par le nœud racine
    // EN: Start with root node
    createConnections(rootNode, 0, 0);

    // FR: Créer les liens fantômes entre le nœud fantôme et ses enfants transparents
    // EN: Create ghost edges between ghost node and its transparent children
    if (ghostNode && draggedDescendants.length > 0) {
      const ghostNodeId = ghostNode.id;
      const { originalNodeId } = ghostNode.data as any;

      const originalNode = activeFile?.content?.nodes?.[originalNodeId];
      if (originalNode?.children) {
        const childIds: string[] = originalNode.children;

        if (originalNodeId === rootNode.id) {
          // FR: Même partition qu'au layout: alternance droite/gauche
          const rightIds: string[] = [];
          const leftIds: string[] = [];
          childIds.forEach((id, idx) => (idx % 2 === 0 ? rightIds : leftIds).push(id));

          rightIds.forEach((childId: string) => {
            const edgeColor = getNodeColor(childId, nodesWithColors);
            edges.push({
              id: `ghost-edge-${ghostNodeId}-${childId}`,
              source: ghostNodeId,
              target: childId,
              sourceHandle: 'right',
              type: edgeType,
              style: {
                stroke: edgeColor,
                strokeWidth: 2,
                strokeDasharray: '5,5',
                opacity: 0.6,
              },
              data: {
                isSelected: false,
                parentId: ghostNodeId,
                childId,
                isGhost: true,
              },
            });
          });

          leftIds.forEach((childId: string) => {
            const edgeColor = getNodeColor(childId, nodesWithColors);
            edges.push({
              id: `ghost-edge-${ghostNodeId}-${childId}`,
              source: ghostNodeId,
              target: childId,
              sourceHandle: 'left',
              type: edgeType,
              style: {
                stroke: edgeColor,
                strokeWidth: 2,
                strokeDasharray: '5,5',
                opacity: 0.6,
              },
              data: {
                isSelected: false,
                parentId: ghostNodeId,
                childId,
                isGhost: true,
              },
            });
          });
        } else {
          // FR: Pour les nœuds non-racine, utiliser la direction du parent
          const handleId = 'right';
          childIds.forEach((childId: string) => {
            const edgeColor = getBranchColor(childId, originalNodeId, nodesWithColors);
            edges.push({
              id: `ghost-edge-${ghostNodeId}-${childId}`,
              source: ghostNodeId,
              target: childId,
              sourceHandle: handleId,
              type: edgeType,
              style: {
                stroke: edgeColor,
                strokeWidth: 2,
                strokeDasharray: '5,5',
                opacity: 0.6,
              },
              data: {
                isSelected: false,
                parentId: ghostNodeId,
                childId,
                isGhost: true,
              },
            });
          });
        }
      }
    }

    return edges;
  }, [
    activeFile,
    // FR: Utiliser la référence directe du fichier récupérée depuis le store
    // EN: Use direct file reference retrieved from store
    draggedNodeId,
    ghostNode,
    draggedDescendants,
    linkStyle,
    nodesWithColors,
  ]);

  return { convertToReactFlowEdges };
}
