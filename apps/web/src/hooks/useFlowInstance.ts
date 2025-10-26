import { create } from 'zustand';

interface FlowInstanceState {
  instance: any | null;
  setInstance: (inst: any | null) => void;
}

export const useFlowInstance = create<FlowInstanceState>(set => ({
  instance: null,
  setInstance: inst => set({ instance: inst }),
}));
