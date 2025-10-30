#!/usr/bin/env tsx
/**
 * Generate manifest.json files from TypeScript plugin definitions
 * Single source of truth: TypeScript code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { buildSync } from 'esbuild';

// Create require function for ESM
const require = createRequire(import.meta.url);

// Plugins directories
const PLUGINS_BASE = path.join(process.cwd(), 'src/plugins');
const CORE_DIR = path.join(PLUGINS_BASE, 'core');
const OFFICIAL_DIR = path.join(PLUGINS_BASE, 'official');

/**
 * Find all plugin directories with index.ts/tsx
 */
function findPluginDirs(baseDir: string): string[] {
  const plugins: string[] = [];

  if (!fs.existsSync(baseDir)) {
    return plugins;
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const pluginDir = path.join(baseDir, entry.name);
      const hasIndexTs = fs.existsSync(path.join(pluginDir, 'index.ts'));
      const hasIndexTsx = fs.existsSync(path.join(pluginDir, 'index.tsx'));

      if (hasIndexTs || hasIndexTsx) {
        plugins.push(pluginDir);
      }
    }
  }

  return plugins;
}

/**
 * Load manifest from TypeScript plugin using esbuild
 */
function loadManifest(pluginDir: string): any {
  const indexTs = path.join(pluginDir, 'index.ts');
  const indexTsx = path.join(pluginDir, 'index.tsx');
  const entryPoint = fs.existsSync(indexTs) ? indexTs : indexTsx;

  // Create temporary output file
  const tmpOutfile = path.join(pluginDir, '__temp_manifest.cjs');

  try {
    // Build with esbuild - bundle everything and ignore CSS
    buildSync({
      entryPoints: [entryPoint],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: tmpOutfile,
      external: ['react', 'react-dom'], // Don't bundle React
      loader: {
        '.css': 'empty', // Ignore CSS imports
        '.scss': 'empty',
        '.svg': 'dataurl',
        '.png': 'dataurl',
        '.jpg': 'dataurl',
      },
      logLevel: 'error',
    });

    // Load the compiled module
    delete require.cache[tmpOutfile];
    const module = require(tmpOutfile);

    if (!module.manifest) {
      throw new Error(`No manifest export found in ${entryPoint}`);
    }

    return module.manifest;
  } catch (error) {
    console.error(`Failed to build/load manifest from ${entryPoint}:`, error);
    throw error;
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tmpOutfile)) {
      fs.unlinkSync(tmpOutfile);
    }
  }
}

/**
 * Generate manifest.json for a plugin
 */
function generateManifest(pluginDir: string): void {
  const pluginName = path.basename(pluginDir);
  console.log(`\n📦 Processing plugin: ${pluginName}`);

  try {
    // Load manifest from TypeScript
    const manifest = loadManifest(pluginDir);

    // Generate JSON with pretty formatting
    const manifestJson = JSON.stringify(manifest, null, 2);

    // Write to manifest.json
    const outputPath = path.join(pluginDir, 'manifest.json');
    fs.writeFileSync(outputPath, manifestJson + '\n', 'utf-8');

    console.log(`  ✅ Generated: ${outputPath}`);
    console.log(`  📝 Plugin ID: ${manifest.id}`);
    console.log(`  🔢 Version: ${manifest.version}`);
    console.log(`  🔌 Auto-activate: ${manifest.autoActivate ?? 'not set'}`);
  } catch (error) {
    console.error(`  ❌ Failed to generate manifest for ${pluginName}:`, error);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Generating manifest.json files from TypeScript sources...\n');
  console.log('📁 Base directory:', PLUGINS_BASE);

  // Find all plugins
  const corePlugins = findPluginDirs(CORE_DIR);
  const officialPlugins = findPluginDirs(OFFICIAL_DIR);

  console.log(`\n📊 Found ${corePlugins.length} core plugins`);
  console.log(`📊 Found ${officialPlugins.length} official plugins`);
  console.log(`📊 Total: ${corePlugins.length + officialPlugins.length} plugins\n`);
  console.log('─'.repeat(60));

  // Generate manifests for core plugins
  if (corePlugins.length > 0) {
    console.log('\n🔵 CORE PLUGINS');
    for (const pluginDir of corePlugins) {
      generateManifest(pluginDir);
    }
  }

  // Generate manifests for official plugins
  if (officialPlugins.length > 0) {
    console.log('\n🟢 OFFICIAL PLUGINS');
    for (const pluginDir of officialPlugins) {
      generateManifest(pluginDir);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n✅ Successfully generated ${corePlugins.length + officialPlugins.length} manifest.json files!`);
  console.log('\n💡 Tip: Add this script to package.json:');
  console.log('   "generate:manifests": "tsx scripts/generate-manifests.ts"\n');
}

// Execute
main();
