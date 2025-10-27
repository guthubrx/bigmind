/**
 * Plugin Manager
 * Initializes and manages the plugin system
 */

/* eslint-disable no-console */

import { createEnhancedPluginSystem } from '@bigmind/plugin-system';
import { eventBus } from './eventBus';
import examplePlugin from '../plugins/example-plugin';
import analyticsPlugin from '../plugins/analytics-plugin';

// Create the enhanced plugin system with Phase 2 security
const system = createEnhancedPluginSystem({
  bigmindVersion: '1.0.0',
  permissionStorage: {
    async save(permissions) {
      localStorage.setItem(
        'bigmind-plugin-permissions',
        JSON.stringify(Array.from(permissions.entries()))
      );
    },
    async load() {
      const data = localStorage.getItem('bigmind-plugin-permissions');
      if (!data) return null;
      return new Map(JSON.parse(data));
    },
  },
  eventBus,
});

const {
  registry,
  hookSystem,
  permissionManager,
  auditLogger,
  policyEngine,
  roleManager,
  cspManager,
} = system;

let initialized = false;

/**
 * Get list of previously activated plugins from localStorage
 */
function getActivatedPlugins(): Set<string> {
  try {
    const data = localStorage.getItem('bigmind-activated-plugins');
    if (data) {
      return new Set(JSON.parse(data));
    }
  } catch (error) {
    console.error('[PluginManager] Failed to load activated plugins:', error);
  }
  return new Set();
}

/**
 * Save list of activated plugins to localStorage
 */
export function saveActivatedPlugins(pluginIds: string[]): void {
  try {
    localStorage.setItem('bigmind-activated-plugins', JSON.stringify(pluginIds));
  } catch (error) {
    console.error('[PluginManager] Failed to save activated plugins:', error);
  }
}

/**
 * Initialize the plugin system and register example plugins
 */
export async function initializePlugins(): Promise<void> {
  // Prevent double initialization (React strict mode)
  if (initialized) {
    console.log('🔌 Plugin system already initialized, skipping');
    return;
  }

  initialized = true;
  console.log('🔌 Initializing plugin system...');

  try {
    // Register example plugins
    await registry.register(examplePlugin);
    console.log('✅ Registered: Example Plugin');

    await registry.register(analyticsPlugin);
    console.log('✅ Registered: Analytics Plugin');

    // Auto-activate previously activated plugins
    const activatedPlugins = getActivatedPlugins();
    if (activatedPlugins.size > 0) {
      console.log('🔄 Restoring previously activated plugins...');
      await Promise.all(
        Array.from(activatedPlugins).map(async pluginId => {
          try {
            await registry.activate(pluginId);
            console.log(`✅ Auto-activated: ${pluginId}`);
          } catch (error) {
            console.error(`❌ Failed to auto-activate ${pluginId}:`, error);
          }
        })
      );
    }

    console.log('🎉 Plugin system initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize plugin system:', error);
    initialized = false; // Reset on error to allow retry
  }
}

/**
 * Export the plugin system for use in components
 */
export const pluginSystem = {
  registry,
  hookSystem,
  permissionManager,
  auditLogger,
  policyEngine,
  roleManager,
  cspManager,
};
