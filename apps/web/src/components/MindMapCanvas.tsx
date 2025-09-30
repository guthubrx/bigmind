/**
 * FR: Composant principal du canvas de carte mentale
 * EN: Main mind map canvas component
 */

import React, { useCallback, useRef, useMemo, useEffect } from 'react';
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
  const activeFile = useOpenFiles((state) => state.openFiles.find(f => f.isActive) || null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const setFlowInstance = useFlowInstance((s) => s.setInstance);
  // const zoom = useViewport((s) => s.zoom);
  // const setZoom = useViewport((s) => s.setZoom);
  const nodesDraggable = useCanvasOptions((s) => s.nodesDraggable);
  const followSelection = useCanvasOptions((s) => s.followSelection);
  const selectedNodeId = useSelection((s) => s.selectedNodeId);
  const setSelectedNodeId = useSelection((s) => s.setSelectedNodeId);
  const addChildToActive = useOpenFiles((s) => s.addChildToActive);
  const updateActiveFileNode = useOpenFiles((s) => s.updateActiveFileNode);
  const addSiblingToActive = useOpenFiles((s) => s.addSiblingToActive);
  const removeNodeFromActive = useOpenFiles((s) => s.removeNodeFromActive);
  const getShortcut = useShortcuts((s) => s.getShortcut);

  // Debug logs removed for cleanliness

  // FR: Convertir les nœuds du fichier actif en nœuds ReactFlow
  // EN: Convert active file nodes to ReactFlow nodes
  const convertToReactFlowNodes = useCallback((): Node[] => {
    // console.warn('convertToReactFlowNodes called');
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
      words.forEach((w) => {
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
        const childNode = activeFile.content.nodes[childId];
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
      const totalHeight = subtreeHeightById[node.id] || (LINE_HEIGHT + NODE_VPAD);
      const x = level === 0 ? 0 : direction * level * LEVEL_WIDTH;
      const nodeCenterY = baseY + totalHeight / 2 - nodeOwnHeightById[node.id] / 2;

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
          isSelected: false,
          isPrimary: level === 0,
          direction,
          childCounts: { total: (node.children?.length || 0) }
        },
      });

      // Si replié, ne pas positionner les enfants
      if (node.collapsed || !node.children || node.children.length === 0) return;

      const childIds: string[] = node.children;
      if (childIds.length === 1) {
        // FR: Cas enfant unique: aligner verticalement le centre de l'enfant sur le parent
        // EN: Single child: align child's center with parent's center
        const onlyId = childIds[0];
        const ch = subtreeHeightById[onlyId] || (LINE_HEIGHT + NODE_VPAD);
        const parentCenterY = nodeCenterY + (nodeOwnHeightById[node.id] || (LINE_HEIGHT + NODE_VPAD)) / 2;
        // FR: Respecter la bande verticale allouée pour éviter de chevaucher d'autres branches
        // EN: Respect allocated vertical band to avoid overlapping other branches
        const bandStart = baseY;
        const bandEnd = baseY + totalHeight;
        let base = parentCenterY - ch / 2;
        if (base < bandStart) base = bandStart;
        if (base + ch > bandEnd) base = Math.max(bandStart, bandEnd - ch);
        const childNode = activeFile.content.nodes[onlyId];
        const childDirection = level === 0 ? (direction === 0 ? +1 : direction) : direction;
        positionSubtree(childNode, level + 1, childDirection, base);
      } else if (level === 0) {
        // FR: Au niveau racine: répartition alternée droite/gauche, chaque côté conserve l'ordre vertical et sa propre bande
        const rightIds: string[] = [];
        const leftIds: string[] = [];
        childIds.forEach((id, idx) => (idx % 2 === 0 ? rightIds : leftIds).push(id));

        // FR: Injecter les compteurs gauche/droite sur la racine
        const rootIndex = nodes.findIndex((n) => n.id === node.id);
        if (rootIndex !== -1) {
          (nodes[rootIndex].data as any).childCounts = {
            left: leftIds.length,
            right: rightIds.length,
            total: childIds.length,
          };
        }

        // Droite
        let offsetRight = nodeCenterY - (rightIds.reduce((acc, id) => acc + (subtreeHeightById[id] || (LINE_HEIGHT + NODE_VPAD)), 0) + SIBLING_GAP * Math.max(0, rightIds.length - 1)) / 2;
        rightIds.forEach((childId) => {
          const ch = subtreeHeightById[childId] || (LINE_HEIGHT + NODE_VPAD);
          positionSubtree(activeFile.content.nodes[childId], level + 1, +1, offsetRight);
          offsetRight += ch + SIBLING_GAP;
        });

        // Gauche
        let offsetLeft = nodeCenterY - (leftIds.reduce((acc, id) => acc + (subtreeHeightById[id] || (LINE_HEIGHT + NODE_VPAD)), 0) + SIBLING_GAP * Math.max(0, leftIds.length - 1)) / 2;
        leftIds.forEach((childId) => {
          const ch = subtreeHeightById[childId] || (LINE_HEIGHT + NODE_VPAD);
          positionSubtree(activeFile.content.nodes[childId], level + 1, -1, offsetLeft);
          offsetLeft += ch + SIBLING_GAP;
        });
      } else {
        // FR: Conserver l'ordre et la direction du parent
        if (childIds.length === 1) {
          // FR: Alignement au centre pour enfant unique
          const onlyId = childIds[0];
          const ch = subtreeHeightById[onlyId] || (LINE_HEIGHT + NODE_VPAD);
          const parentCenterY = nodeCenterY + ((nodeOwnHeightById[node.id] || (LINE_HEIGHT + NODE_VPAD)) / 2);
          const start = parentCenterY - ch / 2;
          positionSubtree(activeFile.content.nodes[onlyId], level + 1, direction, start);
        } else {
          let currentY = baseY;
          childIds.forEach((childId: string) => {
            const ch = subtreeHeightById[childId] || (LINE_HEIGHT + NODE_VPAD);
            positionSubtree(activeFile.content.nodes[childId], level + 1, direction, currentY);
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
          const childNode = activeFile.content.nodes[childId];
          if (childNode) {
            fixParentIds(childNode, node.id);
          }
        });
      }
    };
    
    fixParentIds(rootNode);
    
    // console.warn('ReactFlow nodes created:', nodes.length);
    return nodes;
  }, [activeFile]);

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

        rightIds.forEach((childId) => {
          edges.push({
            id: `edge-${node.id}-${childId}`,
            source: node.id,
            target: childId,
            sourceHandle: 'right',
            type: 'smoothstep',
            style: { stroke: '#dc2626', strokeWidth: 2 },
            data: { isSelected: false, parentId: node.id, childId },
          });
          const childNode = activeFile.content.nodes[childId];
          if (childNode) createConnections(childNode, level + 1, +1);
        });

        leftIds.forEach((childId) => {
          edges.push({
            id: `edge-${node.id}-${childId}`,
            source: node.id,
            target: childId,
            sourceHandle: 'left',
            type: 'smoothstep',
            style: { stroke: '#dc2626', strokeWidth: 2 },
            data: { isSelected: false, parentId: node.id, childId },
          });
          const childNode = activeFile.content.nodes[childId];
          if (childNode) createConnections(childNode, level + 1, -1);
        });
      } else {
        // FR: Aux niveaux > 0, conserver la direction du parent
        const handleId = direction === -1 ? 'left' : 'right';
        childIds.forEach((childId) => {
          edges.push({
            id: `edge-${node.id}-${childId}`,
            source: node.id,
            target: childId,
            sourceHandle: handleId,
            type: 'smoothstep',
            style: { stroke: '#dc2626', strokeWidth: 2 },
            data: { isSelected: false, parentId: node.id, childId },
          });
          const childNode = activeFile.content.nodes[childId];
          if (childNode) createConnections(childNode, level + 1, direction);
        });
      }
    };

    // FR: Commencer par le nœud racine
    // EN: Start with root node
    createConnections(rootNode, 0, 0);

    // console.warn('Edges created:', edges.length);
    return edges;
  }, [activeFile]);

  const initialNodes = useMemo(() => convertToReactFlowNodes(), [convertToReactFlowNodes]);
  const initialEdges = useMemo(() => convertToReactFlowEdges(), [convertToReactFlowEdges]);

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
  }, [activeFile, activeFile?.content?.nodes, convertToReactFlowNodes, convertToReactFlowEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // FR: Navigation clavier dans l'arborescence avec les flèches
  // EN: Keyboard navigation in the tree using arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!activeFile?.content?.nodes) return;
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
        const currentId: string = selectedNodeId || activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
        if (!currentId) return;
        e.preventDefault();
        const newId = addSiblingToActive(currentId, 'Nouveau nœud');
        if (newId) setSelectedNodeId(newId);
        return;
      }
      if (key === ' ') {
        // Espace: toggle collapse/expand of current node descendants
        if (!activeFile?.content?.nodes) return;
        const rootIdSpace: string = activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
        const currentIdSpace: string = selectedNodeId || rootIdSpace;
        if (!currentIdSpace) return;
        e.preventDefault();
        const nodesMapAny: any = activeFile.content.nodes;
        const cur = nodesMapAny[currentIdSpace];
        const newCollapsed = !cur?.collapsed;
        updateActiveFileNode(currentIdSpace, { collapsed: newCollapsed });
        return;
      }
      if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight') return;
      const nodesMap: any = activeFile.content.nodes;
      // pick current or root
      const rootId: string = activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
      const currentId: string = selectedNodeId || rootId;
      const current = nodesMap[currentId];
      if (!current) return;
      e.preventDefault();

      const select = (id?: string) => { if (id && nodesMap[id]) setSelectedNodeId(id); };

      const positioned = nodesRef.current;
      const curNode = positioned.find((n) => n.id === currentId);
      const curX = curNode?.position?.x || 0;
      const isLeftSide = currentId !== rootId && curX < 0;

      const gotoClosestChild = () => {
        const childIds: string[] = current.children || [];
        if (childIds.length === 0) return;
        if (currentId === rootId) {
          // root: choose by side using key
          const desiredRight = key === 'ArrowRight';
          let candidates = childIds.filter((cid) => {
            const c = positioned.find((n) => n.id === cid);
            return desiredRight ? (c?.position?.x || 0) > 0 : (c?.position?.x || 0) < 0;
          });
          if (candidates.length === 0) candidates = childIds;
          // pick nearest in Euclidean distance
          const curCenterX = (curNode?.position?.x || 0) + (((curNode?.data as any)?.width || 200) / 2);
          const curCenterY = (curNode?.position?.y || 0) + (((curNode?.data as any)?.height || 40) / 2);
          let bestId: string | undefined; let bestD = Number.POSITIVE_INFINITY;
          for (const cid of candidates) {
            const c = positioned.find((n) => n.id === cid);
            if (!c) continue;
            const cx = (c.position?.x || 0) + (((c.data as any)?.width || 200) / 2);
            const cy = (c.position?.y || 0) + (((c.data as any)?.height || 40) / 2);
            const dx = cx - curCenterX; const dy = cy - curCenterY;
            const d2 = dx*dx + dy*dy;
            if (d2 < bestD) { bestD = d2; bestId = cid; }
          }
          select(bestId || candidates[0]);
          return;
        }
        // non-root: closest child irrespective of side
        const curCenterX = (curNode?.position?.x || 0) + (((curNode?.data as any)?.width || 200) / 2);
        const curCenterY = (curNode?.position?.y || 0) + (((curNode?.data as any)?.height || 40) / 2);
        let bestId: string | undefined; let bestD = Number.POSITIVE_INFINITY;
        for (const cid of childIds) {
          const c = positioned.find((n) => n.id === cid);
          if (!c) continue;
          const cx = (c.position?.x || 0) + (((c.data as any)?.width || 200) / 2);
          const cy = (c.position?.y || 0) + (((c.data as any)?.height || 40) / 2);
          const dx = cx - curCenterX; const dy = cy - curCenterY;
          const d2 = dx*dx + dy*dy;
          if (d2 < bestD) { bestD = d2; bestId = cid; }
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
          if (key === 'ArrowRight') { goParent(); return; }
          if (key === 'ArrowLeft') { gotoClosestChild(); return; }
        } else {
          // Right side: Left -> parent, Right -> child
          if (key === 'ArrowLeft') { goParent(); return; }
          if (key === 'ArrowRight') { gotoClosestChild(); return; }
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
            const curNodeA = positionedA.find((n) => n.id === currentId);
            const curCY = ((curNodeA?.position?.y || 0) + ((curNodeA?.data as any)?.height || 40) / 2);
            let bestId: string | undefined;
            let bestDY = Number.POSITIVE_INFINITY;
            // parcourir les parents précédents (du plus proche au plus lointain)
            for (let i = pIdx - 1; i >= 0; i -= 1) {
              const cousinParentId = parentSiblings[i];
              const cousinChildren: string[] = (nodesMap[cousinParentId]?.children) || [];
              for (let j = 0; j < cousinChildren.length; j += 1) {
                const cid = cousinChildren[j];
                const n = positionedA.find((nn) => nn.id === cid);
                if (n) {
                  const cy = (n.position?.y || 0) + ((n.data as any)?.height || 40) / 2;
                  const dy = Math.abs(cy - curCY);
                  if (dy < bestDY) { bestDY = dy; bestId = cid; }
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
            const curNodeB = positionedB.find((n) => n.id === currentId);
            const curCY = ((curNodeB?.position?.y || 0) + ((curNodeB?.data as any)?.height || 40) / 2);
            let bestId: string | undefined;
            let bestDY = Number.POSITIVE_INFINITY;
            // parcourir les parents suivants (du plus proche au plus lointain)
            for (let i = pIdx + 1; i < parentSiblings.length; i += 1) {
              const cousinParentId = parentSiblings[i];
              const cousinChildren: string[] = (nodesMap[cousinParentId]?.children) || [];
              for (let j = 0; j < cousinChildren.length; j += 1) {
                const cid = cousinChildren[j];
                const n = positionedB.find((nn) => nn.id === cid);
                if (n) {
                  const cy = (n.position?.y || 0) + ((n.data as any)?.height || 40) / 2;
                  const dy = Math.abs(cy - curCY);
                  if (dy < bestDY) { bestDY = dy; bestId = cid; }
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
      const parentId: string = selectedNodeId || activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
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
      const currentId: string | undefined = selectedNodeId || activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
      if (!currentId) return;
      // Ne pas supprimer la racine
      const rootId: string | undefined = activeFile.content.rootNode?.id || activeFile.content.nodes?.root?.id;
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
    const n = nodesRef.current.find((nn) => nn.id === selectedNodeId);
    const inst = instanceRef.current;
    if (!n || !inst) return;
    const width = ((n.data as any)?.width || 200);
    const height = ((n.data as any)?.height || 40);
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
    <div className="mindmap-canvas" ref={reactFlowWrapper} style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodesDraggable={nodesDraggable}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        onInit={(inst) => { instanceRef.current = inst; setFlowInstance(inst); }}
      >
        <Background />
        {/* Controls retirés: le zoom est géré dans la StatusBar */}
        <MiniMap position="top-right" />
      </ReactFlow>
    </div>
  );
}

export default MindMapCanvas;