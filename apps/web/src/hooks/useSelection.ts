/**
 * FR: Hook pour gérer la sélection des nœuds
 * EN: Hook to manage node selection
 */

import { create } from 'zustand';

type SelectionState = {
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  setSelectedNodeId: (id: string | null) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
};

export const useSelection = create<SelectionState>((set, get) => ({
  selectedNodeId: null,
  selectedNodeIds: [],
  setSelectedNodeId: id =>
    set({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
    }),
  setSelectedNodeIds: ids =>
    set({
      selectedNodeIds: ids,
      selectedNodeId: ids.length > 0 ? ids[0] : null,
    }),
  addToSelection: id => {
    const { selectedNodeIds } = get();
    if (!selectedNodeIds.includes(id)) {
      const newIds = [...selectedNodeIds, id];
      set({
        selectedNodeIds: newIds,
        selectedNodeId: newIds[0],
      });
    }
  },
  removeFromSelection: id => {
    const { selectedNodeIds } = get();
    const newIds = selectedNodeIds.filter(nodeId => nodeId !== id);
    set({
      selectedNodeIds: newIds,
      selectedNodeId: newIds.length > 0 ? newIds[0] : null,
    });
  },
  clearSelection: () =>
    set({
      selectedNodeId: null,
      selectedNodeIds: [],
    }),
}));
