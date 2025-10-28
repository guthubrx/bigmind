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
  // console.log('=== Testing BigMind Plugin System ===');

  try {
    // Register plugin
    // console.log('1. Registering plugin...');
    // TODO: Enable when example plugin is available
    // await registry.register(helloWorldPlugin);
    // console.log('⚠️ Plugin registration skipped (example plugin not available)');

    // Check state
    const _info1 = registry.getPlugin('com.bigmind.hello-world');
    // console.log('   State:', info1?.state);
    // console.log('   Manifest:', info1?.plugin.manifest);

    // Activate plugin
    // console.log('\n2. Activating plugin...');
    await registry.activate('com.bigmind.hello-world');
    // console.log('✅ Plugin activated');

    // Check state
    const _info2 = registry.getPlugin('com.bigmind.hello-world');
    // console.log('   State:', info2?.state);
    // console.log('   Activated at:', new Date(info2?.activatedAt || 0).toLocaleString());

    // Test plugin is active
    // console.log('\n3. Checking if plugin is active...');
    const _isActive = registry.isActive('com.bigmind.hello-world');
    // console.log('   Is active:', isActive);

    // Get all plugins
    // console.log('\n4. Getting all plugins...');
    const _allPlugins = registry.getAllPlugins();
    // console.log('   Total plugins:', allPlugins.size);

    // Wait a bit
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    // Deactivate plugin
    // console.log('\n5. Deactivating plugin...');
    await registry.deactivate('com.bigmind.hello-world');
    // console.log('✅ Plugin deactivated');

    // Check state
    const _info3 = registry.getPlugin('com.bigmind.hello-world');
    // console.log('   State:', info3?.state);

    // Unregister plugin
    // console.log('\n6. Unregistering plugin...');
    await registry.unregister('com.bigmind.hello-world');
    // console.log('✅ Plugin unregistered');

    // Check if plugin exists
    const _info4 = registry.getPlugin('com.bigmind.hello-world');
    // console.log('   Plugin exists:', !!info4);

    // console.log('\n=== ✅ All tests passed! ===');
  } catch (error) {
    console.error('\n=== ❌ Test failed ===');
    console.error(error);
  }
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).testPluginSystem = testPluginSystem;
  // console.log('💡 Run testPluginSystem() in the console to test the plugin system');
}
