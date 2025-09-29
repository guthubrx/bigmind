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
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useViewport } from '../hooks/useViewport';
import MindMapNode from './MindMapNode';
import MindMapEdge from './MindMapEdge';

// FR: Types de nœuds personnalisés
// EN: Custom node types
const nodeTypes: NodeTypes = {
  mindmap: MindMapNode,
};

// FR: Types d'arêtes personnalisés
// EN: Custom edge types
const edgeTypes: EdgeTypes = {
  mindmap: MindMapEdge,
};

const MindMapCanvas: React.FC = () => {
  const activeFile = useOpenFiles((state) => state.openFiles.find(f => f.isActive) || null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const zoom = useViewport((s) => s.zoom);
  const setZoom = useViewport((s) => s.setZoom);

  // FR: Ajouter des logs de debug
  // EN: Add debug logs
  console.log('🎨 MindMapCanvas - activeFile:', activeFile);
  console.log('🎨 MindMapCanvas - content:', activeFile?.content);
  console.log('🎨 MindMapCanvas - nodes:', activeFile?.content?.nodes);

  // FR: Convertir les nœuds du fichier actif en nœuds ReactFlow
  // EN: Convert active file nodes to ReactFlow nodes
  const convertToReactFlowNodes = useCallback((): Node[] => {
    console.log('🎨 convertToReactFlowNodes appelé');
    if (!activeFile?.content?.nodes) {
      console.log('❌ Pas de nodes dans activeFile.content');
      return [];
    }

    const nodes: Node[] = [];
    
    // FR: Le parser XMind crée rootNode, pas nodes.root
    // EN: XMind parser creates rootNode, not nodes.root
    const rootNode = activeFile.content.rootNode || activeFile.content.nodes?.root;
    
    if (!rootNode) {
      console.log('❌ Pas de nœud racine');
      console.log('🔍 Structure disponible:', Object.keys(activeFile.content));
      console.log('🔍 rootNode disponible:', activeFile.content.rootNode);
      console.log('🔍 nodes.root disponible:', activeFile.content.nodes?.root);
      return [];
    }

    // FR: Ajouter le nœud racine au centre
    // EN: Add root node in center
    nodes.push({
      id: rootNode.id,
      type: 'mindmap',
      position: { x: 0, y: 0 },
      data: {
        id: rootNode.id,
        title: rootNode.title,
        parentId: null,
        children: rootNode.children || [],
        style: rootNode.style,
        isSelected: false,
        isPrimary: true
      },
    });

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
      if (!node.children || node.children.length === 0) {
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
          direction
        },
      });

      if (!node.children || node.children.length === 0) return;

      const childIds: string[] = node.children;
      if (level === 0) {
        // FR: Au niveau racine: répartition alternée droite/gauche, chaque côté conserve l'ordre vertical et sa propre bande
        const rightIds: string[] = [];
        const leftIds: string[] = [];
        childIds.forEach((id, idx) => (idx % 2 === 0 ? rightIds : leftIds).push(id));

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
        // FR: Conserver l'ordre et la direction du parent; chaque sous-arbre obtient une bande consécutive
        let currentY = baseY;
        childIds.forEach((childId: string) => {
          const ch = subtreeHeightById[childId] || (LINE_HEIGHT + NODE_VPAD);
          positionSubtree(activeFile.content.nodes[childId], level + 1, direction, currentY);
          currentY += ch + SIBLING_GAP;
        });
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
    
    console.log('✅ Nœuds ReactFlow créés:', nodes.length, nodes);
    console.log('🔍 Premier nœud:', nodes[0]);
    console.log('🔍 Position du premier nœud:', nodes[0]?.position);
    return nodes;
  }, [activeFile]);

  // FR: Convertir les connexions en arêtes ReactFlow
  // EN: Convert connections to ReactFlow edges
  const convertToReactFlowEdges = useCallback((): Edge[] => {
    console.log('🔗 convertToReactFlowEdges appelé');
    if (!activeFile?.content?.nodes) {
      console.log('❌ Pas de nodes dans activeFile.content');
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
      if (!node.children || node.children.length === 0) return;

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

    console.log('✅ Arêtes ReactFlow créées:', edges.length);
    return edges;
  }, [activeFile]);

  const initialNodes = useMemo(() => convertToReactFlowNodes(), [convertToReactFlowNodes]);
  const initialEdges = useMemo(() => convertToReactFlowEdges(), [convertToReactFlowEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // FR: Mettre à jour les nœuds quand le fichier actif change
  // EN: Update nodes when active file changes
  React.useEffect(() => {
    console.log('🔄 useEffect - Mise à jour des nœuds ReactFlow');
    const newNodes = convertToReactFlowNodes();
    const newEdges = convertToReactFlowEdges();
    console.log('🔄 Nouveaux nœuds:', newNodes.length);
    console.log('🔄 Nouvelles arêtes:', newEdges.length);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [activeFile, convertToReactFlowNodes, convertToReactFlowEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // FR: Synchroniser le zoom avec l'instance ReactFlow (toujours appelé, indépendamment du fichier actif)
  // EN: Sync zoom with ReactFlow instance (always called, regardless of active file)
  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setZoom(zoom);
    }
  }, [zoom]);

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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        onInit={(inst) => { instanceRef.current = inst; inst.setZoom(zoom); inst.on('move', (vp) => setZoom(vp.zoom)); }}
      >
        <Background />
        {/* Controls retirés: le zoom est géré dans la StatusBar */}
        <MiniMap position="top-right" />
      </ReactFlow>
    </div>
  );
};

export default MindMapCanvas;