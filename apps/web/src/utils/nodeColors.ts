/**
 * FR: Utilitaires pour la gestion des couleurs des nœuds
 * EN: Utilities for managing node colors
 */

import { MindNode, NodeID } from '../hooks/useMindmap';
import { ColorTheme } from '../themes/colorThemes';

/**
 * FR: Convertit une couleur hex en RGB
 * EN: Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * FR: Convertit RGB en hex
 * EN: Converts RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * FR: Éclaircit une couleur d'un certain pourcentage
 * EN: Lightens a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const newR = Math.min(255, Math.round(r + (255 - r) * percent));
  const newG = Math.min(255, Math.round(g + (255 - g) * percent));
  const newB = Math.min(255, Math.round(b + (255 - b) * percent));

  return rgbToHex(newR, newG, newB);
}

/**
 * FR: Trouve le niveau d'un nœud dans la hiérarchie (0 = racine, 1 = enfant direct, etc.)
 * EN: Finds the level of a node in the hierarchy (0 = root, 1 = direct child, etc.)
 */
export function getNodeLevel(nodeId: NodeID, nodes: Record<NodeID, MindNode>): number {
  const node = nodes[nodeId];
  if (!node || !node.parentId) return 0;

  let level = 0;
  let currentId: NodeID | null = nodeId;

  while (currentId && nodes[currentId]?.parentId) {
    level += 1;
    currentId = nodes[currentId].parentId;
  }

  return level;
}

/**
 * FR: Trouve l'ancêtre de niveau 1 (enfant direct de la racine)
 * EN: Finds the level-1 ancestor (direct child of root)
 */
export function getLevel1Ancestor(
  nodeId: NodeID,
  nodes: Record<NodeID, MindNode>,
  rootId: NodeID
): NodeID | null {
  const node = nodes[nodeId];
  if (!node) return null;

  // Si c'est la racine, retourner null
  if (nodeId === rootId) return null;

  // Si c'est un enfant direct de la racine, retourner ce nœud
  if (node.parentId === rootId) return nodeId;

  // Sinon, remonter jusqu'à trouver l'enfant direct de la racine
  let currentId: NodeID = nodeId;
  while (currentId && nodes[currentId]?.parentId) {
    const parent = nodes[currentId].parentId;
    if (!parent) break;
    if (parent === rootId) return currentId;
    currentId = parent;
  }

  return null;
}

/**
 * FR: Obtient la couleur appropriée pour un nœud basé sur sa position dans la hiérarchie
 * EN: Gets the appropriate color for a node based on its position in the hierarchy
 */
export function getNodeColor(
  nodeId: NodeID,
  nodes: Record<NodeID, MindNode>,
  rootId: NodeID,
  theme: ColorTheme
): string {
  const level = getNodeLevel(nodeId, nodes);

  // Racine : utiliser la couleur par défaut du thème
  if (level === 0) {
    return theme.colors.nodeBackground;
  }

  // Niveau 1 (enfants directs de la racine) : utiliser la palette
  if (level === 1) {
    const rootNode = nodes[rootId];
    if (!rootNode) return theme.colors.nodeBackground;

    // Trouver l'index du nœud parmi les enfants de la racine
    const index = rootNode.children.indexOf(nodeId);
    if (index === -1) return theme.colors.nodeBackground;

    // Utiliser la couleur de la palette (cyclique si plus de 10 enfants)
    if (!theme.palette || theme.palette.length === 0) return theme.colors.nodeBackground;
    const paletteIndex = index % theme.palette.length;
    return theme.palette[paletteIndex];
  }

  // Niveaux 2+ : éclaircir la couleur de l'ancêtre de niveau 1
  const level1Ancestor = getLevel1Ancestor(nodeId, nodes, rootId);
  if (!level1Ancestor) return theme.colors.nodeBackground;

  const baseColor = getNodeColor(level1Ancestor, nodes, rootId, theme);

  // Éclaircir progressivement selon le niveau (15% par niveau après le niveau 1)
  const lightenPercent = (level - 1) * 0.15;
  return lightenColor(baseColor, Math.min(lightenPercent, 0.7)); // Max 70% pour éviter trop de blanc
}

/**
 * FR: Applique automatiquement les couleurs à tous les nœuds
 * EN: Automatically applies colors to all nodes
 */
export function applyAutomaticColors(
  nodes: Record<NodeID, MindNode>,
  rootId: NodeID,
  theme: ColorTheme
): Record<NodeID, MindNode> {
  const updatedNodes: Record<NodeID, MindNode> = {};

  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    const autoColor = getNodeColor(nodeId, nodes, rootId, theme);

    updatedNodes[nodeId] = {
      ...node,
      style: {
        ...node.style,
        // Ne pas écraser si l'utilisateur a déjà défini une couleur manuellement
        // Pour l'instant, on applique toujours
        backgroundColor: autoColor,
      },
    };
  });

  return updatedNodes;
}
