/**
 * Central registry for managing plugin lifecycle
 * Inspired by VS Code's ExtensionService
 */

/* eslint-disable no-console */

import type { Plugin, PluginInfo } from '../types/plugin';
import type { PluginManifest } from '../types/manifest';
import type { IPluginContext } from '../types/context';
import { PluginState } from '../types/plugin';
import { PermissionManager } from '../permissions/PermissionManager';
import { PluginSandbox } from '../runtime/PluginSandbox';
import { PluginContext } from '../runtime/PluginContext';
import { validateManifest } from '../validation/manifestSchema';
import { HookSystem } from './HookSystem';
import { EventEmitter } from 'eventemitter3';

/**
 * Central registry for managing plugin lifecycle
 */
export class PluginRegistry extends EventEmitter {
  private plugins = new Map<string, PluginInfo>();

  private permissionManager: PermissionManager;

  private hookSystem: HookSystem;

  private eventBus: EventEmitter;

  private bigmindVersion: string;

  constructor(
    permissionManager: PermissionManager,
    hookSystem: HookSystem,
    eventBus: EventEmitter,
    bigmindVersion: string = '1.0.0'
  ) {
    super();
    this.permissionManager = permissionManager;
    this.hookSystem = hookSystem;
    this.eventBus = eventBus;
    this.bigmindVersion = bigmindVersion;
  }

  /**
   * Register a plugin
   */
  async register(plugin: Plugin, autoActivate: boolean = true): Promise<void> {
    const { manifest } = plugin;

    // Validate manifest
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(
        `Invalid manifest for plugin ${manifest.id}: ${validation.errors.join(', ')}`
      );
    }

    // Check if already registered
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} is already registered`);
    }

    // Check version compatibility
    if (manifest.bigmindVersion && !this.isCompatible(manifest.bigmindVersion)) {
      const errorMsg = `Plugin ${manifest.id} requires BigMind ${manifest.bigmindVersion}`;
      throw new Error(`${errorMsg}, but current version is ${this.bigmindVersion}`);
    }

    // Create plugin info
    const info: PluginInfo = {
      plugin,
      state: PluginState.REGISTERED,
      context: null,
      activatedAt: null,
    };

    this.plugins.set(manifest.id, info);
    this.emit('plugin:registered', manifest.id, manifest);

    console.log(`[PluginRegistry] Registered plugin: ${manifest.id} v${manifest.version}`);

    // Auto-activate if enabled in manifest or by default
    if ((manifest.autoActivate ?? autoActivate) && autoActivate) {
      try {
        await this.activate(manifest.id);
      } catch (error) {
        console.warn(
          `[PluginRegistry] Failed to auto-activate plugin ${manifest.id}:`,
          error
        );
        // Don't throw - plugin is still registered, just not active
      }
    }
  }

  /**
   * Activate a plugin
   */
  async activate(pluginId: string): Promise<void> {
    const info = this.plugins.get(pluginId);

    if (!info) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    if (info.state === PluginState.ACTIVE) {
      console.warn(`[PluginRegistry] Plugin ${pluginId} is already active`);
      return;
    }

    try {
      // Request permissions
      const granted = await this.requestPermissions(info.plugin.manifest);
      if (!granted) {
        throw new Error('User denied permissions');
      }

      // Create plugin context
      const context = this.createPluginContext(info.plugin.manifest);

      // Create sandboxed context
      const sandbox = new PluginSandbox(pluginId, this.permissionManager);
      const sandboxedContext = sandbox.createSandboxedContext(context);

      // Activate plugin
      await info.plugin.activate(sandboxedContext);

      // Update state
      info.state = PluginState.ACTIVE;
      info.context = sandboxedContext;
      info.activatedAt = Date.now();

      this.emit('plugin:activated', pluginId);
      console.log(`[PluginRegistry] Activated plugin: ${pluginId}`);
    } catch (error) {
      info.state = PluginState.ERROR;
      info.error = error as Error;
      this.emit('plugin:error', pluginId, error);
      console.error(`[PluginRegistry] Failed to activate plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(pluginId: string): Promise<void> {
    const info = this.plugins.get(pluginId);

    if (!info) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    if (info.state !== PluginState.ACTIVE) {
      console.warn(`[PluginRegistry] Plugin ${pluginId} is not active`);
      return;
    }

    try {
      // Call deactivate hook
      if (info.plugin.deactivate) {
        await info.plugin.deactivate();
      }

      // Cleanup hooks registered by this plugin
      this.cleanupPluginHooks(pluginId);

      // Update state
      info.state = PluginState.INACTIVE;
      info.context = null;
      info.activatedAt = null;

      this.emit('plugin:deactivated', pluginId);
      console.log(`[PluginRegistry] Deactivated plugin: ${pluginId}`);
    } catch (error) {
      console.error(`[PluginRegistry] Error deactivating plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const info = this.plugins.get(pluginId);

    if (!info) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    // Deactivate if active
    if (info.state === PluginState.ACTIVE) {
      await this.deactivate(pluginId);
    }

    // Remove from registry
    this.plugins.delete(pluginId);

    // Revoke all permissions
    this.permissionManager.revokeAll(pluginId);

    this.emit('plugin:unregistered', pluginId);
    console.log(`[PluginRegistry] Unregistered plugin: ${pluginId}`);
  }

  /**
   * Get plugin info
   */
  getPlugin(pluginId: string): PluginInfo | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): Map<string, PluginInfo> {
    return new Map(this.plugins);
  }

  /**
   * Get plugins by state
   */
  getPluginsByState(state: PluginState): PluginInfo[] {
    return Array.from(this.plugins.values()).filter(info => info.state === state);
  }

  /**
   * Check if plugin is active
   */
  isActive(pluginId: string): boolean {
    const info = this.plugins.get(pluginId);
    return info?.state === PluginState.ACTIVE;
  }

  // ===== Private Methods =====

  /**
   * Check version compatibility using simple semver check
   */
  private isCompatible(requiredVersion: string): boolean {
    // Simplified version check - in production, use a proper semver library
    const currentMajor = parseInt(this.bigmindVersion.split('.')[0], 10);
    const requiredMajor = parseInt(requiredVersion.split('.')[0], 10);
    return currentMajor >= requiredMajor;
  }

  /**
   * Request permissions from user
   */
  private async requestPermissions(manifest: PluginManifest): Promise<boolean> {
    if (!manifest.permissions || manifest.permissions.length === 0) {
      return true; // No permissions needed
    }

    return this.permissionManager.requestPermissions(manifest.id, manifest.permissions);
  }

  /**
   * Create plugin context with granted permissions
   */
  private createPluginContext(manifest: PluginManifest): IPluginContext {
    // Create context with access to BigMind APIs
    return new PluginContext(
      manifest.id,
      manifest.version,
      this.hookSystem,
      this.eventBus,
      () => null // TODO: Connect to actual mind map state
    );
  }

  /**
   * Cleanup hooks registered by plugin
   */
  private cleanupPluginHooks(pluginId: string): void {
    this.hookSystem.removePluginHooks(pluginId);
  }
}
