import { create } from 'zustand';
import { useOpenFiles } from './useOpenFiles';

type SelectionState = {
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  setSelectedNodeId: (id: string | null) => void;
  toggleNodeSelection: (id: string, multiSelect?: boolean) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  isNodeSelected: (id: string) => boolean;
};

export const useSelection = create<SelectionState>((set, get) => ({
  selectedNodeId: null,
  selectedNodeIds: [],

  setSelectedNodeId: id => {
    set({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
    });
    // FR: Sauvegarder la sélection dans le fichier actif
    // EN: Save selection in active file
    useOpenFiles.getState().updateActiveFileSelection(id);
  },

  toggleNodeSelection: (id, multiSelect = false) => {
    const state = get();
    let newSelectedNodeId: string | null = null;

    if (multiSelect) {
      // Toggle in multi-select mode (Ctrl/Cmd+Click)
      if (state.selectedNodeIds.includes(id)) {
        const newIds = state.selectedNodeIds.filter(nId => nId !== id);
        newSelectedNodeId = newIds[0] || null;
        set({
          selectedNodeIds: newIds,
          selectedNodeId: newSelectedNodeId,
        });
      } else {
        newSelectedNodeId = id;
        set({
          selectedNodeIds: [...state.selectedNodeIds, id],
          selectedNodeId: id,
        });
      }
    } else {
      // Single select mode
      newSelectedNodeId = id;
      set({
        selectedNodeId: id,
        selectedNodeIds: [id],
      });
    }

    // FR: Sauvegarder la sélection dans le fichier actif
    // EN: Save selection in active file
    useOpenFiles.getState().updateActiveFileSelection(newSelectedNodeId);
  },

  addToSelection: id => {
    const state = get();
    if (!state.selectedNodeIds.includes(id)) {
      set({
        selectedNodeIds: [...state.selectedNodeIds, id],
        selectedNodeId: id,
      });
      // FR: Sauvegarder la sélection dans le fichier actif
      // EN: Save selection in active file
      useOpenFiles.getState().updateActiveFileSelection(id);
    }
  },

  removeFromSelection: id => {
    const state = get();
    const newSelectedNodeIds = state.selectedNodeIds.filter(nId => nId !== id);
    const newSelectedNodeId =
      state.selectedNodeId === id
        ? newSelectedNodeIds[newSelectedNodeIds.length - 1] || null
        : state.selectedNodeId;
    set({
      selectedNodeIds: newSelectedNodeIds,
      selectedNodeId: newSelectedNodeId,
    });
    // FR: Sauvegarder la sélection dans le fichier actif
    // EN: Save selection in active file
    useOpenFiles.getState().updateActiveFileSelection(newSelectedNodeId);
  },

  clearSelection: () => {
    set({
      selectedNodeId: null,
      selectedNodeIds: [],
    });
    // FR: Sauvegarder la sélection dans le fichier actif
    // EN: Save selection in active file
    useOpenFiles.getState().updateActiveFileSelection(null);
  },

  isNodeSelected: id => get().selectedNodeIds.includes(id),
}));
