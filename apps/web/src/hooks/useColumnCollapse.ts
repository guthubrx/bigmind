/**
 * FR: Hook pour gérer l'état de collapse des colonnes
 * EN: Hook to manage column collapse state
 */

import { create } from 'zustand';

interface ColumnCollapseState {
  collapsedColumns: Set<string>;
  toggleColumn: (columnId: string) => void;
  isCollapsed: (columnId: string) => boolean;
  load: () => void;
  save: () => void;
}

const STORAGE_KEY = 'bigmind_collapsed_columns';

// FR: Charger les colonnes collapsées depuis localStorage
// EN: Load collapsed columns from localStorage
const loadFromStorage = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const array = JSON.parse(raw);
    return new Set(array);
  } catch (e) {
    console.warn('[useColumnCollapse] Erreur lors du chargement:', e);
    return new Set();
  }
};

// FR: Sauvegarder les colonnes collapsées dans localStorage
// EN: Save collapsed columns to localStorage
const saveToStorage = (collapsedColumns: Set<string>) => {
  try {
    const array = Array.from(collapsedColumns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
  } catch (e) {
    console.warn('[useColumnCollapse] Erreur lors de la sauvegarde:', e);
  }
};

export const useColumnCollapse = create<ColumnCollapseState>((set, get) => ({
  collapsedColumns: new Set(),

  toggleColumn: (columnId: string) => {
    set(state => {
      const newCollapsedColumns = new Set(state.collapsedColumns);
      if (newCollapsedColumns.has(columnId)) {
        newCollapsedColumns.delete(columnId);
      } else {
        newCollapsedColumns.add(columnId);
      }
      saveToStorage(newCollapsedColumns);
      return { collapsedColumns: newCollapsedColumns };
    });
  },

  isCollapsed: (columnId: string) => get().collapsedColumns.has(columnId),

  load: () => {
    const collapsed = loadFromStorage();
    set({ collapsedColumns: collapsed });
  },

  save: () => {
    saveToStorage(get().collapsedColumns);
  },
}));
