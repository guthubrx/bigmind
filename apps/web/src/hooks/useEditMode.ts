/**
 * FR: Hook pour gérer le mode édition global
 * EN: Hook to manage global edit mode
 */

import { create } from 'zustand';

interface EditModeState {
  isEditing: boolean;
  editingNodeId: string | null;
  setEditMode: (isEditing: boolean, nodeId: string | null) => void;
}

export const useEditMode = create<EditModeState>(set => ({
  isEditing: false,
  editingNodeId: null,
  setEditMode: (isEditing: boolean, nodeId: string | null) =>
    set({ isEditing, editingNodeId: nodeId }),
}));
