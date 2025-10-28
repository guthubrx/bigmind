/**
 * Centralized mindmap event emitter for plugins
 * This ensures all node operations trigger plugin events consistently
 */

import { pluginSystem } from './pluginManager';

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
    console.error('[mindmapEvents] Error triggering nodeCreated hook:', error);
  });
}

/**
 * Emit a node update event
 */
export function emitNodeUpdated(data: { nodeId: string; title: string; node: any }): void {
  pluginSystem.hookSystem.doAction('mindmap.nodeUpdated', data).catch(error => {
    console.error('[mindmapEvents] Error triggering nodeUpdated hook:', error);
  });
}

/**
 * Emit a node deletion event
 */
export function emitNodeDeleted(data: { nodeId: string; node: any }): void {
  pluginSystem.hookSystem.doAction('mindmap.nodeDeleted', data).catch(error => {
    console.error('[mindmapEvents] Error triggering nodeDeleted hook:', error);
  });
}
