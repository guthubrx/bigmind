/**
 * Vite Plugin Configuration Template
 * Use this as a base for plugin bundling
 * Phase 4 - Sprint 3
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { SHARED_EXTERNALS, UMD_GLOBALS } from './apps/web/src/distribution/BundleConfig';

/**
 * Plugin build configuration
 *
 * Usage in plugin project:
 * ```typescript
 * import { defineConfig } from 'vite';
 * import pluginConfig from '@bigmind/vite-config-plugin';
 *
 * export default pluginConfig({
 *   entry: './src/index.ts',
 *   name: 'MyPlugin',
 *   outputDir: './dist',
 * });
 * ```
 */

interface PluginConfigOptions {
  /** Entry point for the plugin */
  entry: string;
  /** Plugin name (for UMD builds) */
  name: string;
  /** Output directory */
  outputDir?: string;
  /** Additional external dependencies */
  external?: string[];
  /** Additional globals for UMD */
  globals?: Record<string, string>;
  /** Enable sourcemaps */
  sourcemap?: boolean;
  /** Build format */
  format?: 'es' | 'cjs' | 'umd';
}

/**
 * Create plugin Vite configuration
 */
export function createPluginConfig(options: PluginConfigOptions) {
  const {
    entry,
    name,
    outputDir = 'dist',
    external = [],
    globals = {},
    sourcemap = false,
    format = 'es',
  } = options;

  return defineConfig({
    plugins: [react()],

    build: {
      lib: {
        entry: resolve(process.cwd(), entry),
        name,
        formats: [format],
        fileName: (format) => {
          switch (format) {
            case 'es':
              return 'index.js';
            case 'cjs':
              return 'index.cjs';
            case 'umd':
              return 'index.umd.js';
            default:
              return 'index.js';
          }
        },
      },

      outDir: outputDir,

      rollupOptions: {
        // External dependencies (provided by host)
        external: [
          ...SHARED_EXTERNALS,
          ...external,
        ],

        output: {
          // Global names for UMD builds
          globals: {
            ...UMD_GLOBALS,
            ...globals,
          },

          // Preserve module structure
          preserveModules: false,

          // Code splitting (for ES format)
          ...(format === 'es' && {
            manualChunks: undefined,
          }),
        },
      },

      // Minification
      minify: 'esbuild',

      // Sourcemaps
      sourcemap,

      // Target
      target: 'esnext',

      // Ensure CSS is extracted
      cssCodeSplit: false,

      // Emit assets
      assetsDir: 'assets',
    },

    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
      },
    },

    // Type checking
    esbuild: {
      jsxInject: `import React from 'react'`,
    },
  });
}

/**
 * Default export for simple usage
 */
export default function pluginConfig(options: PluginConfigOptions) {
  return createPluginConfig(options);
}

/**
 * Preset configurations
 */
export const presets = {
  /**
   * Standard ES module plugin
   */
  esm: (entry: string, name: string) =>
    createPluginConfig({
      entry,
      name,
      format: 'es',
      sourcemap: false,
    }),

  /**
   * UMD plugin for browser usage
   */
  umd: (entry: string, name: string) =>
    createPluginConfig({
      entry,
      name,
      format: 'umd',
      sourcemap: true,
    }),

  /**
   * CommonJS plugin for Node.js
   */
  cjs: (entry: string, name: string) =>
    createPluginConfig({
      entry,
      name,
      format: 'cjs',
      sourcemap: false,
    }),

  /**
   * Development build with sourcemaps
   */
  dev: (entry: string, name: string) =>
    createPluginConfig({
      entry,
      name,
      format: 'es',
      sourcemap: 'inline',
    }),
};

/**
 * Example usage:
 *
 * @example
 * // vite.config.ts in plugin project
 * import pluginConfig from '@bigmind/vite-config-plugin';
 *
 * export default pluginConfig({
 *   entry: './src/index.ts',
 *   name: 'TagsManager',
 *   outputDir: './dist',
 * });
 *
 * @example
 * // Using presets
 * import { presets } from '@bigmind/vite-config-plugin';
 *
 * export default presets.esm('./src/index.ts', 'TagsManager');
 */
