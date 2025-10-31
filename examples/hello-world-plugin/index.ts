/**
 * Hello World Plugin - Example plugin for BigMind
 * Demonstrates how to create a basic plugin
 */

/* eslint-disable no-console */

import type { Plugin, IPluginContext, PluginManifest } from '@cartae/plugin-system';

const manifest: PluginManifest = {
  id: 'com.bigmind.hello-world',
  name: 'Hello World Plugin',
  version: '1.0.0',
  description: 'A simple example plugin that demonstrates the plugin system',
  author: 'BigMind Team',
  main: './index.js',
  permissions: ['mindmap:read', 'ui:notification'],
  contributes: {
    commands: [
      {
        id: 'helloWorld.greet',
        title: 'Say Hello',
        category: 'Hello World',
      },
    ],
  },
};

class HelloWorldPlugin implements Plugin {
  readonly manifest = manifest;

  private unregisterHooks: Array<() => void> = [];

  async activate(context: IPluginContext): Promise<void> {
    console.log('Hello World Plugin activated!');

    // Register a command
    const unregisterCommand = context.commands.registerCommand('helloWorld.greet', () => {
      context.ui.showNotification('Hello from plugin!', 'success');
    });
    this.unregisterHooks.push(unregisterCommand);

    // Register an action hook
    const unregisterAction = context.hooks.registerAction('node:created', async node => {
      console.log('Node created:', node);
      context.ui.showNotification(`Node created: ${node.label}`, 'info');
    });
    this.unregisterHooks.push(unregisterAction);

    // Register a filter hook
    const unregisterFilter = context.hooks.registerFilter('node:label', async (label: string) =>
      // Transform node labels to uppercase
      label.toUpperCase()
    );
    this.unregisterHooks.push(unregisterFilter);

    // Use storage
    const visits = (await context.storage.get<number>('visits')) || 0;
    await context.storage.set('visits', visits + 1);
    console.log(`This plugin has been activated ${visits + 1} times`);
  }

  async deactivate(): Promise<void> {
    // Cleanup
    this.unregisterHooks.forEach(fn => fn());
    this.unregisterHooks = [];
    console.log('Hello World Plugin deactivated!');
  }
}

export default new HelloWorldPlugin();
