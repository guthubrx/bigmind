/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, @typescript-eslint/no-unused-vars */
/**
 * Test the plugin system
 */

/* eslint-disable no-console */

import { registry } from './pluginSystem';
// Import disabled - example plugin is outside rootDir
// import helloWorldPlugin from '../../../../examples/hello-world-plugin';

/**
 * Test the plugin system
 */
export async function testPluginSystem() {
  try {
    // Register plugin
    // TODO: Enable when example plugin is available
    // await registry.register(helloWorldPlugin);

    // Check state
    const _info1 = registry.getPlugin('com.bigmind.hello-world');

    // Activate plugin
    await registry.activate('com.bigmind.hello-world');

    // Check state
    const _info2 = registry.getPlugin('com.bigmind.hello-world');

    // Test plugin is active
    const _isActive = registry.isActive('com.bigmind.hello-world');

    // Get all plugins
    const _allPlugins = registry.getAllPlugins();

    // Wait a bit
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    // Deactivate plugin
    await registry.deactivate('com.bigmind.hello-world');

    // Check state
    const _info3 = registry.getPlugin('com.bigmind.hello-world');

    // Unregister plugin
    await registry.unregister('com.bigmind.hello-world');

    // Check if plugin exists
    const _info4 = registry.getPlugin('com.bigmind.hello-world');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('\n=== ❌ Test failed ===');
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).testPluginSystem = testPluginSystem;
}
