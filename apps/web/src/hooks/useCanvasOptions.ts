import { create } from 'zustand';
import { loadObject, saveObject } from '../utils/storageManager';
import { emitCanvasOptionChanged } from '../utils/mindmapEvents';

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

export const useCanvasOptions = create<CanvasOptionsState>((set, get) => ({
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  followSelection: true,

  toggleNodesDraggable: () => {
    set(s => {
      const newValue = !s.nodesDraggable;
      saveObject(STORAGE_KEY, { nodesDraggable: newValue, followSelection: s.followSelection });

      // Emit canvas option changed event
      emitCanvasOptionChanged({ option: 'nodesDraggable', value: newValue });

      return { nodesDraggable: newValue };
    });
  },

  setFollowSelection: v => {
    set(s => {
      saveObject(STORAGE_KEY, { nodesDraggable: s.nodesDraggable, followSelection: v });

      // Emit canvas option changed event
      emitCanvasOptionChanged({ option: 'followSelection', value: v });

      return { followSelection: v };
    });
  },

  load: () => {
    const saved = loadObject<any>(STORAGE_KEY, null);
    if (saved) {
      set({
        nodesDraggable: saved.nodesDraggable ?? true,
        followSelection: saved.followSelection ?? true,
      });
    }
  },

  save: () => {
    const state = get();
    saveObject(STORAGE_KEY, {
      nodesDraggable: state.nodesDraggable,
      followSelection: state.followSelection,
    });
  },
}));
