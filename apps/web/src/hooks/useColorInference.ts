/**
 * FR: Hook pour gérer l'inférence de couleurs par branche
 * EN: Hook to manage branch color inference
 */

import { useCallback, useMemo } from 'react';
import { COLOR_PALETTES } from './useAppSettings';
import { lightenHexColor, getOptimalTextColor } from '../utils/colorUtils';
import type { OpenFile } from './useOpenFiles';

interface UseColorInferenceParams {
  activeFile: OpenFile | null;
  perMapPaletteId: string;
}

interface UseColorInferenceReturn {
  nodesWithColors: Record<string, any>;
}

/**
 * FR: Hook pour gérer l'inférence de couleurs par branche basée sur la palette sélectionnée
 * EN: Hook to manage branch color inference based on selected palette
 */
export function useColorInference({
  activeFile,
  perMapPaletteId,
}: UseColorInferenceParams): UseColorInferenceReturn {
  // FR: Appliquer l'inférence de couleurs par branche basée sur la palette sélectionnée
  // EN: Apply branch color inference based on selected palette
  const applyColorInference = useCallback(
    (nodes: Record<string, any>, themeColors?: string[]) => {
      // FR: Utiliser la palette sélectionnée ou celle du thème XMind en fallback
      // EN: Use selected palette or XMind theme palette as fallback
      const palette = COLOR_PALETTES.find(p => p.id === perMapPaletteId);
      const colors = palette?.colors || themeColors || [];

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
  }, [activeFile?.content?.nodes, activeFile?.themeColors, applyColorInference]);

  return { nodesWithColors };
}
