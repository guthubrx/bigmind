/**
 * FR: Hook pour gérer l'état de collapse des colonnes
 * EN: Hook to manage column collapse state
 */

import { create } from 'zustand';

interface ColumnCollapseState {
  collapsedColumns: Set<string>;
  toggleColumn: (columnId: string) => void;
  isCollapsed: (columnId: string) => boolean;
}

export const useColumnCollapse = create<ColumnCollapseState>((set, get) => ({
  collapsedColumns: new Set(),
  
  toggleColumn: (columnId: string) => {
    set((state) => {
      const newCollapsedColumns = new Set(state.collapsedColumns);
      if (newCollapsedColumns.has(columnId)) {
        newCollapsedColumns.delete(columnId);
      } else {
        newCollapsedColumns.add(columnId);
      }
      return { collapsedColumns: newCollapsedColumns };
    });
  },
  
  isCollapsed: (columnId: string) => {
    return get().collapsedColumns.has(columnId);
  },
}));

