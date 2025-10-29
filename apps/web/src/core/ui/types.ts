/**
 * Types for Slot/Fill System
 * Declarative UI extension mechanism inspired by WordPress Gutenberg
 */

import type { ReactNode } from 'react';

/**
 * Fill represents a piece of UI contributed by a plugin
 */
export interface Fill {
  id: string;
  slot: string;
  order: number;
  pluginId?: string;
  component: ReactNode;
}

/**
 * Context value for Slot/Fill system
 */
export interface SlotFillContextValue {
  fills: Map<string, Fill[]>;
  registerFill: (fill: Fill) => void;
  unregisterFill: (fillId: string) => void;
  getFills: (slotName: string) => Fill[];
}

/**
 * Props for Slot component
 */
export interface SlotProps {
  /** Unique name for this slot */
  name: string;
  /** Content to show when no fills are registered */
  fallback?: ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Wrapper component for each fill */
  fillWrapper?: (fill: Fill, children: ReactNode) => ReactNode;
}

/**
 * Props for Fill component
 */
export interface FillProps {
  /** Slot name to fill */
  slot: string;
  /** Order for sorting (lower = earlier, default 10) */
  order?: number;
  /** Child elements to render */
  children: ReactNode;
  /** Plugin ID (auto-injected by plugin system) */
  pluginId?: string;
}
