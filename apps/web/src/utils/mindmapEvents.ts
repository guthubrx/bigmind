/**
 * Centralized event emitter for plugins
 * This ensures ALL system operations can be intercepted by plugins
 * Provides a complete event system for extensibility
 */

import { pluginSystem } from './pluginManager';

// ========================================
// MINDMAP EVENTS - Node Operations
// ========================================

/**
 * Emit a node creation event
 */
export function emitNodeCreated(data: {
  nodeId: string;
  parentId: string | null;
  title: string;
  node: any;
}): void {
  pluginSystem.hookSystem.doAction('mindmap.nodeCreated', data).catch(error => {
    console.error('[events] Error triggering nodeCreated:', error);
  });
}

/**
 * Emit a node update event
 */
export function emitNodeUpdated(data: { nodeId: string; title: string; node: any }): void {
  pluginSystem.hookSystem.doAction('mindmap.nodeUpdated', data).catch(error => {
    console.error('[events] Error triggering nodeUpdated:', error);
  });
}

/**
 * Emit a node deletion event
 */
export function emitNodeDeleted(data: { nodeId: string; node: any }): void {
  pluginSystem.hookSystem.doAction('mindmap.nodeDeleted', data).catch(error => {
    console.error('[events] Error triggering nodeDeleted:', error);
  });
}

/**
 * Emit a node selection event
 */
export function emitNodeSelected(data: { nodeId: string | null; nodeIds: string[] }): void {
  pluginSystem.hookSystem.doAction('mindmap.nodeSelected', data).catch(error => {
    console.error('[events] Error triggering nodeSelected:', error);
  });
}

/**
 * Emit a node style change event
 */
export function emitNodeStyleChanged(data: { nodeId: string; style: any }): void {
  pluginSystem.hookSystem.doAction('mindmap.nodeStyleChanged', data).catch(error => {
    console.error('[events] Error triggering nodeStyleChanged:', error);
  });
}

// ========================================
// FILE EVENTS - File Operations
// ========================================

/**
 * Emit a file created event
 */
export function emitFileCreated(data: { fileId: string; name: string; type: string }): void {
  pluginSystem.hookSystem.doAction('file.created', data).catch(error => {
    console.error('[events] Error triggering file.created:', error);
  });
}

/**
 * Emit a file opened event
 */
export function emitFileOpened(data: {
  fileId: string;
  name: string;
  type: string;
  path?: string;
}): void {
  pluginSystem.hookSystem.doAction('file.opened', data).catch(error => {
    console.error('[events] Error triggering file.opened:', error);
  });
}

/**
 * Emit a file closed event
 */
export function emitFileClosed(data: { fileId: string; name: string }): void {
  pluginSystem.hookSystem.doAction('file.closed', data).catch(error => {
    console.error('[events] Error triggering file.closed:', error);
  });
}

/**
 * Emit a file activated event (switched to)
 */
export function emitFileActivated(data: { fileId: string; name: string }): void {
  pluginSystem.hookSystem.doAction('file.activated', data).catch(error => {
    console.error('[events] Error triggering file.activated:', error);
  });
}

/**
 * Emit a sheet changed event (for XMind multi-sheet files)
 */
export function emitSheetChanged(data: {
  fileId: string;
  sheetId: string;
  sheetTitle: string;
}): void {
  pluginSystem.hookSystem.doAction('file.sheetChanged', data).catch(error => {
    console.error('[events] Error triggering file.sheetChanged:', error);
  });
}

// ========================================
// VIEWPORT EVENTS - Canvas View
// ========================================

/**
 * Emit a viewport changed event
 */
export function emitViewportChanged(data: { x: number; y: number; zoom: number }): void {
  pluginSystem.hookSystem.doAction('viewport.changed', data).catch(error => {
    console.error('[events] Error triggering viewport.changed:', error);
  });
}

// ========================================
// COLOR EVENTS - Palette & Theming
// ========================================

/**
 * Emit a palette changed event
 */
export function emitPaletteChanged(data: {
  type: 'node' | 'tag';
  paletteId: string;
}): void {
  pluginSystem.hookSystem.doAction('palette.changed', data).catch(error => {
    console.error('[events] Error triggering palette.changed:', error);
  });
}

/**
 * Emit a colors applied event
 */
export function emitColorsApplied(data: { theme: any }): void {
  pluginSystem.hookSystem.doAction('colors.applied', data).catch(error => {
    console.error('[events] Error triggering colors.applied:', error);
  });
}

/**
 * Emit a theme changed event
 */
export function emitThemeChanged(data: { themeId: string }): void {
  pluginSystem.hookSystem.doAction('theme.changed', data).catch(error => {
    console.error('[events] Error triggering theme.changed:', error);
  });
}

// ========================================
// SETTINGS EVENTS - Application Settings
// ========================================

/**
 * Emit a settings changed event
 */
export function emitSettingsChanged(data: { setting: string; value: any }): void {
  pluginSystem.hookSystem.doAction('settings.changed', data).catch(error => {
    console.error('[events] Error triggering settings.changed:', error);
  });
}

// ========================================
// CANVAS EVENTS - Canvas Options
// ========================================

/**
 * Emit a canvas option changed event
 */
export function emitCanvasOptionChanged(data: { option: string; value: any }): void {
  pluginSystem.hookSystem.doAction('canvas.optionChanged', data).catch(error => {
    console.error('[events] Error triggering canvas.optionChanged:', error);
  });
}

// ========================================
// TAG EVENTS - Tag Management
// ========================================

/**
 * Emit a tag created event
 */
export function emitTagCreated(data: { tagId: string; label: string; color: string }): void {
  pluginSystem.hookSystem.doAction('tag.created', data).catch(error => {
    console.error('[events] Error triggering tag.created:', error);
  });
}

/**
 * Emit a tag deleted event
 */
export function emitTagDeleted(data: { tagId: string }): void {
  pluginSystem.hookSystem.doAction('tag.deleted', data).catch(error => {
    console.error('[events] Error triggering tag.deleted:', error);
  });
}

/**
 * Emit a tag visibility changed event
 */
export function emitTagVisibilityChanged(data: { tagId: string; hidden: boolean }): void {
  pluginSystem.hookSystem.doAction('tag.visibilityChanged', data).catch(error => {
    console.error('[events] Error triggering tag.visibilityChanged:', error);
  });
}

/**
 * Emit a node tagged event
 */
export function emitNodeTagged(data: { nodeId: string; tagId: string }): void {
  pluginSystem.hookSystem.doAction('tag.nodeTagged', data).catch(error => {
    console.error('[events] Error triggering tag.nodeTagged:', error);
  });
}

/**
 * Emit a node untagged event
 */
export function emitNodeUntagged(data: { nodeId: string; tagId: string }): void {
  pluginSystem.hookSystem.doAction('tag.nodeUntagged', data).catch(error => {
    console.error('[events] Error triggering tag.nodeUntagged:', error);
  });
}
