/**
 * Plugin Storage System
 * Provides isolated storage for each plugin within BigMind files
 */

import type { ExtendedMindMapData, PluginDependency, MigrationFunction } from './fileFormat';
import {
  initializePluginData,
  getPluginData,
  addPluginDependency,
  removePluginDependency,
} from './fileFormat';
import { migrationRegistry } from './migrationManager';

/**
 * Plugin storage interface
 */
export interface IPluginStorage {
  /**
   * Read data with automatic migration if necessary
   */
  get<T>(key: string): Promise<T | undefined>;

  /**
   * Write data with automatic metadata
   */
  set(key: string, value: any): Promise<void>;

  /**
   * Delete data
   */
  delete(key: string): Promise<void>;

  /**
   * Get all keys stored by this plugin
   */
  keys(): Promise<string[]>;

  /**
   * Register a migration function
   */
  registerMigration(fromVersion: string, toVersion: string, migrator: MigrationFunction): void;

  /**
   * Get current schema version
   */
  getSchemaVersion(): string;

  /**
   * Set schema version
   */
  setSchemaVersion(version: string): void;

  /**
   * Mark plugin as required for this file
   */
  markAsRequired(minVersion?: string, maxVersion?: string): void;

  /**
   * Mark plugin as recommended for this file
   */
  markAsRecommended(minVersion?: string, maxVersion?: string): void;

  /**
   * Remove plugin dependency
   */
  unmarkDependency(): void;
}

/**
 * Storage configuration
 */
export interface PluginStorageConfig {
  pluginId: string;
  pluginVersion: string;
  schemaVersion: string;
  fileData: ExtendedMindMapData;
  onSave: () => Promise<void>;
}

/**
 * Plugin Storage Implementation (Phase 1 - Basic Storage)
 */
export class PluginStorage implements IPluginStorage {
  private pluginId: string;

  private pluginVersion: string;

  private schemaVersion: string;

  private fileData: ExtendedMindMapData;

  private onSave: () => Promise<void>;

  constructor(config: PluginStorageConfig) {
    this.pluginId = config.pluginId;
    this.pluginVersion = config.pluginVersion;
    this.schemaVersion = config.schemaVersion;
    this.fileData = config.fileData;
    this.onSave = config.onSave;
  }

  /**
   * Get data for a key
   */
  async get<T>(key: string): Promise<T | undefined> {
    // Ensure plugin data structure exists
    this.ensurePluginDataExists();

    const pluginData = getPluginData(this.fileData, this.pluginId);
    if (!pluginData) {
      return undefined;
    }

    // Check for migration needs
    const storedVersion = pluginData._meta.schemaVersion; // eslint-disable-line no-underscore-dangle
    if (storedVersion !== this.schemaVersion) {
      // const msg = `[PluginStorage] Schema version mismatch for ${this.pluginId}`;
      // eslint-disable-next-line no-console

      // Attempt automatic migration
      await this.performMigration(storedVersion, this.schemaVersion);
    }

    return pluginData.data[key] as T;
  }

  /**
   * Set data for a key
   */
  async set(key: string, value: any): Promise<void> {
    // Ensure plugin data structure exists
    this.ensurePluginDataExists();

    const pluginData = getPluginData(this.fileData, this.pluginId);
    if (!pluginData) {
      throw new Error(`Plugin data not initialized for ${this.pluginId}`);
    }

    // Update data
    pluginData.data[key] = value;

    // Update metadata
    pluginData._meta.pluginVersion = this.pluginVersion; // eslint-disable-line no-underscore-dangle
    pluginData._meta.schemaVersion = this.schemaVersion; // eslint-disable-line no-underscore-dangle

    // Trigger save
    await this.onSave();
  }

  /**
   * Delete data for a key
   */
  async delete(key: string): Promise<void> {
    const pluginData = getPluginData(this.fileData, this.pluginId);
    if (!pluginData) {
      return;
    }

    delete pluginData.data[key];

    // Trigger save
    await this.onSave();
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    const pluginData = getPluginData(this.fileData, this.pluginId);
    if (!pluginData) {
      return [];
    }

    return Object.keys(pluginData.data);
  }

  /**
   * Register migration function
   */
  registerMigration(fromVersion: string, toVersion: string, migrator: MigrationFunction): void {
    const manager = migrationRegistry.getManager(this.pluginId);
    manager.registerMigration(fromVersion, toVersion, migrator);
  }

  /**
   * Get schema version
   */
  getSchemaVersion(): string {
    return this.schemaVersion;
  }

  /**
   * Set schema version
   */
  setSchemaVersion(version: string): void {
    this.schemaVersion = version;
  }

  /**
   * Ensure plugin data structure exists
   */
  private ensurePluginDataExists(): void {
    if (!this.fileData.pluginData || !this.fileData.pluginData[this.pluginId]) {
      initializePluginData(this.fileData, this.pluginId, this.pluginVersion, this.schemaVersion);
    }
  }

  /**
   * Mark plugin as required for this file
   */
  markAsRequired(minVersion?: string, maxVersion?: string): void {
    const dependency: PluginDependency = {
      id: this.pluginId,
      minVersion: minVersion || this.pluginVersion,
      maxVersion,
      dataSchemaVersion: this.schemaVersion,
    };

    addPluginDependency(this.fileData, dependency, 'required');
  }

  /**
   * Mark plugin as recommended for this file
   */
  markAsRecommended(minVersion?: string, maxVersion?: string): void {
    const dependency: PluginDependency = {
      id: this.pluginId,
      minVersion: minVersion || this.pluginVersion,
      maxVersion,
      dataSchemaVersion: this.schemaVersion,
    };

    addPluginDependency(this.fileData, dependency, 'recommended');
  }

  /**
   * Remove plugin dependency
   */
  unmarkDependency(): void {
    removePluginDependency(this.fileData, this.pluginId);
  }

  /**
   * Perform migration from one version to another
   */
  private async performMigration(fromVersion: string, toVersion: string): Promise<void> {
    const manager = migrationRegistry.getManager(this.pluginId);
    const pluginData = getPluginData(this.fileData, this.pluginId);

    if (!pluginData) {
      // eslint-disable-next-line no-console
      console.error(`[PluginStorage] Cannot migrate: no data for ${this.pluginId}`);
      return;
    }

    // Check if migration is possible
    if (!manager.canMigrate(fromVersion, toVersion)) {
      // eslint-disable-next-line no-console
      console.warn(`[PluginStorage] No migration path from ${fromVersion} to ${toVersion}`);
      return;
    }

    // Execute migration
    const result = await manager.migrate(pluginData.data, fromVersion, toVersion);

    if (result.success) {
      // eslint-disable-next-line no-console
      //   `[PluginStorage] Migration successful for ${this.pluginId}:`,
      //   result.migrationHistory
      // );

      // Update plugin data with migrated data
      pluginData.data = result.data;

      // Update metadata
      pluginData._meta.schemaVersion = toVersion; // eslint-disable-line no-underscore-dangle
      pluginData._meta.pluginVersion = this.pluginVersion; // eslint-disable-line no-underscore-dangle

      // eslint-disable-next-line no-underscore-dangle
      const existingHistory = pluginData._meta.migrationHistory || [];
      // eslint-disable-next-line no-underscore-dangle
      pluginData._meta.migrationHistory = [...existingHistory, ...result.migrationHistory];

      // Trigger save
      await this.onSave();
    } else {
      // eslint-disable-next-line no-console
      console.error(`[PluginStorage] Migration failed for ${this.pluginId}:`, result.error);
    }
  }
}

/**
 * Factory to create PluginStorage instances
 */
export function createPluginStorage(
  pluginId: string,
  pluginVersion: string,
  schemaVersion: string,
  fileData: ExtendedMindMapData,
  onSave: () => Promise<void>
): IPluginStorage {
  return new PluginStorage({
    pluginId,
    pluginVersion,
    schemaVersion,
    fileData,
    onSave,
  });
}
