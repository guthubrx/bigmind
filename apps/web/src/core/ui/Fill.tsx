/**
 * Fill Component
 * Registers content to be rendered in a slot
 */

import { useEffect, useMemo } from 'react';
import { useSlotFill } from './SlotFillContext';
import type { FillProps } from './types';

let fillIdCounter = 0;

export function Fill({ slot, order = 10, children, pluginId }: FillProps) {
  const { registerFill, unregisterFill } = useSlotFill();

  // Generate unique ID for this fill
  const fillId = useMemo(() => `fill-${++fillIdCounter}`, []);

  useEffect(() => {
    // Register fill on mount
    registerFill({
      id: fillId,
      slot,
      order,
      pluginId,
      component: children,
    });

    // Unregister on unmount
    return () => {
      unregisterFill(fillId);
    };
  }, [fillId, slot, order, pluginId, children, registerFill, unregisterFill]);

  // Fill doesn't render anything directly
  return null;
}
