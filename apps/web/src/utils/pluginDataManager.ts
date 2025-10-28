/**
 * Plugin Data Manager
 * Centralized management of plugin storage instances
 */

import type { ExtendedMindMapData } from './fileFormat';
import type { IPluginStorage } from './pluginStorage';
import { createPluginStorage } from './pluginStorage';
import { useOpenFiles } from '../hooks/useOpenFiles';

/**
 * Manager for plugin storage instances
 */
class PluginDataManager {
  private storageInstances: Map<string, IPluginStorage> = new Map();

  /**
   * Get or create storage for a plugin
   */
  getStorage(pluginId: string, pluginVersion: string, schemaVersion: string): IPluginStorage {
    const key = PluginDataManager.getStorageKey(pluginId);

    if (this.storageInstances.has(key)) {
      return this.storageInstances.get(key)!;
    }

    // Get active file
    const activeFile = useOpenFiles.getState().getActiveFile();
    if (!activeFile || !activeFile.content) {
      throw new Error('No active file for plugin storage');
    }

    // Create storage instance
    const storage = createPluginStorage(
      pluginId,
      pluginVersion,
      schemaVersion,
      activeFile.content as ExtendedMindMapData,
      async () => {
        // Save callback - trigger file save
        // In BigMind, files are auto-saved via Zustand state updates
        // This is just to ensure consistency
        await PluginDataManager.saveActiveFile();
      }
    );

    this.storageInstances.set(key, storage);
    return storage;
  }

  /**
   * Clear storage instance (when plugin is deactivated)
   */
  clearStorage(pluginId: string): void {
    const key = PluginDataManager.getStorageKey(pluginId);
    this.storageInstances.delete(key);
  }

  /**
   * Clear all storage instances
   */
  clearAll(): void {
    this.storageInstances.clear();
  }

  /**
   * Save active file
   */
  private static async saveActiveFile(): Promise<void> {
    const state = useOpenFiles.getState();
    // Zustand automatically persists state, so this just ensures consistency
    state.saveOpenFilesToStorage();
  }

  /**
   * Get storage key
   */
  private static getStorageKey(pluginId: string): string {
    const activeFile = useOpenFiles.getState().getActiveFile();
    return `${pluginId}:${activeFile?.id || 'global'}`;
  }
}

// Singleton instance
export const pluginDataManager = new PluginDataManager();
