# @bigmind/plugin-marketplace

Plugin marketplace client for BigMind - browse, install and manage plugins from the remote registry.

## Features

- 🔍 Browse and search plugins
- ⬇️ Download and install plugins from remote marketplace
- 🔄 Check for plugin updates automatically
- 📊 View plugin details, ratings, and screenshots
- 🎨 React components for marketplace UI

## Installation

```bash
pnpm add @bigmind/plugin-marketplace
```

## Usage

### Fetch plugins from marketplace

```typescript
import { PluginStore } from '@bigmind/plugin-marketplace';

const store = new PluginStore('https://bigmind-registry.workers.dev');

// List all plugins
const plugins = await store.fetchPlugins();

// Search plugins
const results = await store.searchPlugins('collaboration');

// Get plugin details
const plugin = await store.getPlugin('com.bigmind.teams');

// Install a plugin
await store.installPlugin('com.bigmind.teams');

// Check for updates
const updates = await store.checkUpdates();
```

### React Components

```tsx
import { PluginList, PluginCard, InstallButton } from '@bigmind/plugin-marketplace';

function MarketplacePage() {
  return (
    <div>
      <h1>Plugin Marketplace</h1>
      <PluginList registryUrl="https://bigmind-registry.workers.dev" />
    </div>
  );
}
```

## API

### PluginStore

Main class for interacting with the plugin marketplace.

#### Methods

- `fetchPlugins(filters?)` - Fetch all plugins with optional filters
- `searchPlugins(query)` - Search plugins by name or description
- `getPlugin(pluginId)` - Get details for a specific plugin
- `installPlugin(pluginId, version?)` - Download and install a plugin
- `uninstallPlugin(pluginId)` - Uninstall a plugin
- `checkUpdates()` - Check for plugin updates

## Components

### PluginList

Displays a list of plugins with filters and search.

```tsx
<PluginList registryUrl="..." onInstall={(id) => {}} />
```

### PluginCard

Displays a single plugin card with details.

```tsx
<PluginCard plugin={plugin} onInstall={() => {}} />
```

### InstallButton

Install/uninstall button with loading state.

```tsx
<InstallButton pluginId="..." installed={false} onInstall={() => {}} />
```

## Architecture

```
PluginStore (API Client)
    ↓
Registry API (Cloudflare Workers)
    ↓
Cloudflare R2 Storage
    ↓
Plugin .zip files
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## License

MIT
