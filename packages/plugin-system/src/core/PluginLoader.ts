/**
 * Plugin Loader - Download and load plugins from remote marketplace
 */

import JSZip from 'jszip';
import type { Plugin } from '../types/plugin';
import type { PluginManifest } from '../types/manifest';
import { validateManifest } from '../validation/manifestSchema';

export interface PluginLoadOptions {
  marketplaceUrl?: string;
  validateSecurity?: boolean;
  maxSize?: number; // in bytes
}

/**
 * Downloads and loads plugins from remote marketplace
 */
export class PluginLoader {
  private marketplaceUrl: string;
  private validateSecurity: boolean;
  private maxSize: number;

  constructor(options: PluginLoadOptions = {}) {
    this.marketplaceUrl = options.marketplaceUrl || 'https://bigmind-registry.workers.dev';
    this.validateSecurity = options.validateSecurity !== false;
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
  }

  /**
   * Download plugin from marketplace
   */
  async download(pluginId: string, version?: string): Promise<Plugin> {
    console.log(`[PluginLoader] Downloading ${pluginId}${version ? ` v${version}` : ''}...`);

    try {
      // 1. Fetch ZIP from marketplace
      const url = `${this.marketplaceUrl}/api/plugins/${pluginId}/download${
        version ? `?version=${version}` : ''
      }`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download plugin: ${response.statusText}`);
      }

      const zipBlob = await response.blob();

      // 2. Validate size
      if (zipBlob.size > this.maxSize) {
        throw new Error(
          `Plugin too large: ${(zipBlob.size / 1024 / 1024).toFixed(2)}MB ` +
          `(max ${(this.maxSize / 1024 / 1024).toFixed(0)}MB)`
        );
      }

      // 3. Extract ZIP
      const zip = await JSZip.loadAsync(zipBlob);

      // 4. Read and validate manifest
      const manifestFile = zip.file('manifest.json');
      if (!manifestFile) {
        throw new Error('Invalid plugin: missing manifest.json');
      }

      const manifestText = await manifestFile.async('text');
      const manifest: PluginManifest = JSON.parse(manifestText);

      // Validate manifest schema
      const validation = validateManifest(manifest);
      if (!validation.valid) {
        throw new Error(`Invalid manifest: ${validation.errors.join(', ')}`);
      }

      // 5. Security validation
      if (this.validateSecurity) {
        await this.validatePluginSecurity(manifest, zip);
      }

      // 6. Extract plugin code
      const codeFile = zip.file('index.js') || zip.file('dist/index.js');
      if (!codeFile) {
        throw new Error('Invalid plugin: missing index.js');
      }

      const code = await codeFile.async('text');

      // 7. Load plugin class from code
      const PluginClass = await this.loadPluginClass(code, manifest.id);

      // 8. Instantiate plugin
      const plugin = new PluginClass();
      plugin.manifest = manifest;

      console.log(`[PluginLoader] Successfully loaded ${pluginId} v${manifest.version}`);

      return plugin;
    } catch (error) {
      console.error(`[PluginLoader] Failed to load plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Load plugin from local file (for development/testing)
   */
  async loadFromFile(file: File): Promise<Plugin> {
    console.log(`[PluginLoader] Loading plugin from file: ${file.name}`);

    const zip = await JSZip.loadAsync(file);

    // Read manifest
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Invalid plugin: missing manifest.json');
    }

    const manifestText = await manifestFile.async('text');
    const manifest: PluginManifest = JSON.parse(manifestText);

    // Validate
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Invalid manifest: ${validation.errors.join(', ')}`);
    }

    // Security check
    if (this.validateSecurity) {
      await this.validatePluginSecurity(manifest, zip);
    }

    // Load code
    const codeFile = zip.file('index.js') || zip.file('dist/index.js');
    if (!codeFile) {
      throw new Error('Invalid plugin: missing index.js');
    }

    const code = await codeFile.async('text');
    const PluginClass = await this.loadPluginClass(code, manifest.id);

    const plugin = new PluginClass();
    plugin.manifest = manifest;

    return plugin;
  }

  // ===== Private Methods =====

  /**
   * Validate plugin for security issues
   */
  private async validatePluginSecurity(manifest: PluginManifest, zip: JSZip): Promise<void> {
    // 1. Check for dangerous permissions
    const dangerousPermissions = [
      'filesystem:write',
      'filesystem:delete',
      'network:unrestricted',
      'system:exec'
    ];

    const dangerous = manifest.permissions?.filter(p =>
      dangerousPermissions.includes(p)
    );

    if (dangerous && dangerous.length > 0) {
      console.warn(
        `[PluginLoader] Plugin ${manifest.id} requests dangerous permissions:`,
        dangerous
      );
    }

    // 2. Scan code for suspicious patterns
    const codeFile = zip.file('index.js') || zip.file('dist/index.js');
    if (codeFile) {
      const code = await codeFile.async('text');

      // Check for eval()
      if (code.includes('eval(')) {
        console.warn(`[PluginLoader] Plugin ${manifest.id} contains eval() calls`);
      }

      // Check for Function constructor
      if (code.includes('new Function')) {
        console.warn(`[PluginLoader] Plugin ${manifest.id} uses Function constructor`);
      }

      // Check for document.write (XSS risk)
      if (code.includes('document.write')) {
        console.warn(`[PluginLoader] Plugin ${manifest.id} uses document.write`);
      }
    }

    // 3. Check total size
    let totalSize = 0;
    const files = Object.keys(zip.files);

    for (const filename of files) {
      const file = zip.files[filename];
      if (!file.dir) {
        const content = await file.async('uint8array');
        totalSize += content.length;
      }
    }

    if (totalSize > this.maxSize) {
      throw new Error(
        `Plugin package too large: ${(totalSize / 1024 / 1024).toFixed(2)}MB ` +
        `(max ${(this.maxSize / 1024 / 1024).toFixed(0)}MB)`
      );
    }

    // TODO: Add more security checks
    // - Check for obfuscated code
    // - Validate dependencies
    // - Check for known malware signatures
  }

  /**
   * Load plugin class from code string
   */
  private async loadPluginClass(code: string, pluginId: string): Promise<any> {
    try {
      // Option 1: Dynamic import with Blob URL (works in modern browsers)
      const blob = new Blob([code], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);

      try {
        const module = await import(/* @vite-ignore */ url);
        URL.revokeObjectURL(url);
        return module.default || module;
      } catch (importError) {
        URL.revokeObjectURL(url);
        throw importError;
      }
    } catch (error) {
      // Option 2: Fallback to eval in isolated scope (less secure, for legacy support)
      console.warn(
        `[PluginLoader] Dynamic import failed for ${pluginId}, using fallback loader`
      );

      try {
        // Create isolated scope
        const exports = {};
        const module = { exports };

        // Execute code in scope
        const fn = new Function('module', 'exports', code);
        fn(module, exports);

        return (module as any).exports.default || (module as any).exports;
      } catch (evalError) {
        throw new Error(`Failed to load plugin code: ${(evalError as Error).message}`);
      }
    }
  }
}
