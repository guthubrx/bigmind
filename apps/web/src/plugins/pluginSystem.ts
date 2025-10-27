/**
 * Plugin System Integration for BigMind Web App
 */

import { createPluginSystem, PermissionStorage, Permission } from '@bigmind/plugin-system';
import { eventBus } from '../utils/eventBus';

/**
 * LocalStorage-based permission storage
 */
class LocalStoragePermissionStorage implements PermissionStorage {
  private key = 'bigmind:plugin-permissions';

  async save(permissions: Map<string, Set<Permission>>): Promise<void> {
    const data: Record<string, Permission[]> = {};

    Array.from(permissions.entries()).forEach(([pluginId, perms]) => {
      data[pluginId] = Array.from(perms);
    });

    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async load(): Promise<Map<string, Set<Permission>> | null> {
    const json = localStorage.getItem(this.key);

    if (!json) {
      return null;
    }

    const data: Record<string, Permission[]> = JSON.parse(json);
    const result = new Map<string, Set<Permission>>();

    Object.entries(data).forEach(([pluginId, perms]) => {
      result.set(pluginId, new Set(perms));
    });

    return result;
  }
}

/**
 * Initialize plugin system
 */
export const pluginSystem = createPluginSystem({
  bigmindVersion: '1.0.0',
  permissionStorage: new LocalStoragePermissionStorage(),
  eventBus,
});

// Export for easy access
export const { registry, hookSystem, permissionManager } = pluginSystem;
