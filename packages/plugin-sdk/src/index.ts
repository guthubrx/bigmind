/**
 * @bigmind/plugin-sdk
 * SDK for building BigMind plugins with Phase 3 UI infrastructure
 */

// Core bridge
export { PluginBridge, bridge } from './bridge';

// React hooks
export { useBigMindBridge } from './hooks/useBigMindBridge';
export { useBigMindUI } from './hooks/useBigMindUI';
export { useTheme } from './hooks/useTheme';
export { useBigMindData } from './hooks/useBigMindData';

// Type exports
export type {
  // Message types
  BridgeMessage,
  BridgeResponse,

  // Plugin context
  PluginContext,

  // UI contributions
  PanelConfig,
  CommandConfig,
  MenuContribution,
  NodePropertiesTabConfig,

  // Theme
  Theme,

  // Data
  MindMapData,

  // Bridge APIs
  BigMindBridge,
  DialogConfig,
  BigMindUI,

  // Hook return types
  UseBigMindBridgeReturn,
  UseBigMindUIReturn,
  UseBigMindDataReturn,
  UseThemeReturn,
} from './types';
