/**
 * Plugin types and interfaces
 */

import type { IPluginContext } from './context';
import type { PluginManifest } from './manifest';

/**
 * Base interface that all plugins must implement
 */
export interface Plugin {
  /**
   * Plugin metadata
   */
  readonly manifest: PluginManifest;

  /**
   * Called when plugin is activated
   * Plugins should register hooks, commands, etc. here
   */
  activate(context: IPluginContext): void | Promise<void>;

  /**
   * Called when plugin is deactivated
   * Plugins should cleanup resources here
   */
  deactivate?(): void | Promise<void>;
}

/**
 * Plugin state
 */
export enum PluginState {
  REGISTERED = 'registered', // Loaded but not activated
  ACTIVE = 'active', // Running
  INACTIVE = 'inactive', // Stopped
  ERROR = 'error', // Failed to load/activate
}

/**
 * Plugin info (internal registry data)
 */
export interface PluginInfo {
  plugin: Plugin;
  state: PluginState;
  context: IPluginContext | null;
  activatedAt: number | null;
  error?: Error;
}
