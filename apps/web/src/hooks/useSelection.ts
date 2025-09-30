import { create } from 'zustand';

type SelectionState = {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
};

export const useSelection = create<SelectionState>((set) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));


