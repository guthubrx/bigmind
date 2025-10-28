/**
 * FR: Hook pour gérer le drag & drop des nœuds
 * EN: Hook to manage node drag & drop
 */
/* eslint-disable no-console */

import { useCallback, useState } from 'react';
import type { Node } from '@xyflow/react';
import { useOpenFiles } from './useOpenFiles';
import { useSelection } from './useSelection';
import { getAllDescendants, isDescendant } from '../utils/nodeUtils';
import type { OpenFile } from './useOpenFiles';
import {
  ReparentNodeCommand,
  MoveNodeWithSubtreeCommand,
  ReorderSiblingCommand,
} from '@bigmind/core';

/**
 * FR: Valide si on peut reparenter un nœud sur un autre
 * EN: Validates if a node can be reparented to another
 * Prévient les cycles en vérifiant qu'on ne reparente pas sur un enfant
 */
function canReparentNode(nodeId: string, targetId: string, nodes: Record<string, any>): boolean {
  // FR: Impossible reparenter sur soi-même
  // EN: Cannot reparent to itself
  if (nodeId === targetId) return false;

  // FR: Impossible reparenter sur un enfant (créerait un cycle)
  // EN: Cannot reparent to a child (would create cycle)
  if (isDescendant(targetId, nodeId, nodes)) return false;

  return true;
}

interface UseDragAndDropParams {
  activeFile: OpenFile | null;
  instanceRef: React.MutableRefObject<any>;
}

interface UseDragAndDropReturn {
  draggedNodeId: string | null;
  draggedDescendants: string[];
  dragTarget: string | null;
  isValidTarget: boolean;
  ghostNode: Node | null;
  dragMode: 'reparent' | 'free';
  setDragMode: (mode: 'reparent' | 'free') => void;
  onNodeDragStart: (event: React.MouseEvent, node: Node) => void;
  onNodeDrag: (event: React.MouseEvent, node: Node) => void;
  onNodeDragStop: (event: React.MouseEvent, node: Node) => void;
  lastDropSuccess: boolean;
  dropPosition: 'before' | 'after' | 'center' | null;
  isSiblingReorder: boolean;
}

/**
 * FR: Hook pour gérer le drag & drop des nœuds dans la carte mentale
 * EN: Hook to manage node drag & drop in the mind map
 */
export function useDragAndDrop({
  activeFile,
  instanceRef,
}: UseDragAndDropParams): UseDragAndDropReturn {
  const selectedNodeIds = useSelection(s => s.selectedNodeIds);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [draggedNodeIds, setDraggedNodeIds] = useState<string[]>([]);
  const [draggedDescendants, setDraggedDescendants] = useState<string[]>([]);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [isValidTarget, setIsValidTarget] = useState(false);
  const [ghostNode, setGhostNode] = useState<Node | null>(null);
  const [dragMode, setDragMode] = useState<'reparent' | 'free'>('free');
  const [lastDropSuccess, setLastDropSuccess] = useState(false);
  const [originalPositions, setOriginalPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'center' | null>(null);
  const [isSiblingReorder, setIsSiblingReorder] = useState(false);

  // FR: Tolérance de drag pour détecter la cible (en pixels)
  // EN: Drag tolerance to detect target (in pixels)
  const dragTolerance = 50;

  // FR: Réinitialiser les états de drag
  // EN: Reset drag states
  const resetStates = useCallback(() => {
    setDraggedNodeId(null);
    setDraggedNodeIds([]);
    setDraggedDescendants([]);
    setDragTarget(null);
    setIsValidTarget(false);
    setGhostNode(null);
    setOriginalPositions({});
    setDropPosition(null);
    setIsSiblingReorder(false);
  }, []);

  // FR: Gérer le début du drag des nœuds
  // EN: Handle node drag start
  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // console.log('🚀 onNodeDragStart triggered for node:', node.id);
      setDraggedNodeId(node.id);

      // FR: Vérifier si le nœud draggé est dans la sélection pour drag multi-sélection
      // EN: Check if dragged node is in selection for multi-select drag
      const isNodeInSelection = selectedNodeIds.includes(node.id);
      const nodesToDrag = isNodeInSelection ? selectedNodeIds : [node.id];
      setDraggedNodeIds(nodesToDrag);

      // console.log('📦 Nodes being dragged:', nodesToDrag, 'Multi-select:', isNodeInSelection);

      // FR: Sauvegarder les positions originales de tous les nœuds draggés
      // EN: Save original positions of all dragged nodes
      if (!activeFile?.content?.nodes) return;
      const positions: Record<string, { x: number; y: number }> = {};
      nodesToDrag.forEach(nodeId => {
        const n = activeFile.content.nodes[nodeId];
        if (n) {
          positions[nodeId] = { x: n.x || 0, y: n.y || 0 };
        }
      });
      setOriginalPositions(positions);

      // FR: Calculer les descendants du nœud qu'on glisse pour l'effet de transparence
      // EN: Calculate descendants of dragged node for transparency effect
      const descendants = getAllDescendants(node.id, activeFile.content.nodes);
      setDraggedDescendants(descendants);
      // console.log('👥 Dragged node descendants:', descendants);

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
      // console.log('👻 Ghost node created:', ghost.id);
    },
    [activeFile?.content?.nodes, selectedNodeIds]
  );

  // FR: Gérer le drag des nœuds pour afficher l'indicateur visuel
  // EN: Handle node drag to show visual indicator
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // console.log('🖱️ onNodeDrag triggered for node:', node.id, 'mode:', dragMode);

      // FR: Utiliser React Flow pour trouver la position de la souris
      // EN: Use React Flow to find mouse position
      if (!instanceRef.current) {
        // console.log('❌ React Flow instance not available');
        setDragTarget(null);
        return;
      }

      // FR: Obtenir la position de la souris dans le système de coordonnées de React Flow
      // EN: Get mouse position in React Flow coordinate system
      const position = instanceRef.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // console.log('📍 Mouse position in flow:', position);

      if (dragMode === 'free') {
        // FR: Mode déplacement libre - pas de cible de reparenting
        // EN: Free movement mode - no reparenting target
        setDragTarget(null);
        setDropPosition(null);
        setIsSiblingReorder(false);
        return;
      }

      // FR: Mode reparenting - trouver le nœud cible
      // EN: Reparenting mode - find target node
      const allNodes = instanceRef.current.getNodes();
      let closestNode: Node | null = null;
      let minDistance = Infinity;

      allNodes.forEach((flowNode: Node) => {
        if (flowNode.id === node.id) return; // FR: Ignorer le nœud qu'on glisse / EN: Ignore the dragged node
        if (flowNode.id.startsWith('ghost-')) return; // FR: Ignorer les nœuds fantômes / EN: Ignore ghost nodes
        if ((flowNode.data as any)?.isGhost) return; // FR: Ignorer les nœuds fantômes / EN: Ignore ghost nodes
        if (draggedDescendants.includes(flowNode.id)) return; // FR: Ignorer les descendants / EN: Ignore descendants

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
        // console.log('❌ No target node found under cursor');
        setDragTarget(null);
        setDropPosition(null);
        setIsSiblingReorder(false);
        return;
      }

      // TypeScript assertion: closestNode is not null at this point
      const targetNode = closestNode as Node;
      // console.log('🎯 Found target node:', targetNode.id, 'current node:', node.id);

      // FR: Valider que la cible est valide (pas de cycle)
      // EN: Validate that target is valid (no cycle)
      const isValid =
        activeFile && canReparentNode(node.id, targetNode.id, activeFile.content.nodes);
      setDragTarget(targetNode.id);
      setIsValidTarget(isValid || false);

      if (!isValid) {
        // console.log('⚠️ Invalid target: would create cycle');
        setDropPosition(null);
        setIsSiblingReorder(false);
        return;
      }

      // FR: Déterminer si c'est un sibling et la position de drop
      // EN: Determine if it's a sibling and the drop position
      if (activeFile) {
        const draggedNode = activeFile.content.nodes[node.id];
        const targetMindNode = activeFile.content.nodes[targetNode.id];

        // FR: Calculer les trois zones du nœud cible
        // EN: Calculate the three zones of the target node
        const targetNodeY = targetNode.position.y;
        const nodeHeight = 50; // FR: Hauteur approximative / EN: Approximate height
        const topZoneEnd = targetNodeY + nodeHeight * 0.25; // FR: 25% supérieur / EN: Top 25%
        const bottomZoneStart = targetNodeY + nodeHeight * 0.75; // FR: 25% inférieur / EN: Bottom 25%

        if (
          draggedNode &&
          targetMindNode &&
          draggedNode.parentId === targetMindNode.parentId &&
          draggedNode.parentId !== null
        ) {
          // FR: C'est un sibling potentiel - vérifier dans quelle zone on est
          // EN: It's a potential sibling - check which zone we're in

          if (position.y < topZoneEnd) {
            // FR: Zone haute (25% supérieur) - réordonnancement avant
            // EN: Top zone (top 25%) - reorder before
            setIsSiblingReorder(true);
            setDropPosition('before');
            // console.log('📍 Drop position: BEFORE (top zone - sibling reorder)');
          } else if (position.y > bottomZoneStart) {
            // FR: Zone basse (25% inférieur) - réordonnancement après
            // EN: Bottom zone (bottom 25%) - reorder after
            setIsSiblingReorder(true);
            setDropPosition('after');
            // console.log('📍 Drop position: AFTER (bottom zone - sibling reorder)');
          } else {
            // FR: Zone centrale (50% au milieu) - reparenting (devient enfant)
            // EN: Center zone (middle 50%) - reparenting (becomes child)
            setIsSiblingReorder(false);
            setDropPosition('center');
            // console.log('📍 Drop position: CENTER (middle zone - reparenting sibling as child)');
          }
        } else {
          // FR: Pas un sibling - reparenting normal
          // EN: Not a sibling - normal reparenting
          setIsSiblingReorder(false);
          setDropPosition('center');
          // console.log('📍 Drop position: CENTER (reparenting)');
        }
      }
    },
    [dragMode, dragTolerance, instanceRef, activeFile, draggedDescendants]
  );

  // FR: Gérer la fin du drag des nœuds
  // EN: Handle node drag stop
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // resetStates est appelé à la fin de la fonction
      // console.log('🛑 onNodeDragStop triggered for node:', node.id);
      const active = activeFile;

      if (!active || !active.content?.nodes) {
        // console.log('❌ No active file');
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
          // console.log('❌ Could not get new position');
          resetStates();
          return;
        }

        // FR: Calculer le décalage depuis la position d'origine
        // EN: Calculate offset from original position
        const originalNode = active.content.nodes[node.id];
        if (!originalNode) {
          // console.log('❌ Original node not found');
          resetStates();
          return;
        }

        const offset = {
          x: position.x - (originalNode.x || 0),
          y: position.y - (originalNode.y || 0),
        };

        // console.log('📍 New position:', position, 'Offset:', offset);
        // console.log('📦 Moving', draggedNodeIds.length, 'nodes');

        // FR: Gérer le drag multi-sélection
        // EN: Handle multi-select drag
        let newContent = { ...active.content };
        if (draggedNodeIds.length > 1) {
          // FR: Drag multi-sélection - appliquer le même offset à tous les nœuds sélectionnés
          // EN: Multi-select drag - apply same offset to all selected nodes
          draggedNodeIds.forEach(draggedId => {
            const command = new MoveNodeWithSubtreeCommand(
              draggedId,
              {
                x: (originalPositions[draggedId]?.x || 0) + offset.x,
                y: (originalPositions[draggedId]?.y || 0) + offset.y,
              },
              offset
            );
            newContent = command.execute(newContent);
          });
        } else {
          // FR: Drag simple - utiliser la commande de déplacement normal
          // EN: Single drag - use normal move command
          const command = new MoveNodeWithSubtreeCommand(node.id, position, offset);
          newContent = command.execute(active.content);
        }

        // const allNodesToMove = [node.id, ...getAllDescendants(node.id, active.content.nodes)];
        // console.log('📝 Nodes moved', {
        //   nodeId: node.id,
        //   newPosition: position,
        //   movedNodes: allNodesToMove.length,
        //   selectedNodesMoved: draggedNodeIds.length,
        // });

        // FR: Mettre à jour l'état
        // EN: Update state
        useOpenFiles.setState(state => ({
          openFiles: state.openFiles.map(f => (f.isActive ? { ...f, content: newContent } : f)),
        }));

        // console.log('✅ Nœud et arborescence déplacés avec succès');
        setLastDropSuccess(true);
      } else if (dragMode === 'reparent' && dragTarget) {
        // FR: Mode reparenting - rattacher le nœud OU réordonner les siblings
        // EN: Reparenting mode - reattach node OR reorder siblings
        if (!isValidTarget) {
          // console.log('❌ Invalid reparent: would create cycle');
          setLastDropSuccess(false);
          resetStates();
          return;
        }

        // FR: Vérifier si la cible est un sibling (même parent) ET qu'on veut réordonner
        // EN: Check if target is a sibling (same parent) AND we want to reorder
        const draggedNode = active.content.nodes[node.id];
        const targetNode = active.content.nodes[dragTarget];

        if (
          draggedNode &&
          targetNode &&
          draggedNode.parentId === targetNode.parentId &&
          draggedNode.parentId !== null &&
          isSiblingReorder // FR: Vérifier qu'on est bien dans la zone de réordonnancement / EN: Check we're in reorder zone
        ) {
          // FR: C'est un sibling ET on veut réordonner (zone haute/basse)
          // EN: It's a sibling AND we want to reorder (top/bottom zone)
          // console.log(`🔄 Réordonnancement de siblings: ${node.id} ↔ ${dragTarget}`);

          // FR: Déterminer si on insère avant ou après basé sur la position Y
          // EN: Determine if we insert before or after based on Y position
          const position = instanceRef.current?.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          const targetFlowNode = instanceRef.current
            ?.getNodes()
            .find((n: Node) => n.id === dragTarget);
          const insertBefore =
            position && targetFlowNode ? position.y < targetFlowNode.position.y + 25 : false;

          const command = new ReorderSiblingCommand(node.id, dragTarget, insertBefore);
          const currentMap = active.content as any;
          const newMap = command.execute(currentMap);

          // console.log('📝 Command executed: ReorderSibling', {
          //   nodeId: node.id,
          //   targetId: dragTarget,
          //   insertBefore,
          // });

          // FR: Mettre à jour l'état
          // EN: Update state
          useOpenFiles.setState(state => ({
            openFiles: state.openFiles.map(f => (f.isActive ? { ...f, content: newMap } : f)),
          }));

          // console.log('✅ Siblings réordonnés avec succès');
        } else {
          // FR: Pas un sibling - reparenter normalement
          // EN: Not a sibling - reparent normally
          // console.log(`🔄 Rattachement: ${node.id} → ${dragTarget}`);

          const command = new ReparentNodeCommand(node.id, dragTarget);
          const currentMap = active.content as any;
          const newMap = command.execute(currentMap);

          // console.log('📝 Command executed: ReparentNode', {
          //   nodeId: node.id,
          //   newParentId: dragTarget,
          // });

          // FR: Mettre à jour l'état
          // EN: Update state
          useOpenFiles.setState(state => ({
            openFiles: state.openFiles.map(f => (f.isActive ? { ...f, content: newMap } : f)),
          }));

          // console.log('✅ Nœud rattaché avec succès');
        }

        setLastDropSuccess(true);
      } else {
        // console.log('❌ No drag target in reparent mode, resetting states');
        setLastDropSuccess(false);
      }

      resetStates();
    },
    [
      dragTarget,
      dragMode,
      instanceRef,
      activeFile,
      resetStates,
      draggedNodeIds,
      originalPositions,
      isValidTarget,
      isSiblingReorder,
    ]
  );

  return {
    draggedNodeId,
    draggedDescendants,
    dragTarget,
    isValidTarget,
    ghostNode,
    dragMode,
    setDragMode,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    lastDropSuccess,
    dropPosition,
    isSiblingReorder,
  };
}
