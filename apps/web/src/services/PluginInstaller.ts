/**
 * Plugin Installer Service
 * Handles installation of remote plugins from GitHub registry
 */

import { gitHubPluginRegistry } from './GitHubPluginRegistry';
import { recordPluginDownload } from './supabaseClient';
import type { Plugin, PluginManifest } from '@cartae/plugin-system';

// IndexedDB configuration
const DB_NAME = 'bigmind-plugins';
const DB_VERSION = 1;
const STORE_NAME = 'installed-plugins';

interface InstalledPluginData {
  id: string;
  manifest: PluginManifest;
  code: string;
  installedAt: string;
  version: string;
}

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save plugin to IndexedDB
 */
async function savePluginToDB(data: InstalledPluginData): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get plugin from IndexedDB
 */
async function getPluginFromDB(pluginId: string): Promise<InstalledPluginData | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(pluginId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Remove plugin from IndexedDB
 */
async function removePluginFromDB(pluginId: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(pluginId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all installed plugins from IndexedDB
 */
export async function getAllInstalledPlugins(): Promise<InstalledPluginData[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Load plugin code dynamically and create Plugin object
 */
async function createPluginFromCode(code: string, manifest: PluginManifest): Promise<Plugin> {
  try {
    // FR: Essayer d'abord le dynamic import avec blob URL (pour ESM)
    // EN: Try dynamic import with blob URL first (for ESM)
    try {
      const blob = new Blob([code], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);

      try {
        const pluginModule = await import(/* @vite-ignore */ url);
        URL.revokeObjectURL(url);

        // Support both formats:
        // 1. Default export: export default { activate, deactivate }
        // 2. Named exports: export { activate, deactivate }
        const pluginInstance = pluginModule.default || pluginModule;

        if (typeof pluginInstance.activate !== 'function') {
          throw new Error('Plugin must export an activate function');
        }

        return {
          manifest,
          activate: pluginInstance.activate.bind(pluginInstance),
          deactivate: pluginInstance.deactivate
            ? pluginInstance.deactivate.bind(pluginInstance)
            : async () => {},
        };
      } catch (importError) {
        URL.revokeObjectURL(url);
        throw importError;
      }
    } catch (esmError) {
      // FR: Si ESM échoue, essayer le format UMD/CommonJS
      // EN: If ESM fails, try UMD/CommonJS format
      console.warn(
        '[PluginInstaller] ESM import failed, trying UMD/CommonJS:',
        esmError instanceof Error ? esmError.message : 'Unknown error'
      );

      // For UMD format, we need to provide both 'exports' and 'module' in the scope
      // The UMD wrapper checks: typeof exports=="object"&&typeof module<"u"
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
      const moduleFactory = new Function('exports', 'module', `${code}\n; return exports;`);

      const exports = {};
      const module = { exports };
      const pluginModule = moduleFactory(exports, module);

      let pluginInstance = pluginModule;

      // If there's a default export, use it
      if (pluginModule.default) {
        pluginInstance = pluginModule.default;
      }

      // Validate that activate exists (either as function or method)
      if (typeof pluginInstance.activate !== 'function') {
        throw new Error('Plugin must export an activate function');
      }

      return {
        manifest,
        activate: pluginInstance.activate.bind(pluginInstance),
        deactivate: pluginInstance.deactivate
          ? pluginInstance.deactivate.bind(pluginInstance)
          : async () => {},
      };
    }
  } catch (error) {
    console.error('[PluginInstaller] Failed to create plugin from code:', error);
    throw new Error(
      `Failed to load plugin code: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Install a plugin from the remote registry
 */
export async function installPlugin(pluginId: string): Promise<Plugin> {
  // eslint-disable-next-line no-console
  console.log(`[PluginInstaller] Installing plugin: ${pluginId}`);

  try {
    // Check if already installed
    const existing = await getPluginFromDB(pluginId);
    if (existing) {
      // eslint-disable-next-line no-console
      console.log('[PluginInstaller] Plugin already installed, loading from cache');
      return await createPluginFromCode(existing.code, existing.manifest);
    }

    // Download manifest
    const manifest = await gitHubPluginRegistry.getManifest(pluginId);
    // eslint-disable-next-line no-console
    console.log('[PluginInstaller] Downloaded manifest:', manifest.name);

    // Download plugin code
    const blob = await gitHubPluginRegistry.downloadPlugin(pluginId);
    const code = await blob.text();
    // eslint-disable-next-line no-console
    console.log('[PluginInstaller] Downloaded plugin code:', code.length, 'bytes');

    // Save to IndexedDB
    const pluginData: InstalledPluginData = {
      id: pluginId,
      manifest: manifest as PluginManifest,
      code,
      installedAt: new Date().toISOString(),
      version: manifest.version,
    };

    await savePluginToDB(pluginData);
    // eslint-disable-next-line no-console
    console.log('[PluginInstaller] Saved plugin to IndexedDB');

    // Record download in Supabase
    await recordPluginDownload(pluginId);

    // Create plugin object
    const plugin = await createPluginFromCode(code, manifest as PluginManifest);
    // eslint-disable-next-line no-console
    console.log(`[PluginInstaller] Successfully installed: ${pluginId}`);

    return plugin;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[PluginInstaller] Failed to install plugin ${pluginId}:`, error);
    throw error;
  }
}

/**
 * Uninstall a plugin
 */
export async function uninstallPlugin(pluginId: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`[PluginInstaller] Uninstalling plugin: ${pluginId}`);

  try {
    await removePluginFromDB(pluginId);
    // eslint-disable-next-line no-console
    console.log(`[PluginInstaller] Successfully uninstalled: ${pluginId}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[PluginInstaller] Failed to uninstall plugin ${pluginId}:`, error);
    throw error;
  }
}

/**
 * Check if a plugin is installed
 */
export async function isPluginInstalled(pluginId: string): Promise<boolean> {
  const plugin = await getPluginFromDB(pluginId);
  return plugin !== null;
}

/**
 * Load an installed plugin from IndexedDB
 */
export async function loadInstalledPlugin(pluginId: string): Promise<Plugin | null> {
  const data = await getPluginFromDB(pluginId);
  if (!data) {
    return null;
  }

  return await createPluginFromCode(data.code, data.manifest);
}

/**
 * Install a plugin directly from GitHub URL
 * @param githubUrl - GitHub repository URL (e.g., https://github.com/user/repo)
 * @param branch - Branch name (default: 'main')
 */
export async function installPluginFromGitHub(githubUrl: string, branch: string = 'main'): Promise<Plugin> {
  console.log(`[PluginInstaller] Installing plugin from GitHub: ${githubUrl}`);

  try {
    // Parse GitHub URL
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') {
      throw new Error('Invalid GitHub URL. Must be a github.com URL');
    }

    // Extract user and repo from path
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub URL. Expected format: https://github.com/user/repo');
    }

    const [user, repo] = pathParts;

    // Construct raw URLs
    const manifestUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/manifest.json`;
    const pluginJsUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/plugin.js`;

    console.log(`[PluginInstaller] Fetching manifest from: ${manifestUrl}`);

    // Download manifest
    const manifestResponse = await fetch(manifestUrl);
    if (!manifestResponse.ok) {
      throw new Error(`Failed to fetch manifest: ${manifestResponse.status} ${manifestResponse.statusText}`);
    }
    const manifest = await manifestResponse.json() as PluginManifest;

    console.log(`[PluginInstaller] Downloaded manifest for: ${manifest.name}`);

    // Check if already installed
    const existing = await getPluginFromDB(manifest.id);
    if (existing) {
      throw new Error(`Plugin ${manifest.id} is already installed. Uninstall it first.`);
    }

    console.log(`[PluginInstaller] Fetching plugin code from: ${pluginJsUrl}`);

    // Download plugin code
    const codeResponse = await fetch(pluginJsUrl);
    if (!codeResponse.ok) {
      throw new Error(`Failed to fetch plugin code: ${codeResponse.status} ${codeResponse.statusText}`);
    }
    const code = await codeResponse.text();

    console.log(`[PluginInstaller] Downloaded plugin code: ${code.length} bytes`);

    // Save to IndexedDB
    const pluginData: InstalledPluginData = {
      id: manifest.id,
      manifest,
      code,
      installedAt: new Date().toISOString(),
      version: manifest.version,
    };

    await savePluginToDB(pluginData);
    console.log('[PluginInstaller] Saved plugin to IndexedDB');

    // Record download in Supabase
    await recordPluginDownload(manifest.id);

    // Create plugin object
    const plugin = await createPluginFromCode(code, manifest);
    console.log(`[PluginInstaller] Successfully installed from GitHub: ${manifest.id}`);

    return plugin;
  } catch (error) {
    console.error('[PluginInstaller] Failed to install plugin from GitHub:', error);
    throw error;
  }
}
