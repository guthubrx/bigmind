/**
 * Plugins Index - Auto-loader
 * Automatically discovers and exports all plugins from core/, official/, and community/
 */

// Core Plugins (essential, auto-activated, non-disableable)
export * as themeManager from './core/theme-manager';
export * as xmindCompatibility from './core/xmind-compatibility';

// Official Plugins (team-made, optional, can be disabled)
export * as colorPalettesCollection from './official/color-palettes-collection';
export * as tagsManager from './official/tags-manager';
export * as exportManager from './official/export-manager';
export * as paletteSettings from './official/palette-settings';
export * as paletteManager from './official/palette-manager';
export * as dagTemplates from './official/dag-templates';
export * as dagTemplatesCollection from './official/dag-templates-collection';

// TODO: Auto-discovery from community/ folder
// For now, community plugins need to be manually added here

/**
 * Get all core plugins (essential, cannot be disabled)
 */
export const getAllCorePlugins = () => [
  require('./core/theme-manager'),
  require('./core/xmind-compatibility'),
];

/**
 * Get all official plugins (team-made, can be disabled)
 */
export const getAllOfficialPlugins = () => [
  require('./official/color-palettes-collection'),
  require('./official/tags-manager'),
  require('./official/export-manager'),
  require('./official/palette-settings'),
  require('./official/palette-manager'),
  require('./official/dag-templates'),
  require('./official/dag-templates-collection'),
];

/**
 * Get all community plugins
 */
export const getAllCommunityPlugins = () =>
  // TODO: Implement auto-discovery
  [];

/**
 * Get all plugins (core + official + community)
 */
export const getAllPlugins = () => [
  ...getAllCorePlugins(),
  ...getAllOfficialPlugins(),
  ...getAllCommunityPlugins(),
];
