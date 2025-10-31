/**
 * Slot Component
 * Renders fills registered for this slot
 */

import { useSlotFill } from './SlotFillContext';
import type { SlotProps } from './types';

export function Slot({ name, fallback = null, className = '', fillWrapper }: SlotProps) {
  const { getFills } = useSlotFill();
  const fills = getFills(name);

  return (
    <div className={`slot slot-${name} ${className}`.trim()} data-slot={name}>
      {fills.length === 0
        ? fallback
        : fills.map(fill => {
            const content = (
              <div key={fill.id} data-fill-id={fill.id} data-plugin-id={fill.pluginId}>
                {fill.component}
              </div>
            );

            return fillWrapper ? fillWrapper(fill, content) : content;
          })}
    </div>
  );
}
