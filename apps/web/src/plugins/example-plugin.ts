/**
 * Example Plugin
 * Demonstrates basic plugin functionality
 */

import type { Plugin, PluginManifest, PluginContext } from '@bigmind/plugin-system';

const manifest: PluginManifest = {
  id: 'com.bigmind.example',
  name: 'Plugin Exemple',
  version: '1.0.0',
  description: "Un plugin d'exemple pour démontrer les fonctionnalités du système",
  author: 'BigMind Team',
  permissions: ['mindmap:read'],
  hooks: ['mindmap.nodeCreated'],
};

export class ExamplePlugin implements Plugin {
  manifest = manifest;

  private context: PluginContext | null = null;

  async activate(context: PluginContext): Promise<void> {
    this.context = context;
    console.log('✅ Example Plugin activated!');

    // Register a hook listener
    context.registerHook('mindmap.nodeCreated', async data => {
      console.log('🎉 New node created:', data);
      return data;
    });

    // Example: Get active mindmap (requires mindmap:read permission)
    try {
      const mindmap = await context.api.mindmap.getActive();
      console.log('📊 Active mindmap:', mindmap?.title || 'None');
    } catch (error) {
      console.error('❌ Failed to get active mindmap:', error);
    }
  }

  async deactivate(): Promise<void> {
    console.log('🛑 Example Plugin deactivated');
    this.context = null;
  }
}

export default new ExamplePlugin();
