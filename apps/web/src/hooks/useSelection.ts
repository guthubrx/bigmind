import { create } from 'zustand';

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

  setSelectedNodeId: id =>
    set({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
    }),

  toggleNodeSelection: (id, multiSelect = false) => {
    const state = get();
    if (multiSelect) {
      // Toggle in multi-select mode (Ctrl/Cmd+Click)
      if (state.selectedNodeIds.includes(id)) {
        set({
          selectedNodeIds: state.selectedNodeIds.filter(nId => nId !== id),
          selectedNodeId: state.selectedNodeIds.filter(nId => nId !== id)[0] || null,
        });
      } else {
        set({
          selectedNodeIds: [...state.selectedNodeIds, id],
          selectedNodeId: id,
        });
      }
    } else {
      // Single select mode
      set({
        selectedNodeId: id,
        selectedNodeIds: [id],
      });
    }
  },

  addToSelection: id => {
    const state = get();
    if (!state.selectedNodeIds.includes(id)) {
      set({
        selectedNodeIds: [...state.selectedNodeIds, id],
        selectedNodeId: id,
      });
    }
  },

  removeFromSelection: id => {
    const state = get();
    const newSelectedNodeIds = state.selectedNodeIds.filter(nId => nId !== id);
    set({
      selectedNodeIds: newSelectedNodeIds,
      selectedNodeId:
        state.selectedNodeId === id
          ? newSelectedNodeIds[newSelectedNodeIds.length - 1] || null
          : state.selectedNodeId,
    });
  },

  clearSelection: () =>
    set({
      selectedNodeId: null,
      selectedNodeIds: [],
    }),

  isNodeSelected: id => get().selectedNodeIds.includes(id),
}));
