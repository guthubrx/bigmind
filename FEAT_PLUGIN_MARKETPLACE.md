# Plugin Marketplace Implementation

This branch implements the remote plugin marketplace infrastructure for Cartae, enabling users to browse and install plugins from a remote registry instead of having them all bundled in the monorepo.

## What's New

### 1. **New Package: `@cartae/plugin-marketplace`**

Location: `packages/plugin-marketplace/`

A complete client library for interacting with the plugin marketplace:

- **`PluginStore`**: Main API client for fetching, searching, and installing plugins
- **React Components**:
  - `PluginList`: Browse all plugins with filters
  - `PluginCard`: Display individual plugin cards
  - `PluginFilters`: Search and filter UI
  - `InstallButton`: Install/uninstall with loading states
- **Features**:
  - Download plugins from remote registry (.zip format)
  - Automatic extraction and validation
  - Security checks (file size, dangerous patterns)
  - Install progress tracking
  - Local storage persistence

### 2. **Plugin System Enhancements**

Location: `packages/plugin-system/`

**New: `PluginLoader`** (`src/core/PluginLoader.ts`)
- Downloads plugins from remote marketplace
- Extracts ZIP archives using JSZip
- Validates manifests and security
- Dynamic code loading with sandbox support
- Supports both remote and local file installation

**Enhanced: `PluginRegistry`** (`src/core/PluginRegistry.ts`)
- Added `installFromMarketplace(pluginId, version?)` method
- Added `installFromFile(file)` for sideloading
- Marketplace URL configuration
- New events: `plugin:installed-from-marketplace`, `plugin:install-failed`

**Dependencies Added**:
- `jszip@^3.10.1` - For extracting plugin ZIP files

### 3. **Web App Integration**

Location: `apps/web/`

**New Component: `RemotePluginMarketplace`** (`src/components/plugins/RemotePluginMarketplace.tsx`)
- Uses `@cartae/plugin-marketplace` package
- Displays plugins from remote registry
- Handles installation/uninstallation
- Error handling and loading states

**Enhanced: `PluginsPage`** (`src/pages/PluginsPage.tsx`)
- Added new "Remote" tab
- Integrates `RemotePluginMarketplace` component
- Existing "Local" tab shows bundled plugins
- Maintains backward compatibility

**Dependencies Added**:
- `@cartae/plugin-marketplace@workspace:*`

## Architecture

```
┌───────────────────────────────────────────────┐
│ User Interface (apps/web)                     │
│ ├── PluginsPage                               │
│ │   ├── "Local" tab (existing)                │
│ │   └── "Remote" tab (NEW)                    │
│ │       └── RemotePluginMarketplace           │
└───────────────────┬───────────────────────────┘
                    │
┌───────────────────▼───────────────────────────┐
│ @cartae/plugin-marketplace                   │
│ ├── PluginStore (API client)                  │
│ └── UI Components (PluginList, Card, etc.)    │
└───────────────────┬───────────────────────────┘
                    │
┌───────────────────▼───────────────────────────┐
│ @cartae/plugin-system                        │
│ ├── PluginLoader (download & extract)         │
│ └── PluginRegistry (register & activate)      │
└───────────────────┬───────────────────────────┘
                    │
┌───────────────────▼───────────────────────────┐
│ Remote Registry API (future)                  │
│ └── Cloudflare Workers + R2 Storage           │
└───────────────────────────────────────────────┘
```

## Usage

### For End Users

1. Navigate to `/plugins` page
2. Click on "Remote" tab
3. Browse available plugins
4. Click "Install" on desired plugin
5. Plugin downloads, validates, and activates automatically

### For Developers

**Install from marketplace programmatically:**

```typescript
import { pluginSystem } from './utils/pluginManager';

// Install latest version
await pluginSystem.registry.installFromMarketplace('com.cartae.teams');

// Install specific version
await pluginSystem.registry.installFromMarketplace('com.cartae.teams', '1.0.2');

// Install from local file
const file = document.querySelector('input[type="file"]').files[0];
await pluginSystem.registry.installFromFile(file);
```

**Use PluginStore directly:**

```typescript
import { PluginStore } from '@cartae/plugin-marketplace';

const store = new PluginStore('https://cartae-registry.workers.dev');

// List all plugins
const plugins = await store.fetchPlugins();

// Search
const results = await store.searchPlugins('collaboration');

// Get details
const plugin = await store.getPlugin('com.cartae.teams');

// Check for updates
const updates = await store.checkUpdates();
```

## Configuration

### Environment Variables

Create `.env` file in `apps/web/`:

```bash
# Remote marketplace URL
VITE_MARKETPLACE_URL=https://cartae-registry.workers.dev
```

### Registry URL

Default registry URL is `https://cartae-registry.workers.dev`. Can be customized:

```typescript
// In utils/pluginManager.ts
const registry = new PluginRegistry(
  permissionManager,
  hookSystem,
  eventBus,
  '1.0.0',
  'https://custom-registry.example.com' // Custom URL
);
```

## Next Steps

### Phase 1: Registry API (Separate Task)
- Create Cloudflare Worker for registry API
- Implement endpoints: `/api/plugins`, `/api/plugins/:id/download`, etc.
- Setup Cloudflare R2 storage for plugin .zip files

### Phase 2: Plugin Repository (Separate Task)
- Create `cartae-plugins` repository
- Setup GitHub Actions for automatic publishing
- Add plugin templates and documentation

### Phase 3: Enhancements
- Add plugin ratings and reviews
- Implement automatic updates
- Add plugin screenshots and detailed pages
- Implement plugin verification/signing

## Testing

### Manual Testing

1. Start dev server: `pnpm dev`
2. Navigate to http://localhost:5173/plugins
3. Click "Remote" tab
4. Should show "Loading plugins..." or connection error (API not deployed yet)

### Unit Tests

```bash
# Test plugin-marketplace package
cd packages/plugin-marketplace
pnpm test

# Test plugin-system
cd packages/plugin-system
pnpm test
```

## File Changes Summary

### New Files
- `packages/plugin-marketplace/` (entire package)
  - `package.json`, `tsconfig.json`, `README.md`
  - `src/PluginStore.ts`
  - `src/types.ts`
  - `src/components/*.tsx` (4 components)
  - `src/index.ts`
- `packages/plugin-system/src/core/PluginLoader.ts`
- `apps/web/src/components/plugins/RemotePluginMarketplace.tsx`

### Modified Files
- `packages/plugin-system/src/core/PluginRegistry.ts` (added installFromMarketplace)
- `packages/plugin-system/src/index.ts` (export PluginLoader)
- `packages/plugin-system/package.json` (added jszip dependency)
- `apps/web/src/pages/PluginsPage.tsx` (added Remote tab)
- `apps/web/src/components/plugins/index.ts` (export RemotePluginMarketplace)
- `apps/web/package.json` (added @cartae/plugin-marketplace dependency)

## Backward Compatibility

✅ **Fully backward compatible**

- Existing local plugin system works unchanged
- "Local" marketplace tab shows bundled plugins as before
- No breaking changes to plugin-system API
- Optional marketplace URL parameter (defaults to official registry)

## Security Considerations

### Plugin Validation

PluginLoader performs several security checks:

1. **File size limit**: Max 10MB per plugin
2. **Manifest validation**: Schema validation using Zod
3. **Code scanning**: Detects `eval()`, `Function()` constructor, `document.write`
4. **Permission warnings**: Logs dangerous permissions
5. **Sandboxed execution**: Plugins run in isolated context

### Recommended Practices

- Always validate plugin manifests
- Review permissions before installation
- Use verified plugins when possible
- Keep plugins updated
- Monitor audit logs for suspicious activity

## Known Limitations

1. **Registry API not deployed**: API endpoints return 404 until Cloudflare Workers are deployed
2. **No plugin signing**: Plugins are not cryptographically signed yet
3. **No automatic updates**: Users must manually check for updates
4. **Basic security scanning**: More advanced malware detection needed

## Related Documentation

- [MARKETPLACE_ARCHITECTURE.md](./MARKETPLACE_ARCHITECTURE.md) - Complete architecture guide
- [PLUGIN_ROADMAP_STRATEGY.md](./PLUGIN_ROADMAP_STRATEGY.md) - Plugin monetization strategy
- `packages/plugin-marketplace/README.md` - Package-specific docs
- `packages/plugin-system/README.md` - Plugin system docs

## Contributors

- Claude (AI Assistant)
- Cartae Team

## License

MIT (plugin-marketplace package)
AGPL-3.0 (main project)

---

**Status**: ✅ Ready for review and testing
**Branch**: `feat/plugin-marketplace`
**Created**: 2025-10-29
