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
import { useReactFlowNodes } from '../hooks/useReactFlowNodes';
import { useReactFlowEdges } from '../hooks/useReactFlowEdges';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useContextMenuHandlers } from '../hooks/useContextMenuHandlers';
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
  const setSelectedNodeId = useSelection(s => s.setSelectedNodeId);
  const followSelection = useCanvasOptions(s => s.followSelection);
  const updateActiveFileNode = useOpenFiles(s => s.updateActiveFileNode);

  // FR: Hook pour le drag & drop
  // EN: Hook for drag & drop
  const {
    draggedNodeId,
    draggedDescendants,
    dragTarget,
    ghostNode,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  } = useDragAndDrop({
    activeFile,
    instanceRef,
  });

  // FR: Hook pour les handlers du menu contextuel
  // EN: Hook for context menu handlers
  const {
    onToggleCollapse,
    onToggleCollapseSiblings,
    onToggleCollapseGeneration,
    onExpand,
    onExpandSiblings,
    onExpandGeneration,
  } = useContextMenuHandlers({
    activeFile,
    updateActiveFileNode,
  });

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

  // FR: Hook pour convertir les nœuds BigMind en nœuds ReactFlow
  // EN: Hook to convert BigMind nodes to ReactFlow nodes
  const { convertToReactFlowNodes } = useReactFlowNodes({
    activeFile,
    nodesWithColors,
    dragTarget,
    draggedDescendants,
    ghostNode,
    draggedNodeId,
  });

  // FR: Hook pour convertir les connexions BigMind en arêtes ReactFlow
  // EN: Hook to convert BigMind connections to ReactFlow edges
  const { convertToReactFlowEdges } = useReactFlowEdges({
    activeFile,
    nodesWithColors,
    draggedNodeId,
    ghostNode,
    draggedDescendants,
    linkStyle: activeFile?.mapStyle?.linkStyle,
  });

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

  // Drag & drop handlers imported from useDragAndDrop hook

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
          onToggleCollapse={onToggleCollapse}
          onToggleCollapseSiblings={onToggleCollapseSiblings}
          onToggleCollapseGeneration={onToggleCollapseGeneration}
          onExpand={onExpand}
          onExpandSiblings={onExpandSiblings}
          onExpandGeneration={onExpandGeneration}
          onCopy={(nodeId: string) => copyNode(nodeId)}
          onPaste={(nodeId: string) => pasteNode(nodeId)}
          canPaste={canPaste()}
        />
      )}
    </div>
  );
}

export default MindMapCanvas;
