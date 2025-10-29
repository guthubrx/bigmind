/**
 * Manifest Loader
 * Loads and validates plugin manifests from JSON files
 * Phase 3 - Sprint 4
 */

import type { PluginManifest } from '@bigmind/plugin-system';

export interface LoadedManifest {
  manifest: PluginManifest;
  pluginPath: string;
}

/**
 * Glob pattern for all manifest.json files in plugins directory
 * Using Vite's import.meta.glob for static analysis at build time
 */
const manifestGlob = import.meta.glob('/src/plugins/**/manifest.json', { eager: true });

/**
 * Load a plugin manifest from a JSON file
 * @param pluginPath - Path to the plugin directory (e.g., 'plugins/core/tags-manager')
 * @returns Loaded manifest with plugin path
 */
export async function loadManifest(pluginPath: string): Promise<LoadedManifest | null> {
  try {
    // Normalize path to match glob pattern
    const normalizedPath = pluginPath.startsWith('/') ? pluginPath : `/${pluginPath}`;
    const manifestPath = `${normalizedPath}/manifest.json`;

    // Try to find manifest in glob results
    const manifestModule = manifestGlob[manifestPath] || manifestGlob[`/src${manifestPath}`];

    if (!manifestModule) {
      // console.warn(`[ManifestLoader] No manifest.json found at ${manifestPath}`);
      // console.debug('[ManifestLoader] Available manifests:', Object.keys(manifestGlob));
      return null;
    }

    // Extract default export or the module itself
    const manifest = (manifestModule as any).default || manifestModule;

    // Validate basic manifest structure
    if (!manifest.id || !manifest.name || !manifest.version) {
      // console.error(`[ManifestLoader] Invalid manifest at ${manifestPath}:`, manifest);
      return null;
    }

    // console.log(`[ManifestLoader] ✅ Loaded manifest for ${manifest.id} from ${manifestPath}`);

    return {
      manifest,
      pluginPath,
    };
  } catch (error) {
    console.error(`[ManifestLoader] Failed to load manifest from ${pluginPath}:`, error);
    return null;
  }
}

/**
 * Get all available manifests that were loaded via glob
 * @returns Array of all loaded manifests
 */
export function getAllAvailableManifests(): LoadedManifest[] {
  const manifests: LoadedManifest[] = [];

  Object.entries(manifestGlob).forEach(([path, module]) => {
    try {
      const manifest = (module as any).default || module;

      if (manifest && manifest.id && manifest.name && manifest.version) {
        // Extract plugin path from manifest file path
        // e.g., '/src/plugins/core/tags-manager/manifest.json' -> 'plugins/core/tags-manager'
        const pluginPath = path
          .replace('/src/', '')
          .replace('/manifest.json', '');

        manifests.push({ manifest, pluginPath });
      }
    } catch (error) {
      // console.error(`[ManifestLoader] Failed to parse manifest at ${path}:`, error);
    }
  });

  // console.log(`[ManifestLoader] Found ${manifests.length} manifests via glob`);

  return manifests;
}

/**
 * Load all manifests from a directory of plugins
 * @param pluginsDir - Directory containing plugins (e.g., 'src/plugins/core')
 * @param pluginIds - Array of plugin directory names
 * @returns Array of loaded manifests
 */
export async function loadAllManifests(
  pluginsDir: string,
  pluginIds: string[]
): Promise<LoadedManifest[]> {
  const results = await Promise.allSettled(
    pluginIds.map(id => loadManifest(`${pluginsDir}/${id}`))
  );

  const manifests: LoadedManifest[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      manifests.push(result.value);
    } else if (result.status === 'rejected') {
      // console.error(`[ManifestLoader] Failed to load ${pluginIds[index]}:`, result.reason);
    }
  });

  // console.log(`[ManifestLoader] Loaded ${manifests.length}/${pluginIds.length} manifests`);

  return manifests;
}

/**
 * Validate manifest against schema
 * @param manifest - Manifest to validate
 * @returns true if valid, false otherwise
 */
export function validateManifest(manifest: PluginManifest): boolean {
  // Required fields
  const requiredFields = ['id', 'name', 'version', 'author', 'main'];

  // Check all required fields using array methods instead of for...of
  const missingField = requiredFields.find(
    (field) => !manifest[field as keyof PluginManifest]
  );

  if (missingField) {
    // console.error(`[ManifestLoader] Missing required field: ${missingField}`);
    return false;
  }

  // Validate ID format
  if (!/^[a-z0-9-_.]+$/.test(manifest.id)) {
    // console.error(`[ManifestLoader] Invalid plugin ID format: ${manifest.id}`);
    return false;
  }

  // Validate version format (semver)
  if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
    // console.error(`[ManifestLoader] Invalid version format: ${manifest.version}`);
    return false;
  }

  return true;
}

/**
 * Merge manifest from JSON with TypeScript plugin module
 * This allows plugins to have manifest.json + index.ts
 */
export function mergeManifestWithModule(
  loadedManifest: LoadedManifest,
  pluginModule: any
): any {
  return {
    ...pluginModule,
    manifest: loadedManifest.manifest,
  };
}

/**
 * Discovery: Scan a directory for plugins with manifest.json
 * This is for future auto-discovery of community plugins
 */
export async function discoverPlugins(_directory: string): Promise<string[]> {
  // For now, return empty array
  // In the future, this could use filesystem APIs to scan for manifest.json files
  // console.log(`[ManifestLoader] Plugin discovery in ${_directory} not yet implemented`);
  return [];
}
