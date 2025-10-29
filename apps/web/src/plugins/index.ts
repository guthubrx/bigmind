/**
 * Plugins Index - Auto-loader
 * Automatically discovers and exports all plugins from core/ and community/
 */

// Core Plugins (always enabled)
export * as colorPalettesCollection from './core/color-palettes-collection';
export * as paletteSettings from './core/palette-settings';
export * as tagsManager from './core/tags-manager';
export * as exportManager from './core/export-manager';
export * as xmindCompatibility from './core/xmind-compatibility';

// TODO: Auto-discovery from community/ folder
// For now, community plugins need to be manually added here

/**
 * Get all core plugins
 */
export const getAllCorePlugins = () => [
  require('./core/color-palettes-collection'),
  require('./core/palette-settings'),
  require('./core/tags-manager'),
  require('./core/export-manager'),
  require('./core/xmind-compatibility'),
];

/**
 * Get all community plugins
 */
export const getAllCommunityPlugins = () => {
  // TODO: Implement auto-discovery
  return [];
};

/**
 * Get all plugins (core + community)
 */
export const getAllPlugins = () => [
  ...getAllCorePlugins(),
  ...getAllCommunityPlugins(),
];
