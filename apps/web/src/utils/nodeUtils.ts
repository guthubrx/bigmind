/**
 * FR: Utilitaires pour les opérations sur les nœuds de carte mentale
 * EN: Utilities for mind map node operations
 */

import type { MindNode } from '@bigmind/core';

/**
 * FR: Calculer tous les descendants d'un nœud (récursif)
 * EN: Calculate all descendants of a node (recursive)
 * @param nodeId - ID du nœud
 * @param nodes - Dictionnaire de tous les nœuds
 * @returns Tableau des IDs de tous les descendants
 */
export function getAllDescendants(
  nodeId: string,
  nodes: Record<string, MindNode>
): string[] {
  const descendants: string[] = [];
  const node = nodes[nodeId];
  if (!node?.children) return descendants;

  const traverse = (currentNodeId: string) => {
    const currentNode = nodes[currentNodeId];
    if (currentNode?.children) {
      currentNode.children.forEach((childId: string) => {
        descendants.push(childId);
        traverse(childId);
      });
    }
  };

  traverse(nodeId);
  return descendants;
}

/**
 * FR: Calculer le nombre total de descendants d'un nœud (récursif)
 * EN: Calculate total number of descendants of a node (recursive)
 * @param nodeId - ID du nœud
 * @param nodes - Dictionnaire de tous les nœuds
 * @returns Nombre total de descendants
 */
export function getTotalDescendantsCount(
  nodeId: string,
  nodes: Record<string, MindNode>
): number {
  const node = nodes[nodeId];
  if (!node?.children || node.children.length === 0) return 0;

  let totalCount = 0;

  const countRecursively = (currentNodeId: string) => {
    const currentNode = nodes[currentNodeId];
    if (currentNode?.children) {
      currentNode.children.forEach((childId: string) => {
        totalCount++; // Compter ce descendant
        countRecursively(childId); // Compter récursivement ses descendants
      });
    }
  };

  countRecursively(nodeId);
  return totalCount;
}

/**
 * FR: Calculer la profondeur d'un nœud dans l'arbre
 * EN: Calculate the depth of a node in the tree
 * @param nodeId - ID du nœud
 * @param nodes - Dictionnaire de tous les nœuds
 * @returns Profondeur du nœud (0 pour la racine)
 */
export function getNodeDepth(nodeId: string, nodes: Record<string, MindNode>): number {
  const node = nodes[nodeId];
  if (!node?.parentId) return 0;
  return 1 + getNodeDepth(node.parentId, nodes);
}

/**
 * FR: Vérifier si un nœud est un descendant d'un autre
 * EN: Check if a node is a descendant of another
 * @param nodeId - ID du nœud à vérifier
 * @param ancestorId - ID de l'ancêtre potentiel
 * @param nodes - Dictionnaire de tous les nœuds
 * @returns true si nodeId est un descendant de ancestorId
 */
export function isDescendant(
  nodeId: string,
  ancestorId: string,
  nodes: Record<string, MindNode>
): boolean {
  const currentNode = nodes[nodeId];
  if (!currentNode?.parentId) return false;
  if (currentNode.parentId === ancestorId) return true;
  return isDescendant(currentNode.parentId, ancestorId, nodes);
}

