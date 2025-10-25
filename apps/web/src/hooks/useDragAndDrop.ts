/**
 * FR: Hook pour gérer le drag & drop des nœuds
 * EN: Hook to manage node drag & drop
 */
/* eslint-disable no-console */

import { useCallback, useState } from 'react';
import type { Node } from '@xyflow/react';
import { useOpenFiles } from './useOpenFiles';
import { getAllDescendants } from '../utils/nodeUtils';
import type { OpenFile } from './useOpenFiles';
import { ReparentNodeCommand } from '@bigmind/core';

interface UseDragAndDropParams {
  activeFile: OpenFile | null;
  instanceRef: React.MutableRefObject<any>;
}

interface UseDragAndDropReturn {
  draggedNodeId: string | null;
  draggedDescendants: string[];
  dragTarget: string | null;
  ghostNode: Node | null;
  dragMode: 'reparent' | 'free';
  setDragMode: (mode: 'reparent' | 'free') => void;
  onNodeDragStart: (event: React.MouseEvent, node: Node) => void;
  onNodeDrag: (event: React.MouseEvent, node: Node) => void;
  onNodeDragStop: (event: React.MouseEvent, node: Node) => void;
}

/**
 * FR: Hook pour gérer le drag & drop des nœuds dans la carte mentale
 * EN: Hook to manage node drag & drop in the mind map
 */
export function useDragAndDrop({
  activeFile,
  instanceRef,
}: UseDragAndDropParams): UseDragAndDropReturn {
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [draggedDescendants, setDraggedDescendants] = useState<string[]>([]);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [ghostNode, setGhostNode] = useState<Node | null>(null);
  const [dragMode, setDragMode] = useState<'reparent' | 'free'>('free');

  // FR: Tolérance de drag pour détecter la cible (en pixels)
  // EN: Drag tolerance to detect target (in pixels)
  const dragTolerance = 50;

  // FR: Réinitialiser les états de drag
  // EN: Reset drag states
  const resetStates = useCallback(() => {
    setDraggedNodeId(null);
    setDraggedDescendants([]);
    setDragTarget(null);
    setGhostNode(null);
  }, []);

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
      console.log('🖱️ onNodeDrag triggered for node:', node.id, 'mode:', dragMode);

      // FR: Utiliser React Flow pour trouver la position de la souris
      // EN: Use React Flow to find mouse position
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

      if (dragMode === 'free') {
        // FR: Mode déplacement libre - pas de cible de reparenting
        // EN: Free movement mode - no reparenting target
        setDragTarget(null);
        return;
      }

      // FR: Mode reparenting - trouver le nœud cible
      // EN: Reparenting mode - find target node
      const allNodes = instanceRef.current.getNodes();
      let closestNode: Node | null = null;
      let minDistance = Infinity;

      allNodes.forEach((flowNode: Node) => {
        if (flowNode.id === node.id) return; // FR: Ignorer le nœud qu'on glisse / EN: Ignore the dragged node

        const nodeX = flowNode.position.x;
        const nodeY = flowNode.position.y;
        const nodeWidth = 200; // FR: Largeur fixe des nœuds / EN: Fixed node width
        const nodeHeight = 50; // FR: Hauteur approximative / EN: Approximate height
        const tolerance = dragTolerance; // FR: Zone de tolérance en pixels / EN: Tolerance zone in pixels

        // FR: Vérifier si la position de la souris est dans les limites du nœud + tolérance
        // EN: Check if mouse position is within node bounds + tolerance
        if (
          position.x >= nodeX - tolerance &&
          position.x <= nodeX + nodeWidth + tolerance &&
          position.y >= nodeY - tolerance &&
          position.y <= nodeY + nodeHeight + tolerance
        ) {
          const centerX = nodeX + nodeWidth / 2;
          const centerY = nodeY + nodeHeight / 2;
          const distance = Math.sqrt((position.x - centerX) ** 2 + (position.y - centerY) ** 2);

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

      setDragTarget(targetNode.id);
    },
    [dragMode, dragTolerance, instanceRef]
  );

  // FR: Gérer la fin du drag des nœuds
  // EN: Handle node drag stop
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // resetStates est appelé à la fin de la fonction
      console.log('🛑 onNodeDragStop triggered for node:', node.id);
      const active = activeFile;

      if (!active || !active.content?.nodes) {
        console.log('❌ No active file');
        resetStates();
        return;
      }

      if (dragMode === 'free') {
        // FR: Mode déplacement libre - mettre à jour la position du nœud et son arborescence
        // EN: Free movement mode - update node position and its subtree

        // FR: Obtenir la nouvelle position depuis React Flow
        // EN: Get new position from React Flow
        const position = instanceRef.current?.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        if (!position) {
          console.log('❌ Could not get new position');
          resetStates();
          return;
        }

        // FR: Calculer le décalage depuis la position d'origine
        // EN: Calculate offset from original position
        const originalNode = active.content.nodes[node.id];
        if (!originalNode) {
          console.log('❌ Original node not found');
          resetStates();
          return;
        }

        const offset = {
          x: position.x - (originalNode.x || 0),
          y: position.y - (originalNode.y || 0),
        };

        console.log('📍 New position:', position, 'Offset:', offset);

        // FR: Mettre à jour les positions du nœud et de son arborescence
        // EN: Update positions of node and its subtree
        const newContent = { ...active.content };
        const allNodesToMove = [node.id, ...getAllDescendants(node.id, active.content.nodes)];

        allNodesToMove.forEach(nodeId => {
          const currentNode = newContent.nodes[nodeId];
          if (currentNode) {
            if (nodeId === node.id) {
              // Position absolue pour le nœud principal
              currentNode.x = position.x;
              currentNode.y = position.y;
            } else {
              // Décalage relatif pour les descendants
              const originalPos = active.content.nodes[nodeId];
              if (originalPos) {
                currentNode.x = (originalPos.x || 0) + offset.x;
                currentNode.y = (originalPos.y || 0) + offset.y;
              }
            }
          }
        });

        console.log('📝 Subtree moved', {
          nodeId: node.id,
          newPosition: position,
          movedNodes: allNodesToMove.length,
        });

        // FR: Mettre à jour l'état
        // EN: Update state
        useOpenFiles.setState(state => ({
          openFiles: state.openFiles.map(f => (f.isActive ? { ...f, content: newContent } : f)),
        }));

        console.log('✅ Nœud et arborescence déplacés avec succès');
      } else if (dragMode === 'reparent' && dragTarget) {
        // FR: Mode reparenting - rattacher le nœud
        // EN: Reparenting mode - reattach the node
        console.log(`🔄 Rattachement: ${node.id} → ${dragTarget}`);

        // FR: Utiliser la commande ReparentNodeCommand pour undo/redo
        // EN: Use ReparentNodeCommand for undo/redo
        const command = new ReparentNodeCommand(node.id, dragTarget);
        const currentMap = active.content as any;
        const newMap = command.execute(currentMap);

        console.log('📝 Command executed: ReparentNode', {
          nodeId: node.id,
          newParentId: dragTarget,
        });

        // FR: Mettre à jour l'état
        // EN: Update state
        useOpenFiles.setState(state => ({
          openFiles: state.openFiles.map(f => (f.isActive ? { ...f, content: newMap } : f)),
        }));

        console.log('✅ Nœud rattaché avec succès');
      } else {
        console.log('❌ No drag target in reparent mode, resetting states');
      }

      resetStates();
    },
    [dragTarget, dragMode, instanceRef, activeFile, resetStates]
  );

  return {
    draggedNodeId,
    draggedDescendants,
    dragTarget,
    ghostNode,
    dragMode,
    setDragMode,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  };
}
