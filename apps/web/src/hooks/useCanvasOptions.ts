import { create } from 'zustand';

type CanvasOptionsState = {
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  followSelection: boolean;
  toggleNodesDraggable: () => void;
  setFollowSelection: (v: boolean) => void;
  load: () => void;
  save: () => void;
};

const STORAGE_KEY = 'bigmind_canvas_options';

// FR: Charger les options depuis localStorage
// EN: Load options from localStorage
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[useCanvasOptions] Erreur lors du chargement:', e);
    return null;
  }
};

// FR: Sauvegarder les options dans localStorage
// EN: Save options to localStorage
const saveToStorage = (options: { nodesDraggable: boolean; followSelection: boolean }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch (e) {
    console.warn('[useCanvasOptions] Erreur lors de la sauvegarde:', e);
  }
};

export const useCanvasOptions = create<CanvasOptionsState>((set, get) => ({
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  followSelection: true,

  toggleNodesDraggable: () => {
    set(s => {
      const newValue = !s.nodesDraggable;
      saveToStorage({ nodesDraggable: newValue, followSelection: s.followSelection });
      return { nodesDraggable: newValue };
    });
  },

  setFollowSelection: v => {
    set(s => {
      saveToStorage({ nodesDraggable: s.nodesDraggable, followSelection: v });
      return { followSelection: v };
    });
  },

  load: () => {
    const saved = loadFromStorage();
    if (saved) {
      set({
        nodesDraggable: saved.nodesDraggable ?? true,
        followSelection: saved.followSelection ?? true,
      });
    }
  },

  save: () => {
    const state = get();
    saveToStorage({
      nodesDraggable: state.nodesDraggable,
      followSelection: state.followSelection,
    });
  },
}));
