/**
 * Slot/Fill Context
 * Manages registration and retrieval of fills for slots
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Fill, SlotFillContextValue } from './types';

const SlotFillContext = createContext<SlotFillContextValue | null>(null);

export function useSlotFill(): SlotFillContextValue {
  const context = useContext(SlotFillContext);
  if (!context) {
    throw new Error('useSlotFill must be used within SlotFillProvider');
  }
  return context;
}

interface SlotFillProviderProps {
  children: ReactNode;
}

export function SlotFillProvider({ children }: SlotFillProviderProps) {
  const [fills, setFills] = useState<Map<string, Fill[]>>(new Map());
  const [updateCounter, setUpdateCounter] = useState(0);

  const registerFill = useCallback((fill: Fill) => {
    setFills(current => {
      const newFills = new Map(current);
      const slotFills = newFills.get(fill.slot) || [];

      // Remove existing fill with same ID if it exists
      const filtered = slotFills.filter(f => f.id !== fill.id);

      // Add new fill and sort by order
      filtered.push(fill);
      filtered.sort((a, b) => a.order - b.order);

      newFills.set(fill.slot, filtered);
      return newFills;
    });

    // Trigger re-render of slots
    setUpdateCounter(c => c + 1);
  }, []);

  const unregisterFill = useCallback((fillId: string) => {
    setFills(current => {
      const newFills = new Map(current);
      let modified = false;

      // Remove fill from all slots
      for (const [slotName, slotFills] of newFills.entries()) {
        const filtered = slotFills.filter(f => f.id !== fillId);
        if (filtered.length !== slotFills.length) {
          newFills.set(slotName, filtered);
          modified = true;
        }
      }

      return modified ? newFills : current;
    });

    // Trigger re-render of slots
    setUpdateCounter(c => c + 1);
  }, []);

  const getFills = useCallback(
    (slotName: string): Fill[] => fills.get(slotName) || [],
    [fills, updateCounter] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const value: SlotFillContextValue = {
    fills,
    registerFill,
    unregisterFill,
    getFills,
  };

  return <SlotFillContext.Provider value={value}>{children}</SlotFillContext.Provider>;
}
