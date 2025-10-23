/**
 * FR: Hook pour gérer le drag & drop des nœuds
 * EN: Hook to manage node drag & drop
 */

import { useCallback, useState } from 'react';
import type { Node } from '@xyflow/react';
import { useOpenFiles } from './useOpenFiles';
import { useAppSettings } from './useAppSettings';
import { ReparentNodeCommand } from '@bigmind/core';
import { getAllDescendants, isDescendant } from '../utils/nodeUtils';
import type { OpenFile } from './useOpenFiles';

interface UseDragAndDropParams {
  activeFile: OpenFile | null;
  instanceRef: React.MutableRefObject<any>;
}

interface UseDragAndDropReturn {
  draggedNodeId: string | null;
  draggedDescendants: string[];
  dragTarget: string | null;
  ghostNode: Node | null;
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
    [activeFile, instanceRef]
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
      const { openFiles } = useOpenFiles.getState();
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

  return {
    draggedNodeId,
    draggedDescendants,
    dragTarget,
    ghostNode,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  };
}
