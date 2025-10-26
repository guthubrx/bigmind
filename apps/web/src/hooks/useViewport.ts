import { create } from 'zustand';

interface ViewportState {
  zoom: number;
  setZoom: (zoom: number) => void;
}

export const useViewport = create<ViewportState>(set => ({
  zoom: 1,
  setZoom: (zoom: number) => set({ zoom }),
}));
