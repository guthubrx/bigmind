/**
 * Plugin Manager
 * Initializes and manages the plugin system
 */

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

const { registry, permissionManager, auditLogger, policyEngine, roleManager, cspManager } = system;

/**
 * Initialize the plugin system and register example plugins
 */
export async function initializePlugins(): Promise<void> {
  console.log('🔌 Initializing plugin system...');

  try {
    // Register example plugins
    await registry.register(examplePlugin);
    console.log('✅ Registered: Example Plugin');

    await registry.register(analyticsPlugin);
    console.log('✅ Registered: Analytics Plugin');

    console.log('🎉 Plugin system initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize plugin system:', error);
  }
}

/**
 * Export the plugin system for use in components
 */
export const pluginSystem = {
  registry,
  permissionManager,
  auditLogger,
  policyEngine,
  roleManager,
  cspManager,
};
