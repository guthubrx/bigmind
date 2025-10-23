import { create } from 'zustand';

type CanvasOptionsState = {
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  followSelection: boolean;
  toggleNodesDraggable: () => void;
  setFollowSelection: (v: boolean) => void;
};

export const useCanvasOptions = create<CanvasOptionsState>(set => ({
  nodesDraggable: true,
  nodesConnectable: true,
  elementsSelectable: true,
  followSelection: false,
  toggleNodesDraggable: () => set(s => ({ nodesDraggable: !s.nodesDraggable })),
  setFollowSelection: v => set({ followSelection: v }),
}));
