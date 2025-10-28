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

  private migrations: Map<string, MigrationFunction> = new Map();

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

    // TODO: Phase 2 - Check for migration needs here
    const storedVersion = pluginData._meta.schemaVersion; // eslint-disable-line no-underscore-dangle
    if (storedVersion !== this.schemaVersion) {
      const msg = `[PluginStorage] Schema version mismatch for ${this.pluginId}`;
      console.warn(`${msg}: stored=${storedVersion}, current=${this.schemaVersion}`);
      // Migration will be handled in Phase 2
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
   * Register migration function (Phase 2)
   */
  registerMigration(fromVersion: string, toVersion: string, migrator: MigrationFunction): void {
    const key = `${fromVersion}->${toVersion}`;
    this.migrations.set(key, migrator);
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
