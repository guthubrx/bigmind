/**
 * FR: Composant principal du canvas de carte mentale
 * EN: Main mind map canvas component
 */

import React, { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  SelectionMode,
  PanOnScrollMode,
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
import { useAppSettings } from '../hooks/useAppSettings';
import { getBackgroundPatternStyle } from '../utils/backgroundPatterns';
import { useReactFlowNodes } from '../hooks/useReactFlowNodes';
import { useReactFlowEdges } from '../hooks/useReactFlowEdges';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useContextMenuHandlers } from '../hooks/useContextMenuHandlers';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useColorInference } from '../hooks/useColorInference';
import NodeContextMenu from './NodeContextMenu';
import { useMindmap } from '../hooks/useMindmap';
import { AddTagCommand, RemoveTagCommand } from '@bigmind/core';

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
  const setSelectedNodeIds = useSelection(s => s.setSelectedNodeIds);
  const selectedNodeIds = useSelection(s => s.selectedNodeIds);
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

  // FR: Hook pour la gestion des tags
  // EN: Hook for tag management
  const { mindMap, actions } = useMindmap();
  // FR: Palette par carte (fallback globale)
  // EN: Per-map palette (global fallback)
  const perMapPaletteId =
    useOpenFiles(s => s.openFiles.find(f => f.isActive)?.paletteId) || selectedPaletteGlobal;

  // FR: Hook pour l'inférence de couleurs par branche
  // EN: Hook for branch color inference
  const { nodesWithColors } = useColorInference({
    activeFile,
    perMapPaletteId,
  });

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

  // FR: Hook pour la navigation clavier
  // EN: Hook for keyboard navigation
  useKeyboardNavigation({
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
  });

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
  // Keyboard navigation imported from useKeyboardNavigation hook

  // Follow: center on selected node
  useEffect(() => {
    if (!followSelection) return;
    if (!selectedNodeId) return;
    const n = nodes.find(nn => nn.id === selectedNodeId);
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
  }, [selectedNodeId, followSelection, nodes]);

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

  // FR: Écouter les événements de focus depuis l'explorateur pour centrer et zoomer optimalement
  // EN: Listen for focus events from the explorer to center and zoom optimally
  useEffect(() => {
    const handleNodeFocus = (event: CustomEvent) => {
      const { nodeId } = event.detail;
      if (!instanceRef.current || !activeFile) return;

      const inst = instanceRef.current;
      const node = inst.getNode(nodeId);
      if (!node) return;

      try {
        // FR: Trouver le nœud dans la carte mentale pour accéder à ses enfants
        // EN: Find the node in the mind map to access its children
        const mindMapNode = activeFile.content?.nodes?.[nodeId];
        if (!mindMapNode) return;

        // FR: Calculer la bounding box du nœud et de ses enfants de premier niveau
        // EN: Calculate bounding box of node and its first-level children
        const allNodesToShow = [nodeId, ...mindMapNode.children];
        const nodesToShow = allNodesToShow.map(id => inst.getNode(id)).filter(Boolean);
        
        if (nodesToShow.length === 0) return;

        // FR: Calculer les limites de la zone à afficher
        // EN: Calculate bounds of the area to display
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        nodesToShow.forEach(n => {
          if (!n.position) return;
          const width = (n.data as any)?.width || 200;
          const height = (n.data as any)?.height || 40;
          
          minX = Math.min(minX, n.position.x);
          maxX = Math.max(maxX, n.position.x + width);
          minY = Math.min(minY, n.position.y);
          maxY = Math.max(maxY, n.position.y + height);
        });

        // FR: Ajouter une marge de 20% autour de la zone
        // EN: Add 20% margin around the area
        const margin = 0.2;
        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;
        const marginX = totalWidth * margin;
        const marginY = totalHeight * margin;
        
        minX -= marginX;
        maxX += marginX;
        minY -= marginY;
        maxY += marginY;

        // FR: Calculer le centre de la zone
        // EN: Calculate center of the area
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // FR: Obtenir la taille du viewport
        // EN: Get viewport size
        const viewport = inst.getViewport();
        const viewportWidth = reactFlowWrapper.current?.clientWidth || 800;
        const viewportHeight = reactFlowWrapper.current?.clientHeight || 600;

        // FR: Calculer le zoom optimal pour faire tenir la zone dans le viewport
        // EN: Calculate optimal zoom to fit the area in the viewport
        const zoomX = viewportWidth / (maxX - minX);
        const zoomY = viewportHeight / (maxY - minY);
        const optimalZoom = Math.min(zoomX, zoomY, 2.0); // Limiter à 200% max
        const finalZoom = Math.max(optimalZoom, 0.1); // Limiter à 10% min

        // FR: Centrer sur la zone avec le zoom optimal
        // EN: Center on the area with optimal zoom
        if (typeof inst.setCenter === 'function') {
          inst.setCenter(centerX, centerY, { zoom: finalZoom, duration: 500 });
        }
      } catch (e) {
        // Ignore errors
      }
    };

    window.addEventListener('node-focus', handleNodeFocus as EventListener);
    return () => {
      window.removeEventListener('node-focus', handleNodeFocus as EventListener);
    };
  }, [activeFile]);

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
      role="application"
      aria-label="Mind map canvas"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        backgroundColor: activeFile?.mapStyle?.backgroundColor || '#ffffff',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none' as any,
        msUserSelect: 'none' as any,
        MozUserSelect: 'none' as any,
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
        onNodeClick={(event, node) => {
          // FR: Synchroniser la sélection avec notre hook useSelection
          // EN: Sync selection with our useSelection hook
          setSelectedNodeId(node.id);
        }}
        nodesDraggable={nodesDraggable}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        attributionPosition="bottom-left"
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        // FR: Panning avec la molette
        // EN: Panning with mouse wheel
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        panOnScrollSpeed={0.8}
        zoomOnScroll={false}
        // FR: Box selection
        // EN: Box selection
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        panOnDrag={false}
        onSelectionChange={({ nodes: selNodes }) => {
          // FR: NE PAS effacer notre sélection si ReactFlow n'a pas de sélection
          // EN: DON'T clear our selection if ReactFlow has no selection
          if (!selNodes || selNodes.length === 0) {
            // Garder la sélection actuelle de useSelection
            return;
          }
          const nodeIds = selNodes.map(node => node.id);
          // FR: Éviter les mises à jour inutiles si la sélection n'a pas changé
          // EN: Avoid unnecessary updates if selection hasn't changed
          if (JSON.stringify(nodeIds.sort()) !== JSON.stringify(selectedNodeIds.sort())) {
            setSelectedNodeIds(nodeIds);
          }
        }}
        onMouseDown={(e: any) => {
          if (e.button === 0) {
            document.body.classList.add('dragging');
          }
        }}
        onMouseUp={() => {
          document.body.classList.remove('dragging');
          try {
            const sel = window.getSelection && window.getSelection();
            if (sel && sel.removeAllRanges) sel.removeAllRanges();
            if ((sel as any)?.empty) (sel as any).empty();
          } catch (_e) {
            // Ignore selection errors
          }
        }}
        onMouseLeave={() => {
          document.body.classList.remove('dragging');
          try {
            const sel = window.getSelection && window.getSelection();
            if (sel && sel.removeAllRanges) sel.removeAllRanges();
            if ((sel as any)?.empty) (sel as any).empty();
          } catch (_e) {
            // Ignore selection errors
          }
        }}
        onViewportChange={(viewport) => {
          // FR: Émettre un événement personnalisé pour notifier les changements de viewport
          // EN: Emit custom event to notify viewport changes
          const viewportEvent = new CustomEvent('viewport-change', {
            detail: { viewport },
          });
          window.dispatchEvent(viewportEvent);
        }}
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
          // FR: Gestion des tags
          // EN: Tag management
          nodeTags={activeFile?.content?.nodes?.[contextMenu.nodeId]?.tags || []}
          allTags={activeFile ? Object.values(activeFile.content?.nodes || {}).flatMap(node => node.tags || []).filter((tag, index, array) => array.indexOf(tag) === index) : []}
          onAddTag={(nodeId: string, tag: string) => {
            if (!activeFile?.content) return;
            const command = new AddTagCommand(nodeId, tag);
            const newMap = command.execute(activeFile.content);
            useOpenFiles.setState((state) => ({
              openFiles: state.openFiles.map(f =>
                f.id === activeFile.id ? { ...f, content: newMap } : f
              )
            }));
          }}
          onRemoveTag={(nodeId: string, tag: string) => {
            if (!activeFile?.content) return;
            const command = new RemoveTagCommand(nodeId, tag);
            const newMap = command.execute(activeFile.content);
            useOpenFiles.setState((state) => ({
              openFiles: state.openFiles.map(f =>
                f.id === activeFile.id ? { ...f, content: newMap } : f
              )
            }));
          }}
        />
      )}
    </div>
  );
}

export default MindMapCanvas;
