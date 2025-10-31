/**
 * Plugin Sandbox
 * Phase 1: Soft sandbox using Proxies
 * Phase 2+: Hard sandbox using Web Workers
 */

/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

import type { IPluginContext } from '../types/context';
import type { Permission } from '../permissions/types';
import { PermissionManager } from '../permissions/PermissionManager';
import { debugLog } from '../utils/debug';

/**
 * Plugin Sandbox
 */
export class PluginSandbox {
  constructor(
    private pluginId: string,
    private permissionManager: PermissionManager
  ) {}

  /**
   * Create a sandboxed context that enforces permissions
   */
  createSandboxedContext(fullContext: IPluginContext): IPluginContext {
    return new Proxy(fullContext, {
      get: (target, prop) => {
        const value = (target as any)[prop];

        // Check permission for restricted APIs
        this.checkPermission(prop as string);

        // Bind functions to maintain correct 'this' context
        if (typeof value === 'function') {
          return value.bind(target);
        }

        // Wrap objects to add logging
        if (typeof value === 'object' && value !== null) {
          return this.wrapAPIObject(value, String(prop));
        }

        return value;
      },
    }) as IPluginContext;
  }

  /**
   * Wrap an API object to add logging and permission checks
   */
  private wrapAPIObject(obj: any, namespace: string): any {
    return new Proxy(obj, {
      get: (target, prop) => {
        const value = target[prop];

        if (typeof value === 'function') {
          return (...args: any[]) => {
            // Log API call
            debugLog(`[Plugin ${this.pluginId}] ${namespace}.${String(prop)}()`);

            // Call original with correct 'this' context
            return value.apply(target, args);
          };
        }

        // Recursively wrap nested objects
        if (typeof value === 'object' && value !== null) {
          return this.wrapAPIObject(value, `${namespace}.${String(prop)}`);
        }

        return value;
      },
    });
  }

  /**
   * Check if plugin has required permission for API
   */
  private checkPermission(apiName: string): void {
    const permissionMap: Record<string, Permission> = {
      fs: 'filesystem:read',
      http: 'network',
      clipboard: 'clipboard',
    };

    const required = permissionMap[apiName];

    if (required && !this.permissionManager.has(this.pluginId, required)) {
      throw new Error(`Plugin ${this.pluginId} does not have permission: ${required}`);
    }
  }
}
