/**
 * FR: Hook pour gérer les calques basés sur les tags (style Photoshop)
 * EN: Hook to manage tag-based layers (Photoshop style)
 */

import { create } from 'zustand';

export interface TagLayer {
  tag: string;
  visible: boolean;
  originalVisible?: boolean; // FR: État de visibilité original (sans masque parent)
  color: string;
  opacity: number;
  parent?: string; // FR: Tag parent pour la hiérarchie (tag1>sous-tag1)
  children?: string[]; // FR: Tags enfants
}

interface TagLayersState {
  // FR: Tags et leurs états de calque
  // EN: Tags and their layer states
  layers: Record<string, TagLayer>;

  // FR: Visibilité individuelle des nœuds
  // EN: Individual node visibility
  nodeVisibility: Record<string, boolean>;

  // Actions
  toggleLayerVisibility: (tag: string) => void;
  toggleNodeVisibility: (nodeId: string) => void;
  setNodeVisibility: (nodeId: string, visible: boolean) => void;
  setLayerVisibility: (tag: string, visible: boolean) => void;
  setLayerColor: (tag: string, color: string) => void;
  setLayerOpacity: (tag: string, opacity: number) => void;
  showOnlyLayer: (tag: string) => void;
  showAllLayers: () => void;
  hideAllLayers: () => void;
  initializeLayer: (tag: string) => void;
  removeLayer: (tag: string) => void;

  // FR: Réorganiser un tag dans la hiérarchie
  // EN: Reorganize a tag in the hierarchy
  moveTagToParent: (tag: string, newParent: string | null) => string;

  // FR: Ajouter un tag à tous les nœuds d'un groupe
  // EN: Add a tag to all nodes in a group
  addTagToGroupNodes: (sourceTag: string, targetTag: string) => void;

  // FR: Fonction récursive pour appliquer/retirer le masque sur tous les descendants
  // EN: Recursive function to apply/remove mask on all descendants
  applyMaskToDescendants: (tag: string, visible: boolean) => void;

  // FR: Vérifier si un nœud avec des tags donnés doit être visible
  // EN: Check if a node with given tags should be visible
  isNodeVisible: (nodeTags: string[] | undefined) => boolean;

  // FR: Obtenir l'opacité d'un nœud basée sur ses tags
  // EN: Get node opacity based on its tags
  getNodeOpacity: (nodeTags: string[] | undefined) => number;

  // FR: Vérifier si un tag est visible en tenant compte de l'héritage
  // EN: Check if a tag is visible considering inheritance
  isTagVisibleWithInheritance: (tag: string) => boolean;
}

// FR: Couleurs par défaut pour les tags
// EN: Default colors for tags
const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

let colorIndex = 0;

const getNextColor = () => {
  const color = TAG_COLORS[colorIndex % TAG_COLORS.length];
  colorIndex++;
  return color;
};

// FR: Parser un tag pour extraire la hiérarchie (tag1>sous-tag1)
// EN: Parse tag to extract hierarchy (tag1>sub-tag1)
const parseTagHierarchy = (tag: string): { parent?: string; name: string } => {
  const parts = tag.split('>');
  if (parts.length > 1) {
    const parent = parts.slice(0, -1).join('>');
    const name = parts[parts.length - 1];
    return { parent, name };
  }
  return { name: tag };
};

export const useTagLayers = create<TagLayersState>((set, get) => ({
  layers: {},
  nodeVisibility: {},

  toggleNodeVisibility: (nodeId) => {
    set(state => ({
      nodeVisibility: {
        ...state.nodeVisibility,
        [nodeId]: state.nodeVisibility[nodeId] === false ? true : false
      }
    }));
  },

  setNodeVisibility: (nodeId, visible) => {
    set(state => ({
      nodeVisibility: {
        ...state.nodeVisibility,
        [nodeId]: visible
      }
    }));
  },

  // FR: Fonction récursive pour appliquer/retirer le masque sur tous les descendants
  // EN: Recursive function to apply/remove mask on all descendants
  applyMaskToDescendants: (tag, visible) => {
    const state = get();
    const layer = state.layers[tag];
    if (!layer) return;

    // FR: Sauvegarder l'état original AVANT d'appliquer le masque
    // EN: Save original state BEFORE applying mask
    if (!visible) {
      // FR: Masquer - sauvegarder l'état original de tous les descendants
      // EN: Hide - save original state of all descendants
      const saveOriginalStates = (currentTag: string) => {
        const currentLayer = state.layers[currentTag];
        if (currentLayer) {
          // FR: Sauvegarder l'état original si pas déjà fait
          // EN: Save original state if not already done
          if (currentLayer.originalVisible === undefined) {
            state.set(state => ({
              layers: {
                ...state.layers,
                [currentTag]: {
                  ...currentLayer,
                  originalVisible: currentLayer.visible
                }
              }
            }));
          }
          // FR: Masquer ce calque
          // EN: Hide this layer
          state.setLayerVisibility(currentTag, false);

          // FR: Appliquer récursivement aux enfants
          // EN: Apply recursively to children
          if (currentLayer.children) {
            currentLayer.children.forEach(childTag => saveOriginalStates(childTag));
          }
        }
      };

      if (layer.children) {
        layer.children.forEach(childTag => saveOriginalStates(childTag));
      }
    } else {
      // FR: Afficher - restaurer les états originaux de tous les descendants
      // EN: Show - restore original states of all descendants
      const restoreOriginalStates = (currentTag: string) => {
        const currentLayer = state.layers[currentTag];
        if (currentLayer) {
          // FR: Restaurer l'état original si disponible
          // EN: Restore original state if available
          const originalVisible = currentLayer.originalVisible ?? currentLayer.visible;
          state.setLayerVisibility(currentTag, originalVisible);

          // FR: Appliquer récursivement aux enfants
          // EN: Apply recursively to children
          if (currentLayer.children) {
            currentLayer.children.forEach(childTag => restoreOriginalStates(childTag));
          }
        }
      };

      if (layer.children) {
        layer.children.forEach(childTag => restoreOriginalStates(childTag));
      }
    }
  },

  toggleLayerVisibility: (tag) => {
    const state = get();
    const layer = state.layers[tag];
    if (layer) {
      const newVisible = !layer.visible;

      // FR: Sauvegarder l'état original du calque principal
      // EN: Save original state of main layer
      set(state => ({
        layers: {
          ...state.layers,
          [tag]: {
            ...layer,
            visible: newVisible,
            // FR: Sauvegarder l'état original si c'est la première fois
            // EN: Save original state if it's the first time
            originalVisible: layer.originalVisible ?? layer.visible
          }
        }
      }));

      // FR: Appliquer/retirer le masque sur tous les descendants
      // EN: Apply/remove mask on all descendants
      state.applyMaskToDescendants(tag, newVisible);
    }
  },

  setLayerVisibility: (tag, visible) => {
    set(state => {
      const layer = state.layers[tag];
      if (!layer) return { layers: state.layers };

      return {
        layers: {
          ...state.layers,
          [tag]: {
            ...layer,
            visible,
            // FR: Ne pas toucher à l'état original ici - il est géré dans applyMaskToDescendants
            // EN: Don't touch original state here - it's managed in applyMaskToDescendants
            originalVisible: layer.originalVisible
          }
        }
      };
    });
  },

  setLayerColor: (tag, color) => {
    set(state => ({
      layers: {
        ...state.layers,
        [tag]: {
          ...state.layers[tag],
          color
        }
      }
    }));
  },

  setLayerOpacity: (tag, opacity) => {
    set(state => ({
      layers: {
        ...state.layers,
        [tag]: {
          ...state.layers[tag],
          opacity
        }
      }
    }));
  },

  showOnlyLayer: (tag) => {
    set(state => {
      const newLayers = { ...state.layers };
      Object.keys(newLayers).forEach(t => {
        newLayers[t] = {
          ...newLayers[t],
          visible: t === tag
        };
      });
      return { layers: newLayers };
    });
  },

  showAllLayers: () => {
    set(state => {
      const newLayers = { ...state.layers };
      Object.keys(newLayers).forEach(tag => {
        newLayers[tag] = {
          ...newLayers[tag],
          visible: true
        };
      });
      return { layers: newLayers };
    });
  },

  hideAllLayers: () => {
    set(state => {
      const newLayers = { ...state.layers };
      Object.keys(newLayers).forEach(tag => {
        newLayers[tag] = {
          ...newLayers[tag],
          visible: false
        };
      });
      return { layers: newLayers };
    });
  },

  initializeLayer: (tag) => {
    const state = get();
    if (!state.layers[tag]) {
      const { parent } = parseTagHierarchy(tag);

      const newLayer: TagLayer = {
        tag,
        visible: true,
        originalVisible: true, // FR: Initialiser l'état original
        color: getNextColor(),
        opacity: 1,
        parent
      };

      // FR: Si c'est un enfant, l'ajouter à la liste des enfants du parent
      // EN: If it's a child, add it to parent's children list
      if (parent && state.layers[parent]) {
        const parentLayer = state.layers[parent];
        if (!parentLayer.children) {
          parentLayer.children = [];
        }
        parentLayer.children.push(tag);
      }

      set({
        layers: {
          ...state.layers,
          [tag]: newLayer
        }
      });
    }
  },

  removeLayer: (tag) => {
    set(state => {
      const newLayers = { ...state.layers };
      const layer = newLayers[tag];

      // FR: Si c'est un parent, supprimer aussi les enfants
      // EN: If it's a parent, also remove children
      if (layer?.children) {
        layer.children.forEach(childTag => {
          delete newLayers[childTag];
        });
      }

      // FR: Si c'est un enfant, le retirer de la liste du parent
      // EN: If it's a child, remove it from parent's list
      if (layer?.parent && newLayers[layer.parent]) {
        const parentLayer = newLayers[layer.parent];
        if (parentLayer.children) {
          parentLayer.children = parentLayer.children.filter(c => c !== tag);
        }
      }

      delete newLayers[tag];
      return { layers: newLayers };
    });
  },

  isNodeVisible: (nodeTags) => {
    const state = get();

    // FR: Si le nœud n'a pas de tags, il est toujours visible
    // EN: If node has no tags, it's always visible
    if (!nodeTags || nodeTags.length === 0) {
      return true;
    }

    // FR: Le nœud est visible si au moins un de ses tags est visible (avec héritage)
    // EN: Node is visible if at least one of its tags is visible (with inheritance)
    return nodeTags.some(tag => {
      return state.isTagVisibleWithInheritance(tag);
    });
  },

  // FR: Vérifier si un tag est visible (le masque est déjà appliqué dans toggleLayerVisibility)
  // EN: Check if a tag is visible (mask is already applied in toggleLayerVisibility)
  isTagVisibleWithInheritance: (tag) => {
    const state = get();
    const layer = state.layers[tag];

    // FR: Si le layer n'existe pas, considérer comme visible
    // EN: If layer doesn't exist, consider as visible
    if (!layer) return true;

    // FR: Retourner simplement l'état visible actuel (le masque est déjà appliqué)
    // EN: Simply return current visible state (mask is already applied)
    return layer.visible;
  },

  getNodeOpacity: (nodeTags) => {
    const state = get();

    if (!nodeTags || nodeTags.length === 0) {
      return 1;
    }

    // FR: Utiliser l'opacité minimum des calques visibles du nœud (avec héritage)
    // EN: Use minimum opacity from node's visible layers (with inheritance)
    const opacities = nodeTags
      .map(tag => {
        const layer = state.layers[tag];
        return layer && state.isTagVisibleWithInheritance(tag) ? layer.opacity : 1;
      })
      .filter(opacity => opacity !== undefined);

    return opacities.length > 0 ? Math.min(...opacities) : 1;
  },

  moveTagToParent: (tag, newParent) => {
    const state = get();
    const layer = state.layers[tag];
    if (!layer) return tag;

    // FR: Éviter les cycles - un tag ne peut pas être son propre parent
    // EN: Avoid cycles - a tag cannot be its own parent
    if (newParent) {
      // Vérifier si newParent est un descendant de tag
      let current = newParent;
      while (current) {
        if (current === tag) {
          console.warn('Cannot move tag to its own descendant');
          return tag; // Cycle détecté, ne pas déplacer
        }
        const parentLayer = state.layers[current];
        current = parentLayer?.parent || null;
      }
    }

    // FR: Calculer le nouveau nom du tag
    // EN: Calculate new tag name
    const oldName = tag;
    const baseName = tag.includes('>') ? tag.split('>').pop()! : tag;
    const newName = newParent ? `${newParent}>${baseName}` : baseName;

    // FR: Si le nom ne change pas, ne rien faire
    // EN: If name doesn't change, do nothing
    if (newName === oldName) return oldName;

    // FR: Créer une copie des layers pour travailler dessus
    // EN: Create a copy of layers to work with
    const newLayers = { ...state.layers };

    // FR: Fonction récursive pour renommer un tag et tous ses enfants
    // EN: Recursive function to rename a tag and all its children
    const renameTagAndChildren = (oldTag: string, newTag: string, parentTag: string | null) => {
      const layer = newLayers[oldTag];
      if (!layer) return;

      // Créer le nouveau layer avec le nouveau nom et parent
      const newLayer = { ...layer, tag: newTag, parent: parentTag };

      // Supprimer l'ancien et ajouter le nouveau
      delete newLayers[oldTag];
      newLayers[newTag] = newLayer;

      // Renommer tous les enfants
      if (layer.children) {
        const newChildren: string[] = [];
        layer.children.forEach(childOldName => {
          const childBaseName = childOldName.split('>').pop()!;
          const childNewName = `${newTag}>${childBaseName}`;
          newChildren.push(childNewName);
          // Passer le nouveau tag comme parent pour les enfants
          renameTagAndChildren(childOldName, childNewName, newTag);
        });
        newLayer.children = newChildren;
      }
    };

    // FR: Mettre à jour l'ancien parent si nécessaire
    // EN: Update old parent if needed
    if (layer.parent && newLayers[layer.parent]) {
      const oldParentLayer = { ...newLayers[layer.parent] };
      if (oldParentLayer.children) {
        oldParentLayer.children = oldParentLayer.children.filter(c => c !== tag);
      }
      newLayers[layer.parent] = oldParentLayer;
    }

    // FR: Mettre à jour le nouveau parent si nécessaire
    // EN: Update new parent if needed
    if (newParent && newLayers[newParent]) {
      const newParentLayer = { ...newLayers[newParent] };
      if (!newParentLayer.children) {
        newParentLayer.children = [];
      }
      newParentLayer.children.push(newName);
      newLayers[newParent] = newParentLayer;
    }

    // FR: Renommer le tag et tous ses enfants
    // EN: Rename tag and all its children
    renameTagAndChildren(oldName, newName, newParent);

    // FR: Mettre à jour le state avec les nouveaux layers
    // EN: Update state with new layers
    set({ layers: newLayers });

    return newName;
  },

  // FR: Ajouter un tag à tous les nœuds d'un groupe
  // EN: Add a tag to all nodes in a group
  addTagToGroupNodes: (sourceTag: string, targetTag: string) => {
    const state = get();

    // FR: Cette fonction sera appelée depuis le composant qui a accès à useOpenFiles
    // EN: This function will be called from the component that has access to useOpenFiles
    // FR: Nous allons simplement dispatcher un événement personnalisé
    // EN: We'll simply dispatch a custom event
    const event = new CustomEvent('bigmind:addTagToGroup', {
      detail: { sourceTag, targetTag }
    });
    window.dispatchEvent(event);

    console.log(`📤 Événement dispatché: ajouter tag "${targetTag}" aux nœuds du groupe "${sourceTag}"`);
  }
}));