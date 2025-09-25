/*
  Utils de layout & géométrie

  - buildOrthRoundedPath(): génère un chemin SVG entre deux nœuds en 3 segments:
    petit tronçon horizontal, colonne verticale ("spine"), puis tronçon horizontal
    vers la cible, avec 2 quarts de cercle pour des coins doux. Si source et cible
    sont quasi alignées verticalement (dy≈0), on trace une ligne droite.
  - estimateNodeHeight(): estimation sommaire de la hauteur d'un nœud en fonction
    de la longueur du texte (pour empiler les sous-arbres sans chevauchement).
  - countDescendants(): utilitaire pour compter les descendants d'un nœud.
  - countLeft/RightDescendants(): variantes utiles pour la racine dans certains
    scénarios (conservent la logique par côté).
*/
import { Topic } from '../store/mindmap'
import { UI_CONSTANTS } from './constants'

export function buildOrthRoundedPath(
  sourceX: number, 
  sourceY: number, 
  targetX: number, 
  targetY: number, 
  sourceW = UI_CONSTANTS.NODE_WIDTH, 
  targetW = UI_CONSTANTS.NODE_WIDTH
): string {
  const radius = 10
  const dir = targetX > sourceX ? 1 : -1
  const startX = sourceX + (sourceW / 2) * dir
  const endX = targetX - (targetW / 2) * dir
  const spineX = startX + (endX - startX) * 0.5
  const startY = sourceY
  const endY = targetY
  const dy = endY - startY
  if (Math.abs(dy) < 0.5) {
    // quasi horizontal
    return `M ${startX} ${startY} L ${endX} ${endY}`
  }
  const goingDown = dy > 0
  if (goingDown) {
    return `M ${startX} ${startY}
            L ${spineX - dir * radius} ${startY}
            Q ${spineX} ${startY} ${spineX} ${startY + radius}
            L ${spineX} ${endY - radius}
            Q ${spineX} ${endY} ${spineX + dir * radius} ${endY}
            L ${endX} ${endY}`
  }
  return `M ${startX} ${startY}
          L ${spineX - dir * radius} ${startY}
          Q ${spineX} ${startY} ${spineX} ${startY - radius}
          L ${spineX} ${endY + radius}
          Q ${spineX} ${endY} ${spineX + dir * radius} ${endY}
          L ${endX} ${endY}`
}

/**
 * estimateNodeHeight
 * Devine une hauteur de nœud en fonction de la longueur du texte.
 * But: éviter les chevauchements lors de l'empilement vertical.
 */
export function estimateNodeHeight(node: Topic): number {
  // Simple estimation based on text length
  const textLength = node.label.length
  const lines = Math.ceil(textLength / 20) // Approximate characters per line
  return Math.max(UI_CONSTANTS.NODE_HEIGHT, lines * 20)
}

/**
 * countDescendants
 * Nombre total de descendants (enfants + petits-enfants, etc.).
 */
export function countDescendants(node: Topic): number {
  let count = 0
  for (const child of node.children) {
    count += 1 + countDescendants(child)
  }
  return count
}

/**
 * countLeftDescendants
 * Variante par côté pour la racine si les nœuds ont une propriété side.
 */
export function countLeftDescendants(root: Topic): number {
  let count = 0
  for (const child of root.children) {
    if ((child as any).side === 'left' || (child as any).rootSide === 'left') {
      count += 1 + countDescendants(child)
    }
  }
  return count
}

/**
 * countRightDescendants
 * Variante par côté pour la racine si les nœuds ont une propriété side.
 */
export function countRightDescendants(root: Topic): number {
  let count = 0
  for (const child of root.children) {
    if ((child as any).side === 'right' || (child as any).rootSide === 'right') {
      count += 1 + countDescendants(child)
    }
  }
  return count
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}
