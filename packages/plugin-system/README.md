# 🔌 Cartae Plugin System

A robust, extensible, and secure plugin system for Cartae inspired by VS Code, Obsidian, Figma, and Chrome Extensions.

## Features

- ✅ **Plugin Lifecycle Management**: Register, activate, deactivate, unregister
- ✅ **Hook System**: Actions, filters, and validations
- ✅ **Permission System**: Granular security with user consent
- ✅ **Sandbox**: Isolated execution with Proxies
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Manifest Validation**: JSON Schema validation

## Quick Start

### 1. Create a Plugin

```typescript
import type { Plugin, IPluginContext } from '@cartae/plugin-system';

class MyPlugin implements Plugin {
  readonly manifest = {
    id: 'com.example.myplugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'My awesome plugin',
    author: 'Your Name',
    main: './index.js',
    permissions: ['mindmap:read', 'mindmap:write'],
  };

  async activate(context: IPluginContext): Promise<void> {
    // Register hooks, commands, etc.
    context.hooks.registerAction('node:created', async node => {
      console.log('Node created:', node);
    });
  }

  async deactivate(): Promise<void> {
    // Cleanup
  }
}

export default new MyPlugin();
```

### 2. Register and Activate

```typescript
import { registry } from './pluginSystem';
import myPlugin from './my-plugin';

await registry.register(myPlugin);
await registry.activate('com.example.myplugin');
```

## API Reference

### Plugin Context API

The `IPluginContext` provides the following APIs:

- **mindmap**: Mind map operations (read, write, select)
- **hooks**: Register hooks (actions, filters, validations)
- **commands**: Register and execute commands
- **ui**: Show notifications, dialogs, register menu items
- **storage**: Plugin-scoped localStorage
- **events**: Pub/sub event system
- **http**: Make HTTP requests (requires permission)
- **fs**: File system access (requires permission)
- **clipboard**: Clipboard access (requires permission)

### Hook Types

- **Actions**: Observers notified when an event occurs
- **Filters**: Transform/modify data before use
- **Validations**: Validate data and return errors

### Permissions

Plugins can request the following permissions:

- `mindmap:read`, `mindmap:write`
- `filesystem:read`, `filesystem:write`
- `network`, `clipboard`, `storage`
- `commands`, `ui:menu`, `ui:panel`, `ui:statusbar`, `ui:notification`
- `settings:read`, `settings:write`
- `native` (desktop only)

## Architecture

```
@cartae/plugin-system/
├── types/           # TypeScript interfaces
├── core/            # PluginRegistry, HookSystem
├── permissions/     # Permission management
├── runtime/         # PluginContext, Sandbox
└── validation/      # Manifest validation
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## Examples

See [examples/](../../examples/) directory for complete examples.

## License

AGPL-3.0
