/**
 * FR: Composant principal du canvas de carte mentale
 * EN: Main mind map canvas component
 */

import React, { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useOpenFiles } from '../hooks/useOpenFiles';
// import { useViewport } from '../hooks/useViewport';
import { useCanvasOptions } from '../hooks/useCanvasOptions';
import { useSelection } from '../hooks/useSelection';
import MindMapNode from './MindMapNode';
import MindMapEdge from './MindMapEdge';
import { useFlowInstance } from '../hooks/useFlowInstance';
import { useShortcuts } from '../hooks/useShortcuts';
import { useAppSettings, COLOR_PALETTES } from '../hooks/useAppSettings';
import { ReparentNodeCommand } from '@bigmind/core';
import { shouldIgnoreShortcut } from '../utils/inputUtils';
import {
  lightenHexColor,
  getRelativeLuminance,
  getOptimalTextColor,
} from '../utils/colorUtils';
import {
  getAllDescendants,
  getTotalDescendantsCount,
  getNodeDepth,
  isDescendant,
} from '../utils/nodeUtils';
import { getBackgroundPatternStyle } from '../utils/backgroundPatterns';
import NodeContextMenu from './NodeContextMenu';

// FR: Types de nœuds personnalisés
// EN: Custom node types
const nodeTypes: NodeTypes = {
  mindmap: MindMapNode as any,
};

// FR: Types d'arêtes personnalisés
// EN: Custom edge types
const edgeTypes: EdgeTypes = {
  mindmap: MindMapEdge as any,
};

function MindMapCanvas() {
  const activeFile = useOpenFiles(state => state.openFiles.find(f => f.isActive) || null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const setFlowInstance = useFlowInstance(s => s.setInstance);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(
    null
  );
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [draggedDescendants, setDraggedDescendants] = useState<string[]>([]);
  const [ghostNode, setGhostNode] = useState<Node | null>(null);
  const setSelectedNodeId = useSelection(s => s.setSelectedNodeId);
  const followSelection = useCanvasOptions(s => s.followSelection);

  // FR: Écouter les événements de menu contextuel des nœuds
  // EN: Listen to context menu events from nodes
  useEffect(() => {
    const handleNodeContextMenu = (event: CustomEvent) => {
      const { x, y, nodeId } = event.detail;

      // FR: D'abord sélectionner le nœud pour déclencher le mode follow
      // EN: First select the node to trigger follow mode
      setSelectedNodeId(nodeId);

      // FR: Attendre que le mode follow se termine, puis recalculer la position
      // EN: Wait for follow mode to complete, then recalculate position
      setTimeout(() => {
        // FR: Si on est en mode follow, on centre le menu sur le nœud
        // EN: If in follow mode, center menu on the node
        if (followSelection && instanceRef.current) {
          const nodeElement = instanceRef.current.getNode(nodeId);
          if (nodeElement) {
            const nodePosition = nodeElement.position;
            const viewport = instanceRef.current.getViewport();

            // FR: Convertir la position du nœud en coordonnées écran
            // EN: Convert node position to screen coordinates
            const screenX = nodePosition.x * viewport.zoom + viewport.x + 100; // Offset pour éviter de masquer le nœud
            const screenY = nodePosition.y * viewport.zoom + viewport.y + 50;

            setContextMenu({ x: screenX, y: screenY, nodeId });
          } else {
            setContextMenu({ x, y, nodeId });
          }
        } else {
          setContextMenu({ x, y, nodeId });
        }
      }, 150); // Délai un peu plus long pour s'assurer que le mode follow est terminé
    };

    window.addEventListener('node-context-menu', handleNodeContextMenu as EventListener);
    return () => {
      window.removeEventListener('node-context-menu', handleNodeContextMenu as EventListener);
    };
  }, [setSelectedNodeId, followSelection]);
  // const zoom = useViewport((s) => s.zoom);
  // const setZoom = useViewport((s) => s.setZoom);
  const nodesDraggable = useCanvasOptions(s => s.nodesDraggable);
  const selectedNodeId = useSelection(s => s.selectedNodeId);
  const addChildToActive = useOpenFiles(s => s.addChildToActive);
  const updateActiveFileNode = useOpenFiles(s => s.updateActiveFileNode);
  const addSiblingToActive = useOpenFiles(s => s.addSiblingToActive);
  const removeNodeFromActive = useOpenFiles(s => s.removeNodeFromActive);
  const copyNode = useOpenFiles(s => s.copyNode);
  const pasteNode = useOpenFiles(s => s.pasteNode);
  const canPaste = useOpenFiles(s => s.canPaste);
  const getShortcut = useShortcuts(s => s.getShortcut);
  const selectedPaletteGlobal = useAppSettings(s => s.selectedPalette);
  // FR: Palette par carte (fallback globale)
  // EN: Per-map palette (global fallback)
  const perMapPaletteId =
    useOpenFiles(s => s.openFiles.find(f => f.isActive)?.paletteId) || selectedPaletteGlobal;

  // Debug logs removed for cleanliness
  // Color utilities imported from utils/colorUtils.ts

  // FR: Appliquer l'inférence de couleurs par branche basée sur la palette sélectionnée
  // EN: Apply branch color inference based on selected palette
  const applyColorInference = useCallback(
    (nodes: Record<string, any>, themeColors?: string[]) => {
      // FR: Utiliser la palette sélectionnée ou celle du thème XMind en fallback
      // EN: Use selected palette or XMind theme palette as fallback
      const palette = COLOR_PALETTES.find(p => p.id === perMapPaletteId);
      const colors = palette?.colors || themeColors || [];

      // Color palette inference completed

      // FR: Créer une copie non destructive et préparer computedStyle
      // EN: Create non-destructive copy and prepare computedStyle
      const updatedNodes: Record<string, any> = {};
      Object.keys(nodes).forEach(id => {
        const original = nodes[id];
        updatedNodes[id] = {
          ...original,
          computedStyle: {
            ...(original?.computedStyle || {}),
            // FR: Préserver les couleurs XMind originales si elles existent
            // EN: Preserve original XMind colors if they exist
            backgroundColor:
              original?.style?.backgroundColor ||
              (original?.style as any)?.fill ||
              (original?.style as any)?.background ||
              (original?.style as any)?.bgColor,
            textColor:
              original?.style?.textColor ||
              (original?.style as any)?.fontColor ||
              (original?.style as any)?.color,
          },
        };
      });

      // FR: Si pas de palette disponible, retourner les nœuds avec leurs couleurs originales
      // EN: If no palette available, return nodes with their original colors
      if (colors.length === 0) {
        return updatedNodes;
      }

      const rootNode =
        updatedNodes[Object.keys(updatedNodes).find(id => !updatedNodes[id].parentId) || ''];
      if (!rootNode || !rootNode.children) {
        return updatedNodes;
      }

      // FR: Assigner une couleur à chaque enfant direct de la racine
      // EN: Assign a color to each direct child of the root
      rootNode.children.forEach((childId: string, index: number) => {
        const colorIndex = index % colors.length;
        const branchColor = colors[colorIndex];

        // FR: Propager la couleur à tous les descendants de cette branche
        // EN: Propagate color to all descendants of this branch
        const propagateColor = (nodeId: string, depth: number) => {
          const node = updatedNodes[nodeId];
          if (!node) return;

          // FR: Ne pas écraser les couleurs XMind existantes, seulement inférer si manquantes
          // EN: Don't override existing XMind colors, only infer if missing
          if (!node.computedStyle.backgroundColor) {
            const bgColor = depth === 1 ? branchColor : lightenHexColor(branchColor, 0.7);
            node.computedStyle.backgroundColor = bgColor;
            if (!node.computedStyle.textColor) {
              node.computedStyle.textColor = getOptimalTextColor(bgColor);
            }
          }

          // FR: Propager aux enfants
          // EN: Propagate to children
          if (node.children) {
            node.children.forEach((cid: string) => {
              propagateColor(cid, depth + 1);
            });
          }
        };

        // FR: Fils directs partent à depth=1
        // EN: Direct children start at depth=1
        propagateColor(childId, 1);
      });

      return updatedNodes;
    },
    [perMapPaletteId]
  );

  // FR: Nœuds avec inférence de couleurs appliquée
  // EN: Nodes with color inference applied
  const nodesWithColors = useMemo(() => {
    if (!activeFile?.content?.nodes) {
      return {};
    }
    return applyColorInference(activeFile.content.nodes, activeFile.themeColors);
  }, [activeFile?.content?.nodes, activeFile?.themeColors, applyColorInference, perMapPaletteId]);

  // Node utilities imported from utils/nodeUtils.ts

  // FR: Convertir les nœuds du fichier actif en nœuds ReactFlow
  // EN: Convert active file nodes to ReactFlow nodes
  const convertToReactFlowNodes = useCallback((): Node[] => {
    // Converting nodes to ReactFlow format
    if (!activeFile?.content?.nodes) {
      // console.warn('No nodes in activeFile.content');
      return [];
    }

    const nodes: Node[] = [];

    // FR: Le parser XMind crée rootNode, pas nodes.root
    // EN: XMind parser creates rootNode, not nodes.root
    const rootNode = activeFile.content.rootNode || activeFile.content.nodes?.root;

    if (!rootNode) {
      // console.warn('No root node');
      return [];
    }

    // FR: Utiliser les nœuds avec inférence de couleurs appliquée
    // EN: Use nodes with color inference applied

    // FR: Le nœud racine sera ajouté par positionSubtree (pour éviter les doublons)
    // EN: Root node will be added by positionSubtree (to avoid duplicates)

    // FR: Layout horizontal avec calcul dynamique de la hauteur pour éviter les chevauchements
    // EN: Horizontal layout with dynamic height calculation to avoid overlaps
    const LEVEL_WIDTH = 320; // Distance entre niveaux
    const NODE_WIDTH = 200; // Largeur fixe des nœuds
    const LINE_HEIGHT = 20; // Hauteur de ligne approx
    const NODE_VPAD = 16; // Padding vertical
    const SIBLING_GAP = 16; // Espace entre sous-arbres

    const estimateTextHeight = (text: string): number => {
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
    };

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

      // FR: Toujours afficher le nœud, mais marquer s'il est en cours de drag
      // EN: Always display the node, but mark if it's being dragged
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
        },
      });

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
        // FR: Au niveau racine: répartition alternée droite/gauche, chaque côté conserve l'ordre vertical et sa propre bande
        const rightIds: string[] = [];
        const leftIds: string[] = [];
        childIds.forEach((id, idx) => (idx % 2 === 0 ? rightIds : leftIds).push(id));

        // FR: Injecter les compteurs gauche/droite sur la racine
        const rootIndex = nodes.findIndex(n => n.id === node.id);
        if (rootIndex !== -1) {
          // FR: Calculer le nombre total de descendants pour chaque côté
          // EN: Calculate total number of descendants for each side
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
          // FR: Alignement au centre pour enfant unique
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

    // FR: Calcul préalable des tailles de sous-arbres
    // EN: Pre-compute subtree sizes
    const totalHeight = computeSubtreeHeights(rootNode);
    const startY = -totalHeight / 2;

    // FR: Positionner depuis la racine en respectant les bandes verticales par sous-arbre
    // EN: Position from root respecting vertical bands per subtree
    positionSubtree(rootNode, 0, 0, startY);

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

    fixParentIds(rootNode);

    // FR: Ajouter le nœud fantôme si on est en train de glisser un nœud
    // EN: Add ghost node if we're dragging a node
    if (ghostNode) {
      nodes.push(ghostNode);
    }

    // console.warn('ReactFlow nodes created:', nodes.length);
    return nodes;
  }, [
    activeFile,
    dragTarget,
    draggedDescendants,
    ghostNode,
    draggedNodeId,
    getTotalDescendantsCount,
  ]);

  // FR: Convertir les connexions en arêtes ReactFlow
  // EN: Convert connections to ReactFlow edges
  const convertToReactFlowEdges = useCallback((): Edge[] => {
    // console.warn('convertToReactFlowEdges called');
    if (!activeFile?.content?.nodes) {
      // console.warn('No nodes for edges');
      return [];
    }

    const edges: Edge[] = [];

    // FR: Le parser XMind crée rootNode, pas nodes.root
    // EN: XMind parser creates rootNode, not nodes.root
    const rootNode = activeFile.content.rootNode || activeFile.content.nodes?.root;

    if (!rootNode) return edges;

    // FR: Obtenir la couleur de fond d'un nœud
    // EN: Get background color of a node
    const getNodeColor = (nodeId: string): string => {
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
    };

    // FR: Obtenir la couleur de la branche (héritée du parent)
    // EN: Get branch color (inherited from parent)
    const getBranchColor = (nodeId: string, parentId: string | null): string => {
      if (!parentId) {
        // FR: Nœud racine - pas de couleur de branche
        // EN: Root node - no branch color
        return '#dc2626';
      }

      const parentNode = nodesWithColors[parentId];
      if (!parentNode) return '#dc2626';

      // FR: La couleur de la branche est celle du parent
      // EN: Branch color is the parent's color
      return getNodeColor(parentId);
    };

    // FR: Obtenir le type d'arête selon le style configuré
    // EN: Get edge type based on configured style
    const getEdgeType = (): string => {
      const linkStyle = activeFile?.mapStyle?.linkStyle || 'curved';

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
    };

    // FR: Fonction récursive pour créer les connexions en respectant la direction (gauche/droite)
    // EN: Recursive function to create connections respecting direction (left/right)
    const createConnections = (node: any, level: number, direction: number): void => {
      if (node.collapsed || !node.children || node.children.length === 0) return;

      const childIds: string[] = node.children;

      if (level === 0) {
        // FR: Même partition qu'au layout: alternance droite/gauche
        const rightIds: string[] = [];
        const leftIds: string[] = [];
        childIds.forEach((id, idx) => (idx % 2 === 0 ? rightIds : leftIds).push(id));

        rightIds.forEach(childId => {
          // FR: Première génération -> couleur du nœud enfant
          // EN: First generation -> child's node color
          const edgeColor = getNodeColor(childId);

          // FR: Ne pas créer de lien si le nœud enfant est en cours de drag OU si le nœud parent est en cours de drag
          // EN: Don't create edge if child node is being dragged OR if parent node is being dragged
          if (draggedNodeId !== childId && draggedNodeId !== node.id) {
          edges.push({
              id: `edge-${node.id}-${childId}`,
            source: node.id,
            target: childId,
              sourceHandle: 'right',
              type: getEdgeType(),
              style: { stroke: edgeColor, strokeWidth: 2 },
              data: { isSelected: false, parentId: node.id, childId },
            });
          }

          const childNode = nodesWithColors[childId];
          if (childNode) createConnections(childNode, level + 1, +1);
        });

        leftIds.forEach(childId => {
          // FR: Première génération -> couleur du nœud enfant
          // EN: First generation -> child's node color
          const edgeColor = getNodeColor(childId);

          // FR: Ne pas créer de lien si le nœud enfant est en cours de drag OU si le nœud parent est en cours de drag
          // EN: Don't create edge if child node is being dragged OR if parent node is being dragged
          if (draggedNodeId !== childId && draggedNodeId !== node.id) {
            edges.push({
              id: `edge-${node.id}-${childId}`,
              source: node.id,
              target: childId,
              sourceHandle: 'left',
              type: getEdgeType(),
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
          const edgeColor = getBranchColor(childId, node.id);

          // FR: Ne pas créer de lien si le nœud enfant est en cours de drag OU si le nœud parent est en cours de drag
          // EN: Don't create edge if child node is being dragged OR if parent node is being dragged
          if (draggedNodeId !== childId && draggedNodeId !== node.id) {
            edges.push({
              id: `edge-${node.id}-${childId}`,
              source: node.id,
              target: childId,
              sourceHandle: handleId,
              type: getEdgeType(),
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
      const originalNodeId = (ghostNode.data as any).originalNodeId;

      // FR: Trouver les enfants directs du nœud original
      // EN: Find direct children of original node
      const originalNode = activeFile?.content?.nodes?.[originalNodeId];
      if (originalNode?.children) {
        // FR: Utiliser la même logique de direction que pour les liens normaux
        // EN: Use same direction logic as normal edges
        const childIds: string[] = originalNode.children;

        if (originalNodeId === rootNode.id) {
          // FR: Même partition qu'au layout: alternance droite/gauche
          const rightIds: string[] = [];
          const leftIds: string[] = [];
          childIds.forEach((id, idx) => (idx % 2 === 0 ? rightIds : leftIds).push(id));

          rightIds.forEach((childId: string) => {
            const edgeColor = getNodeColor(childId);
            edges.push({
              id: `ghost-edge-${ghostNodeId}-${childId}`,
              source: ghostNodeId,
              target: childId,
              sourceHandle: 'right',
              type: getEdgeType(),
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
            const edgeColor = getNodeColor(childId);
            edges.push({
              id: `ghost-edge-${ghostNodeId}-${childId}`,
              source: ghostNodeId,
              target: childId,
              sourceHandle: 'left',
              type: getEdgeType(),
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
          // EN: For non-root nodes, use parent's direction
          const handleId = 'right'; // FR: Par défaut / EN: Default
          childIds.forEach((childId: string) => {
            const edgeColor = getBranchColor(childId, originalNodeId);
            edges.push({
              id: `ghost-edge-${ghostNodeId}-${childId}`,
              source: ghostNodeId,
              target: childId,
              sourceHandle: handleId,
              type: getEdgeType(),
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

    // console.warn('Edges created:', edges.length);
    return edges;
  }, [activeFile, draggedNodeId, ghostNode, draggedDescendants, activeFile?.mapStyle?.linkStyle]);

  const initialNodes = useMemo(() => convertToReactFlowNodes(), [convertToReactFlowNodes]);
  const initialEdges = useMemo(() => convertToReactFlowEdges(), [convertToReactFlowEdges]);

  // FR: Générer les styles CSS pour les motifs de fond
  // EN: Generate CSS styles for background patterns
  const backgroundPatternStyle = useMemo(() => {
    const pattern = activeFile?.mapStyle?.backgroundPattern;
    const opacity = activeFile?.mapStyle?.backgroundPatternOpacity || 0.3;
    return getBackgroundPatternStyle(pattern as any, opacity);
  }, [activeFile?.mapStyle?.backgroundPattern, activeFile?.mapStyle?.backgroundPatternOpacity]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // FR: Conserver une référence aux nœuds positionnés pour la navigation
  // EN: Keep a ref to positioned nodes for navigation
  const nodesRef = useRef<Node[]>(initialNodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // FR: Mettre à jour les nœuds quand le fichier actif change
  // EN: Update nodes when active file changes
  React.useEffect(() => {
    const newNodes = convertToReactFlowNodes();
    const newEdges = convertToReactFlowEdges();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    activeFile,
    activeFile?.content?.nodes,
    convertToReactFlowNodes,
    convertToReactFlowEdges,
    setNodes,
    setEdges,
  ]);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  // FR: Gérer le début du drag des nœuds
  // EN: Handle node drag start
  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log('🚀 onNodeDragStart triggered for node:', node.id);
      setDraggedNodeId(node.id);

      // FR: Calculer les descendants du nœud qu'on glisse pour l'effet de transparence
      // EN: Calculate descendants of dragged node for transparency effect
      if (!activeFile?.content?.nodes) return;
      const descendants = getAllDescendants(node.id, activeFile.content.nodes);
      setDraggedDescendants(descendants);
      console.log('👥 Dragged node descendants:', descendants);

      // FR: Créer le nœud fantôme à la position d'origine
      // EN: Create ghost node at original position
      const ghost = {
        ...node,
        id: `ghost-${node.id}`,
        data: {
          ...node.data,
          isGhost: true,
          originalNodeId: node.id,
        },
      };
      setGhostNode(ghost);
      console.log('👻 Ghost node created:', ghost.id);
    },
    [activeFile?.content?.nodes]
  );

  // FR: Gérer le drag des nœuds pour afficher l'indicateur visuel
  // EN: Handle node drag to show visual indicator
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log('🖱️ onNodeDrag triggered for node:', node.id);

      // FR: Utiliser React Flow pour trouver le nœud sous le curseur
      // EN: Use React Flow to find the node under the cursor
      if (!instanceRef.current) {
        console.log('❌ React Flow instance not available');
        setDragTarget(null);
        return;
      }

      // FR: Obtenir la position de la souris dans le système de coordonnées de React Flow
      // EN: Get mouse position in React Flow coordinate system
      const position = instanceRef.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      console.log('📍 Mouse position in flow:', position);

      // FR: Trouver le nœud le plus proche de cette position
      // EN: Find the node closest to this position
      const allNodes = instanceRef.current.getNodes();
      let closestNode: Node | null = null;
      let minDistance = Infinity;

      allNodes.forEach((flowNode: Node) => {
        if (flowNode.id === node.id) return; // FR: Ignorer le nœud qu'on glisse / EN: Ignore the dragged node

        const nodeX = flowNode.position.x;
        const nodeY = flowNode.position.y;
        const nodeWidth = 200; // FR: Largeur fixe des nœuds / EN: Fixed node width
        const nodeHeight = 50; // FR: Hauteur approximative / EN: Approximate height
        const tolerance = useAppSettings.getState().dragTolerance; // FR: Zone de tolérance en pixels / EN: Tolerance zone in pixels

        // FR: Vérifier si la position de la souris est dans les limites du nœud + tolérance
        // EN: Check if mouse position is within node bounds + tolerance
        if (
          position.x >= nodeX - tolerance &&
          position.x <= nodeX + nodeWidth + tolerance &&
          position.y >= nodeY - tolerance &&
          position.y <= nodeY + nodeHeight + tolerance
        ) {
          const distance = Math.sqrt(
            (position.x - (nodeX + nodeWidth / 2)) ** 2 +
              (position.y - (nodeY + nodeHeight / 2)) ** 2
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestNode = flowNode;
          }
        }
      });

      if (!closestNode) {
        console.log('❌ No target node found under cursor');
        setDragTarget(null);
        return;
      }

      // TypeScript assertion: closestNode is not null at this point
      const targetNode = closestNode as Node;
      console.log('🎯 Found target node:', targetNode.id, 'current node:', node.id);

      // FR: Vérifier que le nœud cible n'est pas un descendant du nœud déplacé
      // EN: Check that target node is not a descendant of the moved node
      if (
        activeFile?.content?.nodes &&
        isDescendant(targetNode.id, node.id, activeFile.content.nodes)
      ) {
        console.log('❌ Target node is a descendant of dragged node');
        setDragTarget(null);
        return;
      }

      console.log('✅ Setting drag target:', targetNode.id);
      setDragTarget(targetNode.id);
    },
    [activeFile]
  );

  // FR: Gérer le drag and drop des nœuds pour les rattacher
  // EN: Handle node drag and drop to reattach them
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log('🛑 onNodeDragStop triggered for node:', node.id, 'dragTarget:', dragTarget);

      // FR: Toujours réinitialiser les états, même si pas de cible
      // EN: Always reset states, even if no target
      if (!dragTarget) {
        console.log('❌ No drag target, resetting states');
        setDragTarget(null);
        setDraggedNodeId(null);
        setDraggedDescendants([]);
        setGhostNode(null);
        return;
      }

      // FR: Rattacher le nœud
      // EN: Reattach the node
      console.log(`🔄 Rattachement: ${node.id} → ${dragTarget}`);

      // FR: Utiliser la commande ReparentNodeCommand pour undo/redo
      // EN: Use ReparentNodeCommand for undo/redo
      const openFiles = useOpenFiles.getState().openFiles;
      const active = openFiles.find(f => f.isActive);

      if (active && active.content) {
        const command = new ReparentNodeCommand(node.id, dragTarget);
        const currentMap = active.content as any;
        const newMap = command.execute(currentMap);

        if (active.history) {
          active.history.addCommand(command);
          console.log('📝 Command added: ReparentNode', {
            nodeId: node.id,
            newParentId: dragTarget,
            canUndo: active.history.canUndo(),
          });
        }

        // FR: Mettre à jour l'état
        // EN: Update state
        useOpenFiles.setState(state => ({
          openFiles: state.openFiles.map(f => (f.isActive ? { ...f, content: newMap } : f)),
        }));
      }

      console.log('✅ Nœud rattaché avec succès');
      setDragTarget(null);
      setDraggedNodeId(null);
      setDraggedDescendants([]);
      setGhostNode(null);
    },
    [dragTarget]
  );

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

      const key = e.key;
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
      const parentId: string | null = current.parentId;
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
        return;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [activeFile, selectedNodeId, setSelectedNodeId, getShortcut, addSiblingToActive]);

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

  // Follow: center on selected node
  useEffect(() => {
    if (!followSelection) return;
    if (!selectedNodeId) return;
    const n = nodesRef.current.find(nn => nn.id === selectedNodeId);
    const inst = instanceRef.current;
    if (!n || !inst) return;
    const width = (n.data as any)?.width || 200;
    const height = (n.data as any)?.height || 40;
    const x = (n.position?.x || 0) + width / 2;
    const y = (n.position?.y || 0) + height / 2;
    try {
      if (typeof inst.setCenter === 'function') {
        inst.setCenter(x, y, { zoom: inst.getZoom?.() || 1, duration: 300 });
      }
    } catch (e) {
      // Ignore errors
    }
  }, [selectedNodeId, followSelection]);

  // FR: Écouter les événements de clignotement depuis l'explorateur pour centrer sur le nœud
  // EN: Listen for blinking events from the explorer to center on the node
  useEffect(() => {
    const handleNodeBlink = (event: CustomEvent) => {
      const { nodeId } = event.detail;
      if (!instanceRef.current) return;

      const inst = instanceRef.current;
      const node = inst.getNode(nodeId);
      if (!node) return;

      // Centrer sur le nœud avec une animation fluide
      const width = (node.data as any)?.width || 200;
      const height = (node.data as any)?.height || 40;
      const x = (node.position?.x || 0) + width / 2;
      const y = (node.position?.y || 0) + height / 2;

      try {
        if (typeof inst.setCenter === 'function') {
          inst.setCenter(x, y, { zoom: inst.getZoom?.() || 1, duration: 500 });
        }
      } catch (e) {
        // Ignore errors
      }
    };

    window.addEventListener('node-blink', handleNodeBlink as EventListener);
    return () => {
      window.removeEventListener('node-blink', handleNodeBlink as EventListener);
    };
  }, []);

  // FR: Synchroniser le zoom avec l'instance ReactFlow (toujours appelé, indépendamment du fichier actif)
  // EN: Sync zoom with ReactFlow instance (always called, regardless of active file)
  // FR: Désactiver la synchronisation directe du zoom pour éviter l'erreur setZoom inexistante
  // EN: Disable direct zoom sync to avoid setZoom undefined error

  if (!activeFile) {
    return (
      <div className="mindmap-canvas" style={{ width: '100%', height: '100%', minHeight: '400px' }}>
        <div className="no-file-message">
          <h3>Aucun fichier ouvert</h3>
          <p>Ouvrez un fichier .mm ou .xmind pour voir la carte mentale</p>
          <p>Utilisez le menu Fichier → Ouvrir...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mindmap-canvas"
      ref={reactFlowWrapper}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        backgroundColor: activeFile?.mapStyle?.backgroundColor || '#ffffff',
        position: 'relative',
      }}
    >
      {/* FR: Motif de fond */}
      {/* EN: Background pattern */}
      {activeFile?.mapStyle?.backgroundPattern &&
        activeFile?.mapStyle?.backgroundPattern !== 'none' && (
          <div style={backgroundPatternStyle} />
        )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodesDraggable={nodesDraggable}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        attributionPosition="bottom-left"
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        onInit={inst => {
          instanceRef.current = inst;
          setFlowInstance(inst);
        }}
      >
        <Background />
        {/* Controls retirés: le zoom est géré dans la StatusBar */}
        <MiniMap position="top-right" />
      </ReactFlow>

      {contextMenu && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          isCollapsed={Boolean(activeFile?.content?.nodes?.[contextMenu.nodeId]?.collapsed)}
          hasChildren={
            (activeFile?.content?.nodes?.[contextMenu.nodeId]?.children?.length || 0) > 0
          }
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onToggleCollapse={(nodeId: string) => {
            const node = activeFile?.content?.nodes?.[nodeId];
            if (!node) return;
            updateActiveFileNode(nodeId, { collapsed: !node.collapsed });
          }}
          onToggleCollapseSiblings={(nodeId: string) => {
            const node = activeFile?.content?.nodes?.[nodeId];
            if (!node || !node.parentId) return;
            const parent = activeFile?.content?.nodes?.[node.parentId];
            if (!parent?.children) return;
            parent.children.forEach((cid: string) => {
              const child = activeFile?.content?.nodes?.[cid];
              if (!child) return;
              updateActiveFileNode(cid, { collapsed: !child.collapsed });
            });
          }}
          onToggleCollapseGeneration={(nodeId: string) => {
            // FR: Replier tous les nœuds de niveau > N (où N est le niveau du nœud cliqué)
            // EN: Collapse all nodes at depth > N (where N is the clicked node's depth)
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

              const children: string[] = Array.isArray(currentNode.children)
                ? currentNode.children
                : [];
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
          }}
          onExpand={(nodeId: string) => {
            // FR: Déplier le nœud (forcer collapsed: false)
            // EN: Expand the node (force collapsed: false)
            updateActiveFileNode(nodeId, { collapsed: false });
          }}
          onExpandSiblings={(nodeId: string) => {
            // FR: Déplier tous les frères du nœud
            // EN: Expand all siblings of the node
            const node = activeFile?.content?.nodes?.[nodeId];
            if (!node || !node.parentId) return;
            const parent = activeFile?.content?.nodes?.[node.parentId];
            if (!parent?.children) return;
            parent.children.forEach((cid: string) => {
              updateActiveFileNode(cid, { collapsed: false });
            });
          }}
          onExpandGeneration={(nodeId: string) => {
            // FR: Déplier l'arbre jusqu'au niveau N (inclus) et replier tout ce qui est au-delà
            // EN: Expand tree up to level N (inclusive) and collapse everything beyond
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

              const children: string[] = Array.isArray(currentNode.children)
                ? currentNode.children
                : [];
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
          }}
          onCopy={(nodeId: string) => copyNode(nodeId)}
          onPaste={(nodeId: string) => pasteNode(nodeId)}
          canPaste={canPaste()}
        />
      )}
    </div>
  );
}

export default MindMapCanvas;
