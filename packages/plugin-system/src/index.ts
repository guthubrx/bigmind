/**
 * BigMind Plugin System
 * Main entry point
 */

// ===== Core =====
// ===== Helper function to create a plugin system =====
import { PluginRegistry } from './core/PluginRegistry';
import { HookSystem } from './core/HookSystem';
import { PermissionManager, PermissionStorage } from './permissions/PermissionManager';
import { EventEmitter } from 'eventemitter3';

export { PluginRegistry } from './core/PluginRegistry';
export { HookSystem, HookType } from './core/HookSystem';

// ===== Types =====
export type { Plugin, PluginInfo } from './types/plugin';
export { PluginState } from './types/plugin';
export type { PluginManifest } from './types/manifest';
export type { IPluginContext } from './types/context';
export type { Permission } from './permissions/types';

// ===== Permissions =====
export { PermissionManager } from './permissions/PermissionManager';
export type { PermissionStorage } from './permissions/PermissionManager';
export { PermissionMetadataMap } from './permissions/types';

// ===== Runtime =====
export { PluginContext } from './runtime/PluginContext';
export { PluginSandbox } from './runtime/PluginSandbox';

// ===== Validation =====
export { validateManifest } from './validation/manifestSchema';

export interface PluginSystemOptions {
  bigmindVersion?: string;
  permissionStorage: PermissionStorage;
  eventBus: EventEmitter;
}

export function createPluginSystem(options: PluginSystemOptions) {
  const hookSystem = new HookSystem();
  const permissionManager = new PermissionManager(options.permissionStorage);
  const registry = new PluginRegistry(
    permissionManager,
    hookSystem,
    options.eventBus,
    options.bigmindVersion || '1.0.0'
  );

  // Connect registry to hook system for cleanup
  registry.on('plugin:cleanup-hooks', (pluginId: string) => {
    hookSystem.removePluginHooks(pluginId);
  });

  return {
    registry,
    hookSystem,
    permissionManager,
  };
}
