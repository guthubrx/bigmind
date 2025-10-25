import { create } from 'zustand';

interface EditModeState {
  isEditMode: boolean;
  editNodeId: string | null;
  setEditMode: (isEdit: boolean, nodeId: string | null) => void;
}

export const useEditMode = create<EditModeState>(set => ({
  isEditMode: false,
  editNodeId: null,
  setEditMode: (isEdit: boolean, nodeId: string | null) => {
    set({ isEditMode: isEdit, editNodeId: nodeId });
  },
}));
