/**
 * @bigmind/plugin-marketplace
 * Plugin marketplace client for BigMind
 */

// Main API client
export { PluginStore } from './PluginStore';

// Types
export type {
  PluginListing,
  PluginSearchFilters,
  UpdateInfo,
  InstallProgress,
  InstalledPlugin
} from './types';

// React Components
export { PluginCard } from './components/PluginCard';
export { PluginList } from './components/PluginList';
export { PluginFilters } from './components/PluginFilters';
export { InstallButton } from './components/InstallButton';

export type { PluginCardProps } from './components/PluginCard';
export type { PluginListProps } from './components/PluginList';
export type { PluginFiltersProps } from './components/PluginFilters';
export type { InstallButtonProps } from './components/InstallButton';
