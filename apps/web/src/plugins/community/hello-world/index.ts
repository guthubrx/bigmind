/**
 * Hello World Plugin
 *
 * A simple example plugin that demonstrates the BigMind plugin API.
 */

import { Plugin, PluginContext } from '@bigmind/plugin-sdk';

export default class HelloWorldPlugin implements Plugin {
  name = 'Hello World';
  version = '1.0.0';

  /**
   * Called when the plugin is loaded
   */
  // eslint-disable-next-line class-methods-use-this
  onLoad(context: PluginContext): void {
    // eslint-disable-next-line no-console
    console.log('[HelloWorld] Plugin loaded!');

    // Register a command
    context.commands.register({
      id: 'hello-world.sayHello',
      name: 'Say Hello',
      description: 'Display a hello message',
      execute: () => {
        context.ui.showNotification({
          message: 'Hello from BigMind Plugin! 👋',
          type: 'info'
        });
      }
    });

    // Add a menu item
    context.ui.addMenuItem({
      id: 'hello-world-menu',
      label: 'Hello World',
      section: 'plugins',
      onClick: () => {
        context.ui.showNotification({
          message: 'Hello World plugin is running!',
          type: 'success'
        });
      }
    });
  }

  /**
   * Called when the plugin is unloaded
   */
  // eslint-disable-next-line class-methods-use-this
  onUnload(context: PluginContext): void {
    // eslint-disable-next-line no-console
    console.log('[HelloWorld] Plugin unloaded');

    // Cleanup: unregister commands
    context.commands.unregister('hello-world.sayHello');

    // Cleanup: remove menu item
    context.ui.removeMenuItem('hello-world-menu');
  }
}
