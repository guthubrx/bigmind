/**
 * File Format Extensions for Plugin Storage
 * Defines the extended BigMind file format with plugin data support
 */

/**
 * Plugin dependency declaration
 */
export interface PluginDependency {
  id: string; // "com.bigmind.palette-manager"
  minVersion: string; // "2.0.0"
  maxVersion?: string; // "3.0.0" (optional)
  dataSchemaVersion: string; // "2" (version of data schema)
}

/**
 * Metadata for plugin-stored data
 */
export interface PluginStorageMetadata {
  pluginVersion: string; // Version of plugin that wrote the data
  schemaVersion: string; // Version of data schema
  writtenAt: string; // ISO timestamp
  migrationHistory: string[]; // ["1->2", "2->3"]
}

/**
 * Plugin storage data container
 */
export interface PluginStorageData {
  _meta: PluginStorageMetadata;
  data: Record<string, any>; // Plugin data (key-value pairs)
}

/**
 * Plugin metadata in file
 */
export interface PluginMetadata {
  required: PluginDependency[]; // Plugins necessary for this map
  recommended: PluginDependency[]; // Plugins recommended for this map
}

/**
 * Extended BigMind file format with plugin support
 */
export interface ExtendedMindMapData {
  // Core identification
  id?: string;
  name?: string;

  // Version of BigMind file format
  version?: string;

  // Plugin metadata
  plugins?: PluginMetadata;

  // Plugin data (namespaced by plugin ID)
  pluginData?: Record<string, PluginStorageData>;

  // Core data (existing fields)
  nodes: Record<string, any>;
  edges?: Record<string, any>;
  root?: string;
  rootNode?: {
    id: string;
    title: string;
    children: any[];
  };

  // Map settings
  defaultNodeStyle?: {
    fontSize?: number;
    width?: number;
    height?: number;
    fontFamily?: string;
  };

  // Legacy fields (to be migrated)
  nodePaletteId?: string;
  tagPaletteId?: string;

  // Allow any additional fields for flexibility
  [key: string]: any;
}

/**
 * Migration function type
 */
export type MigrationFunction = (oldData: any) => any | Promise<any>;

/**
 * Plugin schema declaration
 */
export interface PluginSchemaDeclaration {
  version: string; // Current schema version
  compatibleWith?: string[]; // Schema versions this plugin can read
  fields?: Record<string, any>; // Schema field definitions
}

/**
 * Helper to check if file has plugin data
 */
export function hasPluginData(file: any): file is ExtendedMindMapData {
  return file && typeof file === 'object' && 'pluginData' in file;
}

/**
 * Helper to get plugin data safely
 */
export function getPluginData(
  file: ExtendedMindMapData,
  pluginId: string
): PluginStorageData | undefined {
  return file.pluginData?.[pluginId];
}

/**
 * Helper to initialize plugin data structure
 */
export function initializePluginData(
  file: ExtendedMindMapData,
  pluginId: string,
  pluginVersion: string,
  schemaVersion: string
): void {
  if (!file.pluginData) {
    file.pluginData = {};
  }

  if (!file.pluginData[pluginId]) {
    file.pluginData[pluginId] = {
      _meta: {
        pluginVersion,
        schemaVersion,
        writtenAt: new Date().toISOString(),
        migrationHistory: [],
      },
      data: {},
    };
  }
}

/**
 * Helper to add plugin dependency
 */
export function addPluginDependency(
  file: ExtendedMindMapData,
  dependency: PluginDependency,
  type: 'required' | 'recommended' = 'required'
): void {
  if (!file.plugins) {
    file.plugins = { required: [], recommended: [] };
  }

  const list = type === 'required' ? file.plugins.required : file.plugins.recommended;

  // Check if already exists
  const exists = list.some(d => d.id === dependency.id);
  if (!exists) {
    list.push(dependency);
  }
}

/**
 * Helper to remove plugin dependency
 */
export function removePluginDependency(file: ExtendedMindMapData, pluginId: string): void {
  if (!file.plugins) return;

  file.plugins.required = file.plugins.required.filter(d => d.id !== pluginId);
  file.plugins.recommended = file.plugins.recommended.filter(d => d.id !== pluginId);
}
