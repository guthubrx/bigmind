/**
 * Plugin Context implementation
 * This is the main API that plugins interact with
 */

/* eslint-disable @typescript-eslint/no-explicit-any, class-methods-use-this, no-console */

import type { IPluginContext, MenuItem, PanelOptions, RequestOptions } from '../types/context';
import { HookSystem } from '../core/HookSystem';
import { EventEmitter } from 'eventemitter3';
import { debugLog } from '../utils/debug';

/**
 * Plugin Context implementation
 */
export class PluginContext implements IPluginContext {
  readonly pluginId: string;

  readonly version: string;

  constructor(
    pluginId: string,
    version: string,
    private hookSystem: HookSystem,
    private eventBus: EventEmitter,
    private getMindMapFn: () => any | null
  ) {
    this.pluginId = pluginId;
    this.version = version;
  }

  // ===== Convenience Hook Registration =====

  registerHook<T>(
    hookName: string,
    callback: (value: T, ...args: any[]) => T | Promise<T>,
    priority: number = 10
  ): () => void {
    return this.hookSystem.registerFilter(hookName, this.pluginId, callback, priority);
  }

  // ===== API Namespace (convenience accessor) =====

  get api() {
    return {
      mindmap: this.mindmap,
      storage: this.storage,
      commands: this.commands,
      ui: this.ui,
      events: this.events,
      http: this.http,
      fs: this.fs,
      clipboard: this.clipboard,
    };
  }

  // ===== Mind Map API =====

  mindmap = {
    getActive: (): any | null => this.getMindMapFn(),

    getAll: (): any[] => {
      // TODO: Implement when multi-mindmap support is added
      const active = this.getMindMapFn();
      return active ? [active] : [];
    },

    getSelection: (): any[] =>
      // TODO: Get selection from state
      [],
    updateNode: (nodeId: string, updates: any): void => {
      // TODO: Call command to update node
      debugLog('[PluginContext] updateNode:', nodeId, updates);
    },

    createNode: (parentId: string, data: any): any => {
      // TODO: Call command to create node
      debugLog('[PluginContext] createNode:', parentId, data);
      return {};
    },

    deleteNode: (nodeId: string): void => {
      // TODO: Call command to delete node
      debugLog('[PluginContext] deleteNode:', nodeId);
    },

    findNodes: (predicate: (node: any) => boolean): any[] => {
      // TODO: Traverse tree and filter
      debugLog('[PluginContext] findNodes:', predicate);
      return [];
    },
  };

  // ===== Hooks API =====

  hooks = {
    registerAction: (
      hookName: string,
      callback: (...args: any[]) => void | Promise<void>,
      priority: number = 10
    ): (() => void) => this.hookSystem.registerAction(hookName, this.pluginId, callback, priority),

    registerFilter: <T>(
      hookName: string,
      callback: (value: T, ...args: any[]) => T | Promise<T>,
      priority: number = 10
    ): (() => void) => this.hookSystem.registerFilter(hookName, this.pluginId, callback, priority),

    registerValidation: (
      hookName: string,
      callback: (...args: any[]) => boolean | string | Promise<boolean | string>,
      priority: number = 10
    ): (() => void) =>
      this.hookSystem.registerValidation(hookName, this.pluginId, callback, priority),

    doAction: (hookName: string, ...args: any[]): Promise<void> =>
      this.hookSystem.doAction(hookName, ...args),

    applyFilters: <T>(hookName: string, value: T, ...args: any[]): Promise<T> =>
      this.hookSystem.applyFilters(hookName, value, ...args),

    validate: (hookName: string, ...args: any[]): Promise<{ valid: boolean; errors: string[] }> =>
      this.hookSystem.validate(hookName, ...args),
  };

  // ===== Commands API =====

  commands = {
    registerCommand: (
      id: string,
      _handler: (...args: any[]) => void | Promise<void>
    ): (() => void) => {
      // TODO: Register command in command registry
      debugLog('[PluginContext] registerCommand:', id);
      return () => debugLog('[PluginContext] unregister command:', id);
    },

    executeCommand: (id: string, ...args: any[]): Promise<void> => {
      // TODO: Execute command from command registry
      debugLog('[PluginContext] executeCommand:', id, args);
      return Promise.resolve();
    },

    getCommands: (): string[] =>
      // TODO: Get all available commands
      [],
  };

  // ===== UI API =====

  ui = {
    showNotification: (
      message: string,
      type: 'info' | 'success' | 'warning' | 'error' = 'info'
    ): void => {
      // TODO: Show notification in UI
      debugLog(`[PluginContext] Notification (${type}):`, message);
    },

    showConfirmDialog: async (message: string, options?: { title?: string }): Promise<boolean> => {
      // TODO: Show confirmation dialog
      debugLog('[PluginContext] Confirm dialog:', message, options);
      return true;
    },

    registerMenuItem: (location: string, item: MenuItem): (() => void) => {
      // TODO: Register menu item
      debugLog('[PluginContext] registerMenuItem:', location, item);
      return () => debugLog('[PluginContext] unregister menu item');
    },

    registerPanel: (id: string, panel: PanelOptions): (() => void) => {
      // TODO: Register panel
      debugLog('[PluginContext] registerPanel:', id, panel);
      return () => debugLog('[PluginContext] unregister panel');
    },
  };

  // ===== Storage API =====

  storage = {
    get: async <T>(key: string): Promise<T | undefined> => {
      const storageKey = `plugin:${this.pluginId}:${key}`;
      const value = localStorage.getItem(storageKey);
      return value ? JSON.parse(value) : undefined;
    },

    set: async <T>(key: string, value: T): Promise<void> => {
      const storageKey = `plugin:${this.pluginId}:${key}`;
      localStorage.setItem(storageKey, JSON.stringify(value));
    },

    remove: async (key: string): Promise<void> => {
      const storageKey = `plugin:${this.pluginId}:${key}`;
      localStorage.removeItem(storageKey);
    },

    keys: async (): Promise<string[]> => {
      const prefix = `plugin:${this.pluginId}:`;
      return Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .map(k => k.slice(prefix.length));
    },

    registerMigration: (
      _fromVersion: string,
      _toVersion: string,
      _migrator: (oldData: any) => any
    ): void => {
      // TODO: Implement migration registration for localStorage-based storage
      console.warn(
        '[PluginContext] Migration registration not yet supported for localStorage storage'
      );
    },

    getSchemaVersion: (): string =>
      // For localStorage, we don't track schema versions yet
      '1',
    setSchemaVersion: (_version: string): void => {
      // For localStorage, we don't track schema versions yet
      console.warn('[PluginContext] setSchemaVersion not yet supported for localStorage storage');
    },
  };

  // ===== Events API =====

  events = {
    on: (event: string, handler: (...args: any[]) => void): (() => void) => {
      this.eventBus.on(event, handler);
      return () => this.eventBus.off(event, handler);
    },

    emit: (event: string, ...args: any[]): void => {
      this.eventBus.emit(event, ...args);
    },
  };

  // ===== Optional APIs (based on permissions) =====

  // HTTP API (requires 'network' permission)
  http = {
    request: async <T>(url: string, options?: RequestOptions): Promise<T> => {
      const response = await fetch(url, options as RequestInit);
      return response.json();
    },
  };

  // Filesystem API (requires 'filesystem:read' permission)
  fs = {
    readFile: async (_path: string): Promise<string> => {
      throw new Error('Not implemented - requires native file system access');
    },

    writeFile: async (_path: string, _content: string): Promise<void> => {
      throw new Error('Not implemented - requires native file system access');
    },
  };

  // Clipboard API (requires 'clipboard' permission)
  clipboard = {
    read: async (): Promise<string> => navigator.clipboard.readText(),

    write: async (text: string): Promise<void> => navigator.clipboard.writeText(text),
  };

  // ===== Plugin Dependency Methods =====

  markAsRequired(_minVersion?: string, _maxVersion?: string): void {
    // TODO: Implement dependency marking for file-based storage
    console.warn('[PluginContext] markAsRequired not yet supported for localStorage storage');
  }

  markAsRecommended(_minVersion?: string, _maxVersion?: string): void {
    // TODO: Implement dependency marking for file-based storage
    console.warn('[PluginContext] markAsRecommended not yet supported for localStorage storage');
  }
}
