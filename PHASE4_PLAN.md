# Phase 4 - Storage, Distribution & Advanced Features 🚀

**Objectif:** Infrastructure de distribution de plugins + Optimisation & fonctionnalités avancées
**Durée estimée:** 16 semaines
**Status:** 🟡 EN COURS

---

## 🎯 Vision Phase 4

Phase 4 transforme BigMind en une **plateforme extensible et distribuée** avec :
1. **Infrastructure de distribution** robuste et sécurisée (npm + CDN)
2. **Marketplace backend** avec API, search, reviews, analytics
3. **Plugin lifecycle** complet (install, update, remove, delta updates)
4. **State management** centralisé avec persistence et undo/redo
5. **Performance** optimale avec virtual rendering et workers
6. **Security-first** : signatures multi-couches, SBOM, provenance SLSA

---

## 📋 TODO COMPLÈTE - PHASE 4

### Sprint 1: Registry & Publication Infrastructure (Semaines 1-2)

#### npm Registry + Verdaccio
- [ ] Créer `infrastructure/verdaccio/` - Config Verdaccio
- [ ] Créer `infrastructure/verdaccio/config.yaml` - Configuration
- [ ] Créer `infrastructure/verdaccio/htpasswd` - Auth file
- [ ] Créer `infrastructure/verdaccio/Dockerfile` - Container setup
- [ ] Configurer scoped packages `@bigmind/*`
- [ ] Configurer uplinks vers npmjs.org
- [ ] Configurer auth policies
- [ ] Docker compose pour dev local

#### Manifest Extension
- [ ] Étendre `src/core/plugins/types.ts` - Ajouter `distribution` field
- [ ] Créer `src/core/plugins/DistributionSchema.ts` - Zod validation
- [ ] Mettre à jour manifests existants avec distribution config
- [ ] Créer `src/core/plugins/ManifestValidator.ts` - Extended validation
- [ ] Tests validation distribution fields

#### CI/CD Pipeline
- [ ] Créer `.github/workflows/plugin-publish.yml` - Publish workflow
- [ ] Créer `.github/workflows/security-scan.yml` - Security checks
- [ ] Intégrer semantic-release
- [ ] Configurer npm publish automation
- [ ] Configurer vulnerability scanning (Snyk/Trivy)
- [ ] Configurer bundle size checks
- [ ] Configurer license compliance checks

#### Code Signing
- [ ] Créer `src/security/Signer.ts` - Code signing
- [ ] Créer `src/security/Verifier.ts` - Signature verification
- [ ] Implémenter Ed25519 signatures
- [ ] Créer `src/security/KeyManager.ts` - Key management
- [ ] Intégrer Sigstore/Cosign (optional)
- [ ] Générer SBOM (CycloneDX/SPDX)
- [ ] Créer provenance attestations (SLSA)

#### Tests Sprint 1
- [ ] Tests `ManifestValidator.test.ts` (15 tests)
- [ ] Tests `Signer.test.ts` (20 tests)
- [ ] Tests `Verifier.test.ts` (18 tests)
- [ ] Tests `KeyManager.test.ts` (12 tests)
- [ ] Tests `DistributionSchema.test.ts` (10 tests)
- [ ] Tests E2E `verdaccio-publish.spec.ts` (10 tests)
- [ ] **Total Sprint 1: 85 tests**

---

### Sprint 2: CDN & Caching Strategy (Semaines 3-4)

#### CDN Infrastructure
- [ ] Créer `infrastructure/cdn/` - CDN config
- [ ] Créer `infrastructure/cdn/nginx.conf` - Nginx reverse proxy
- [ ] Créer `infrastructure/cdn/cache-rules.conf` - Cache headers
- [ ] Configurer S3/GCS storage backend
- [ ] Configurer CloudFront/CloudFlare
- [ ] Implémenter fallback chain (Edge → Origin → Registry → npm)
- [ ] Tests load balancing

#### Cache Manager
- [ ] Créer `src/distribution/CacheManager.ts` - Cache orchestration
- [ ] Créer `src/distribution/CacheStrategy.ts` - Strategies
- [ ] Implémenter immutable caching (31536000s)
- [ ] Implémenter metadata caching (300s)
- [ ] Implémenter stale-while-revalidate
- [ ] Créer `src/distribution/CacheInvalidator.ts` - Purge API
- [ ] Implémenter purge by path
- [ ] Implémenter purge by tag
- [ ] Implémenter soft purge

#### Asset Management
- [ ] Créer `src/distribution/AssetUploader.ts` - Upload to CDN
- [ ] Créer `src/distribution/AssetVersioning.ts` - Versioning
- [ ] Implémenter content hashing
- [ ] Implémenter SRI (Subresource Integrity)
- [ ] Créer manifest pour assets
- [ ] Optimiser images (compression, WebP)

#### Tests Sprint 2
- [ ] Tests `CacheManager.test.ts` (18 tests)
- [ ] Tests `CacheStrategy.test.ts` (15 tests)
- [ ] Tests `AssetUploader.test.ts` (12 tests)
- [ ] Tests `CacheInvalidator.test.ts` (10 tests)
- [ ] Tests E2E `cdn-performance.spec.ts` (8 tests)
- [ ] **Total Sprint 2: 63 tests**

---

### Sprint 3: Dependency Resolution & Bundling (Semaines 5-6)

#### Dependency Resolver
- [ ] Créer `src/distribution/DependencyResolver.ts` - Resolver
- [ ] Créer `src/distribution/DependencyGraph.ts` - Graph
- [ ] Créer `src/distribution/VersionResolver.ts` - SemVer resolution
- [ ] Implémenter shared externals strategy
- [ ] Configurer externals: React, react-dom, @bigmind/plugin-sdk
- [ ] Implémenter lockfile generation
- [ ] Créer `src/distribution/IntegrityChecker.ts` - Hash validation

#### Bundle Configuration
- [ ] Créer `src/distribution/BundleConfig.ts` - Bundle config
- [ ] Créer `vite.config.plugin.ts` - Plugin-specific Vite config
- [ ] Configurer external dependencies
- [ ] Configurer code splitting
- [ ] Configurer tree shaking
- [ ] Implémenter bundle size limits
- [ ] Créer bundle analyzer integration

#### Virtual Environment (Optional)
- [ ] Créer `src/distribution/VirtualEnv.ts` - Isolated env per plugin
- [ ] Implémenter sandbox context
- [ ] Implémenter module isolation
- [ ] Tests isolation

#### Tests Sprint 3
- [ ] Tests `DependencyResolver.test.ts` (25 tests)
- [ ] Tests `DependencyGraph.test.ts` (20 tests)
- [ ] Tests `VersionResolver.test.ts` (18 tests)
- [ ] Tests `IntegrityChecker.test.ts` (15 tests)
- [ ] Tests `BundleConfig.test.ts` (12 tests)
- [ ] **Total Sprint 3: 90 tests**

---

### Sprint 4: Marketplace Backend & API (Semaines 7-9)

#### Database Schema
- [ ] Créer `infrastructure/database/schema.sql` - PostgreSQL schema
- [ ] Table `plugins` (id, name, description, author_id, version, manifest, downloads)
- [ ] Table `plugin_versions` (plugin_id, version, manifest, published_at, deprecated)
- [ ] Table `users` (id, email, username, role)
- [ ] Table `reviews` (id, plugin_id, user_id, rating, comment)
- [ ] Table `analytics` (plugin_id, event, timestamp, metadata)
- [ ] Table `security_reports` (plugin_id, version, vulnerability, severity)
- [ ] Migrations scripts

#### Plugin Service API
- [ ] Créer `apps/api/` - Backend service (Node.js/Express ou Hono)
- [ ] Créer `apps/api/src/services/PluginService.ts` - Plugin CRUD
- [ ] Créer `apps/api/src/routes/plugins.ts` - Routes
- [ ] `POST /api/v1/plugins` - Publish plugin
- [ ] `GET /api/v1/plugins/:id` - Get plugin
- [ ] `GET /api/v1/plugins/:id/versions` - Get versions
- [ ] `POST /api/v1/plugins/:id/install` - Install tracking
- [ ] `DELETE /api/v1/plugins/:id/:version` - Deprecate
- [ ] Validation avec Zod
- [ ] Auth middleware (JWT)

#### Search Service
- [ ] Créer `apps/api/src/services/SearchService.ts` - Search
- [ ] MVP: SQL LIKE queries
- [ ] `GET /api/v1/search?q=:query` - Full-text search
- [ ] Implémenter facets (category, tags, rating, compatibility)
- [ ] Créer indexing pipeline
- [ ] (Future) Intégrer Elasticsearch/Algolia

#### Review Service
- [ ] Créer `apps/api/src/services/ReviewService.ts` - Reviews
- [ ] `POST /api/v1/plugins/:id/reviews` - Create review
- [ ] `GET /api/v1/plugins/:id/reviews` - Get reviews
- [ ] `PUT /api/v1/reviews/:id` - Update review
- [ ] `DELETE /api/v1/reviews/:id` - Delete review
- [ ] Rating aggregation
- [ ] Spam detection

#### Analytics Service
- [ ] Créer `apps/api/src/services/AnalyticsService.ts` - Analytics
- [ ] `POST /api/v1/analytics/event` - Track event
- [ ] `GET /api/v1/plugins/:id/stats` - Get stats
- [ ] Data minimization (RGPD)
- [ ] Opt-in tracking
- [ ] TTL 90 jours
- [ ] Anonymization

#### Tests Sprint 4
- [ ] Tests `PluginService.test.ts` (25 tests)
- [ ] Tests `SearchService.test.ts` (20 tests)
- [ ] Tests `ReviewService.test.ts` (18 tests)
- [ ] Tests `AnalyticsService.test.ts` (15 tests)
- [ ] Tests API routes (30 tests)
- [ ] Tests E2E `marketplace-api.spec.ts` (20 tests)
- [ ] **Total Sprint 4: 128 tests**

---

### Sprint 5: PluginInstaller & UpdateManager (Semaines 10-11)

#### RegistryClient
- [ ] Créer `src/distribution/RegistryClient.ts` - Registry client
- [ ] Implémenter `getManifest(id: string): Promise<PluginManifest>`
- [ ] Implémenter `getVersions(id: string): Promise<string[]>`
- [ ] Implémenter `downloadPlugin(id: string, version: string): Promise<Blob>`
- [ ] Implémenter retry logic
- [ ] Implémenter timeout handling
- [ ] Implémenter caching

#### PluginInstaller
- [ ] Créer `src/distribution/PluginInstaller.ts` - Installer
- [ ] Implémenter `install(id: string, version: string): Promise<void>`
- [ ] Implémenter `uninstall(id: string): Promise<void>`
- [ ] Implémenter dependency resolution
- [ ] Implémenter signature verification
- [ ] Implémenter integrity checks (SRI)
- [ ] Implémenter rollback on failure
- [ ] Créer progress tracking

#### UpdateManager
- [ ] Créer `src/distribution/UpdateManager.ts` - Update manager
- [ ] Implémenter `check(id: string): Promise<UpdateInfo | null>`
- [ ] Implémenter `checkAll(): Promise<UpdateInfo[]>`
- [ ] Implémenter `update(id: string): Promise<void>`
- [ ] Implémenter auto-update background task
- [ ] Implémenter update channels (alpha/beta/stable)
- [ ] Implémenter staged rollout

#### Delta Updates
- [ ] Créer `src/distribution/DeltaUpdater.ts` - Delta updates
- [ ] Implémenter bsdiff algorithm
- [ ] Implémenter patch generation
- [ ] Implémenter patch application
- [ ] Règle: delta > 60% → full download
- [ ] Vérification hash avant/après
- [ ] Rollback automatique si échec

#### UI Components
- [ ] Créer `src/components/distribution/PluginInstaller.tsx` - Install UI
- [ ] Créer `src/components/distribution/UpdateNotification.tsx` - Updates
- [ ] Créer `src/components/distribution/ProgressBar.tsx` - Progress
- [ ] Créer `src/components/distribution/ReleaseNotes.tsx` - Changelog
- [ ] Intégration avec PluginMarketplace existant

#### Tests Sprint 5
- [ ] Tests `RegistryClient.test.ts` (20 tests)
- [ ] Tests `PluginInstaller.test.ts` (25 tests)
- [ ] Tests `UpdateManager.test.ts` (22 tests)
- [ ] Tests `DeltaUpdater.test.ts` (18 tests)
- [ ] Tests E2E `install-update.spec.ts` (15 tests)
- [ ] **Total Sprint 5: 100 tests**

---

### Sprint 6: Monorepo & Developer Experience (Semaines 12-13)

#### Turborepo Setup
- [ ] Installer Turborepo
- [ ] Créer `turbo.json` - Pipeline configuration
- [ ] Configurer workspaces
- [ ] Configurer pipelines (build, test, lint, typecheck)
- [ ] Configurer remote cache
- [ ] Configurer task dependencies

#### Package Structure
- [ ] Restructurer en monorepo:
  - `apps/web` - Application principale
  - `apps/api` - Marketplace backend
  - `packages/plugin-sdk` - SDK existant
  - `packages/core` - Core logic
  - `packages/shared` - Shared utilities
  - `plugins/*` - Plugin packages
- [ ] Configurer path aliases
- [ ] Configurer shared tsconfig

#### Dev Tools
- [ ] Créer `scripts/create-plugin.ts` - Plugin scaffolding
- [ ] Créer `scripts/publish-plugin.ts` - Publish script
- [ ] Créer `scripts/validate-plugin.ts` - Validation script
- [ ] Hot reload pour plugins en dev
- [ ] Dev server avec HMR
- [ ] Storybook pour plugin components

#### CLI Tools
- [ ] Créer `packages/cli/` - CLI package
- [ ] `bigmind plugin create` - Create plugin
- [ ] `bigmind plugin dev` - Dev mode
- [ ] `bigmind plugin build` - Build plugin
- [ ] `bigmind plugin publish` - Publish to registry
- [ ] `bigmind plugin validate` - Validate manifest

#### Tests Sprint 6
- [ ] Tests `create-plugin.test.ts` (15 tests)
- [ ] Tests `publish-plugin.test.ts` (12 tests)
- [ ] Tests CLI commands (20 tests)
- [ ] Tests monorepo build pipeline (10 tests)
- [ ] **Total Sprint 6: 57 tests**

---

### Sprint 7: State Management & Persistence (Semaines 14)

#### Store Architecture
- [ ] Créer `src/stores/index.ts` - Barrel export
- [ ] Créer `src/stores/AppStore.ts` - Store principal global
- [ ] Créer `src/stores/slices/mindmapSlice.ts` - Slice mindmaps
- [ ] Créer `src/stores/slices/pluginsSlice.ts` - Plugins state
- [ ] Créer `src/stores/slices/uiSlice.ts` - UI state
- [ ] Créer `src/stores/slices/settingsSlice.ts` - Settings
- [ ] Créer `src/stores/middleware/persistenceMiddleware.ts` - Auto-save
- [ ] Créer `src/stores/middleware/undoRedoMiddleware.ts` - History
- [ ] Créer `src/stores/middleware/syncMiddleware.ts` - Multi-tab sync

#### Persistence Layer
- [ ] Créer `src/persistence/IndexedDBAdapter.ts` - IndexedDB wrapper
- [ ] Créer `src/persistence/LocalStorageAdapter.ts` - localStorage wrapper
- [ ] Créer `src/persistence/StorageManager.ts` - Gestionnaire unifié
- [ ] Créer `src/persistence/migrations/` - Schema migrations
- [ ] Implémenter auto-save avec debounce
- [ ] Implémenter recovery après crash
- [ ] Implémenter versioning

#### Undo/Redo System
- [ ] Créer `src/history/HistoryManager.ts` - Undo/redo engine
- [ ] Créer `src/history/actions/` - Action types
- [ ] Créer `src/history/commands/` - Command pattern
- [ ] Implémenter undo/redo pour nodes
- [ ] Implémenter undo/redo pour styles
- [ ] Implémenter undo/redo pour tags
- [ ] Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)
- [ ] Intégration avec Command System Phase 3

#### Migration Hooks
- [ ] Migrer `useOpenFiles` → AppStore
- [ ] Migrer `useTagStore` → AppStore
- [ ] Migrer `useAppSettings` → AppStore
- [ ] Migrer `useViewport` → AppStore
- [ ] Créer compatibility layer pour anciens hooks
- [ ] Dépréciation warnings

#### Tests Sprint 7
- [ ] Tests `AppStore.test.ts` (20 tests)
- [ ] Tests `persistenceMiddleware.test.ts` (15 tests)
- [ ] Tests `undoRedoMiddleware.test.ts` (25 tests)
- [ ] Tests `IndexedDBAdapter.test.ts` (18 tests)
- [ ] Tests `HistoryManager.test.ts` (22 tests)
- [ ] Tests migration hooks (15 tests)
- [ ] Tests E2E `state-persistence.spec.ts` (12 tests)
- [ ] **Total Sprint 7: 127 tests**

---

### Sprint 8: Performance & Optimization (Semaines 15-16)

#### Virtual Rendering
- [ ] Créer `src/rendering/VirtualCanvas.tsx` - Virtual scrolling
- [ ] Créer `src/rendering/useVirtualization.ts` - Hook
- [ ] Créer `src/rendering/QuadTree.ts` - Spatial indexing
- [ ] Créer `src/rendering/Culling.ts` - Frustum culling
- [ ] Implémenter viewport-based rendering
- [ ] Implémenter LOD (Level of Detail)

#### Memoization & Optimization
- [ ] Créer `src/optimization/memoization.ts` - Custom memo
- [ ] Créer `src/optimization/useShallowMemo.ts` - Hook
- [ ] Optimiser `MindMapCanvas` avec React.memo
- [ ] Optimiser `Node` avec React.memo + areEqual
- [ ] Implémenter `useCallback` pour event handlers
- [ ] Implémenter `useMemo` pour computed values

#### Code Splitting & Lazy Loading
- [ ] Configurer dynamic imports dans vite.config.ts
- [ ] Lazy load Settings page
- [ ] Lazy load Plugins page
- [ ] Lazy load plugin WebViews
- [ ] Route-based code splitting
- [ ] Component-based code splitting

#### Web Workers
- [ ] Créer `src/workers/exportWorker.ts` - Export background
- [ ] Créer `src/workers/importWorker.ts` - Import background
- [ ] Créer `src/workers/searchWorker.ts` - Search indexing
- [ ] Créer `src/workers/WorkerPool.ts` - Worker management
- [ ] Implémenter transferable objects
- [ ] Intégrer Comlink

#### Tests Sprint 8
- [ ] Tests `VirtualCanvas.test.tsx` (15 tests)
- [ ] Tests `QuadTree.test.ts` (20 tests)
- [ ] Tests `memoization.test.ts` (10 tests)
- [ ] Tests `exportWorker.test.ts` (12 tests)
- [ ] Tests performance benchmarks (8 benchmarks)
- [ ] **Total Sprint 8: 65 tests**

---

## 📊 Impact Analysis sur Phase 3

### Core Systems Phase 3 - Impacts

#### ✅ Command System (`src/core/commands/`)
**Impact:** Faible - Extensions uniquement
- ✅ Ajouter commandes install/update/remove plugin
- ✅ Ajouter commandes undo/redo
- ✅ Compatible avec architecture existante
- Aucune breaking change

#### ✅ Theme System (`src/core/theme/`)
**Impact:** Aucun
- ✅ Complètement compatible
- Plugins peuvent utiliser ThemeManager
- Aucune modification requise

#### ⚠️ Plugin System (`src/core/plugins/`)
**Impact:** Moyen - Extensions majeures
- ⚠️ Extension `PluginManifest` avec `distribution` field
- ⚠️ Extension `ManifestLoader` pour supporter CDN
- ⚠️ Nouveau `PluginInstaller` pour lifecycle
- ⚠️ Nouveau `UpdateManager` pour updates
- ✅ Backward compatible avec manifests existants
- Migration: Ajouter champs optionnels `distribution`

#### ✅ Accessibility (`src/core/a11y/`)
**Impact:** Faible
- ✅ Ajouter ARIA pour nouveaux composants distribution
- ✅ SkipLinks pour PluginMarketplace sections
- ✅ Screen reader announcements pour install/update
- Compatible avec système existant

#### ⚠️ WebView System (`src/core/webviews/`)
**Impact:** Moyen
- ⚠️ Support chargement plugins depuis CDN
- ⚠️ CSP ajustements pour registry domains
- ✅ MessageBridge reste compatible
- ✅ Security model reste valide

#### ⚠️ UI System (`src/core/ui/`)
**Impact:** Faible
- ✅ Slot/Fill utilisé pour plugin UI contributions
- ✅ Aucune modification requise
- Compatible

### Composants Existants - Impacts

#### ⚠️ `PluginMarketplace.tsx`
**Impact:** Moyen - Enhancements
- ⚠️ Intégrer PluginInstaller pour install réel
- ⚠️ Intégrer UpdateManager pour notifications
- ⚠️ Ajouter install progress UI
- ⚠️ Ajouter update notifications
- ✅ UI existant reste valide

#### ⚠️ Hooks (`useOpenFiles`, `useTagStore`, etc.)
**Impact:** Fort - Migration vers AppStore
- ⚠️ **Breaking**: Migration vers store centralisé
- ⚠️ Compatibility layer temporaire
- ⚠️ Dépréciation warnings
- Migration strategy: 3 phases (parallel → migrate → deprecate)

#### ✅ Settings Components
**Impact:** Faible
- ✅ Ajouter section "Plugin Registry"
- ✅ Ajouter section "Auto-Updates"
- Compatible avec settingsRegistry

### Breaking Changes

#### 1. Store Migration (Sprint 7)
```typescript
// ❌ AVANT (Zustand standalone)
import { useOpenFiles } from '@/hooks/useOpenFiles';
const { files, openFile } = useOpenFiles();

// ✅ APRÈS (Store centralisé)
import { useAppStore } from '@/stores';
const files = useAppStore((state) => state.files);
const openFile = useAppStore((state) => state.openFile);

// 🔄 TRANSITION (Compatibility layer)
import { useOpenFiles } from '@/hooks/useOpenFiles'; // Still works
// → Internally uses useAppStore + emits deprecation warning
```

#### 2. Plugin Manifest Distribution Field
```typescript
// Ancien manifest (toujours valide)
{
  "id": "com.bigmind.tags-manager",
  "version": "1.0.0"
  // ... autres champs
}

// Nouveau manifest (avec distribution)
{
  "id": "com.bigmind.tags-manager",
  "version": "1.0.0",
  "distribution": {
    "registry": "https://registry.bigmind.app",
    "cdn": "https://cdn.bigmind.app/plugins",
    "integrity": { "sig": "..." },
    "sbom": "sbom.json"
  }
}
```

#### 3. Plugin Loading
```typescript
// ❌ AVANT (Local only)
const manifests = getAllAvailableManifests(); // Vite glob

// ✅ APRÈS (Registry + Local)
const localManifests = getAllAvailableManifests();
const installedManifests = await pluginInstaller.getInstalled();
const allManifests = [...localManifests, ...installedManifests];
```

### Migration Strategy

#### Phase 1: Parallel Systems (Sprint 1-6)
- Nouveau système distribution développé en parallèle
- Ancien système reste fonctionnel
- Pas de breaking changes
- Nouveaux plugins peuvent utiliser distribution

#### Phase 2: Soft Migration (Sprint 7)
- AppStore introduit
- Compatibility layer pour anciens hooks
- Deprecation warnings en console
- Documentation migration guide

#### Phase 3: Hard Migration (Post Phase 4)
- Supprimer compatibility layer
- Supprimer anciens hooks standalone
- Migration forcée vers AppStore
- Mise à jour tous les manifests

---

## 🧪 Tests Plan

### Test Coverage Goals
- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Key flows
- **E2E Tests:** Critical user journeys
- **Security Tests:** Signatures, integrity
- **Performance Tests:** Benchmarks

### Test Distribution
```
Sprint 1:  85 tests (Registry, Security, Signing)
Sprint 2:  63 tests (CDN, Cache)
Sprint 3:  90 tests (Dependencies, Bundling)
Sprint 4: 128 tests (Marketplace API, Services)
Sprint 5: 100 tests (Installer, Updates, Delta)
Sprint 6:  57 tests (Monorepo, CLI)
Sprint 7: 127 tests (Store, Persistence, Undo/Redo)
Sprint 8:  65 tests (Performance, Workers)
────────────────────
TOTAL:    715 tests
```

### E2E Test Scenarios
1. **Plugin Lifecycle**: Discover → Install → Use → Update → Remove
2. **Delta Update**: Check update → Download delta → Apply patch → Verify
3. **Signature Verification**: Download plugin → Verify signature → Install
4. **Dependency Resolution**: Install plugin with deps → Resolve → Install all
5. **Auto-Update**: Background check → Notify → User accepts → Update
6. **State Persistence**: Create map → Auto-save → Reload → Undo → Redo
7. **Multi-Tab Sync**: Open 2 tabs → Edit in tab 1 → Sync to tab 2
8. **Performance**: Load 1000 nodes → Render 60fps → Scroll smooth

---

## 🏗️ Architecture Finale

### Directory Structure Complète
```
bigmind/
├── apps/
│   ├── web/                          # Application principale
│   │   ├── src/
│   │   │   ├── core/                 # ✅ Phase 3 (existant)
│   │   │   │   ├── commands/
│   │   │   │   ├── theme/
│   │   │   │   ├── plugins/          # ⚠️ Extended Sprint 1-5
│   │   │   │   ├── ui/
│   │   │   │   ├── webviews/
│   │   │   │   └── a11y/
│   │   │   ├── stores/               # 🆕 Sprint 7
│   │   │   │   ├── AppStore.ts
│   │   │   │   ├── slices/
│   │   │   │   └── middleware/
│   │   │   ├── persistence/          # 🆕 Sprint 7
│   │   │   │   ├── IndexedDBAdapter.ts
│   │   │   │   └── migrations/
│   │   │   ├── history/              # 🆕 Sprint 7
│   │   │   │   ├── HistoryManager.ts
│   │   │   │   └── commands/
│   │   │   ├── distribution/         # 🆕 Sprint 1-5
│   │   │   │   ├── RegistryClient.ts
│   │   │   │   ├── PluginInstaller.ts
│   │   │   │   ├── UpdateManager.ts
│   │   │   │   ├── DeltaUpdater.ts
│   │   │   │   ├── DependencyResolver.ts
│   │   │   │   ├── CacheManager.ts
│   │   │   │   └── AssetUploader.ts
│   │   │   ├── security/             # 🆕 Sprint 1
│   │   │   │   ├── Signer.ts
│   │   │   │   ├── Verifier.ts
│   │   │   │   └── KeyManager.ts
│   │   │   ├── rendering/            # 🆕 Sprint 8
│   │   │   │   ├── VirtualCanvas.tsx
│   │   │   │   ├── QuadTree.ts
│   │   │   │   └── Culling.ts
│   │   │   ├── optimization/         # 🆕 Sprint 8
│   │   │   │   └── memoization.ts
│   │   │   ├── workers/              # 🆕 Sprint 8
│   │   │   │   ├── exportWorker.ts
│   │   │   │   ├── importWorker.ts
│   │   │   │   └── WorkerPool.ts
│   │   │   └── components/
│   │   │       └── distribution/     # 🆕 Sprint 5
│   │   │           ├── PluginInstaller.tsx
│   │   │           ├── UpdateNotification.tsx
│   │   │           └── ProgressBar.tsx
│   │   └── vite.config.ts            # ⚠️ Updated Sprint 3
│   └── api/                          # 🆕 Sprint 4
│       ├── src/
│       │   ├── services/
│       │   │   ├── PluginService.ts
│       │   │   ├── SearchService.ts
│       │   │   ├── ReviewService.ts
│       │   │   └── AnalyticsService.ts
│       │   └── routes/
│       │       └── plugins.ts
│       └── package.json
├── packages/
│   ├── plugin-sdk/                   # ✅ Phase 3 (existant)
│   ├── core/                         # 🆕 Sprint 6
│   ├── shared/                       # 🆕 Sprint 6
│   └── cli/                          # 🆕 Sprint 6
│       ├── src/
│       │   └── commands/
│       │       ├── create.ts
│       │       ├── dev.ts
│       │       ├── build.ts
│       │       └── publish.ts
│       └── package.json
├── plugins/                          # 🆕 Sprint 6
│   ├── tags-manager/
│   ├── export-manager/
│   └── [autres plugins...]
├── infrastructure/                   # 🆕 Sprint 1-2
│   ├── verdaccio/
│   │   ├── config.yaml
│   │   └── Dockerfile
│   ├── cdn/
│   │   └── nginx.conf
│   └── database/
│       └── schema.sql
├── turbo.json                        # 🆕 Sprint 6
└── package.json
```

---

## 📦 Dependencies to Add

### Sprint 1 (Registry & Security)
```json
{
  "verdaccio": "^5.29.0",
  "tweetnacl": "^1.0.3",
  "@noble/ed25519": "^2.0.0",
  "cyclonedx-node-module": "^4.0.0"
}
```

### Sprint 2 (CDN & Cache)
```json
{
  "aws-sdk": "^2.1550.0",
  "@google-cloud/storage": "^7.7.0",
  "lru-cache": "^10.1.0"
}
```

### Sprint 3 (Dependencies)
```json
{
  "semver": "^7.6.0",
  "pacote": "^17.0.0"
}
```

### Sprint 4 (Backend API)
```json
{
  "express": "^4.18.0",
  "pg": "^8.11.0",
  "jsonwebtoken": "^9.0.0",
  "zod": "^3.22.0",
  "bcrypt": "^5.1.0"
}
```

### Sprint 5 (Delta Updates)
```json
{
  "bsdiff-node": "^2.1.0",
  "node-fetch": "^3.3.0"
}
```

### Sprint 6 (Monorepo)
```json
{
  "turbo": "^1.12.0",
  "commander": "^12.0.0",
  "inquirer": "^9.2.0"
}
```

### Sprint 7 (State)
```json
{
  "immer": "^10.0.0",
  "zustand": "^4.5.0",
  "idb": "^8.0.0"
}
```

### Sprint 8 (Performance)
```json
{
  "comlink": "^4.4.0",
  "react-window": "^1.8.10"
}
```

---

## 🎯 Success Criteria

### Security
- [ ] 100% plugins signés
- [ ] SBOM pour tous les plugins
- [ ] Provenance SLSA Level 2+
- [ ] Vulnérabilités critiques bloquées
- [ ] Signatures vérifiées avant install

### Performance
- [ ] CDN hit rate > 95%
- [ ] Plugin install < 2s (avg)
- [ ] Delta update 60% smaller
- [ ] 60 FPS rendering avec 1000+ nodes
- [ ] Auto-save < 100ms

### Distribution
- [ ] Plugin discovery < 500ms
- [ ] Search latency < 200ms
- [ ] 99.9% uptime registry
- [ ] Multi-region CDN
- [ ] Fallback chain functional

### Developer Experience
- [ ] Plugin create → publish < 5min
- [ ] Hot reload en dev < 1s
- [ ] Build cache hit > 80%
- [ ] CLI commands intuitive
- [ ] Documentation complète

### Quality
- [ ] 715+ tests passing
- [ ] 80%+ code coverage
- [ ] 0 critical bugs
- [ ] RGPD compliant
- [ ] Audit logs functional

---

## 📅 Timeline

```
Week 1-2:   Sprint 1 (Registry & Publication)
Week 3-4:   Sprint 2 (CDN & Cache)
Week 5-6:   Sprint 3 (Dependencies & Bundling)
Week 7-9:   Sprint 4 (Marketplace Backend & API)
Week 10-11: Sprint 5 (Installer & Updates)
Week 12-13: Sprint 6 (Monorepo & DX)
Week 14:    Sprint 7 (State Management)
Week 15-16: Sprint 8 (Performance)
```

---

## 🔒 Security Checklist

### Code Signing
- [ ] Ed25519 signatures
- [ ] Multi-layer signing (developer + marketplace)
- [ ] Public key registry
- [ ] Revocation mechanism
- [ ] OIDC integration (Sigstore)

### Supply Chain
- [ ] SBOM generation (CycloneDX)
- [ ] Provenance attestations (SLSA)
- [ ] Dependency scanning (Snyk/Trivy)
- [ ] License compliance
- [ ] Vulnerability blocking

### Runtime
- [ ] Signature verification avant load
- [ ] Integrity checks (SRI)
- [ ] CSP headers
- [ ] Sandbox isolation
- [ ] Permission model

### Privacy (RGPD)
- [ ] Data minimization
- [ ] Opt-in analytics
- [ ] Anonymization
- [ ] TTL 90 jours
- [ ] Export/delete data
- [ ] Consent management

---

## 📖 Documentation à créer

### Developer Docs
- [ ] `docs/PLUGIN_DEVELOPMENT.md` - Guide complet
- [ ] `docs/MANIFEST_SCHEMA.md` - Schema reference
- [ ] `docs/DISTRIBUTION.md` - Distribution guide
- [ ] `docs/SECURITY.md` - Security best practices
- [ ] `docs/API_REFERENCE.md` - Backend API docs

### User Docs
- [ ] `docs/PLUGIN_INSTALL.md` - Installation guide
- [ ] `docs/UPDATES.md` - Update management
- [ ] `docs/PRIVACY.md` - Privacy policy
- [ ] `docs/FAQ.md` - FAQ

### Internal Docs
- [ ] `docs/ARCHITECTURE.md` - System architecture
- [ ] `docs/MIGRATION_GUIDE.md` - Phase 3 → 4 migration
- [ ] `docs/RUNBOOK.md` - Operations runbook
- [ ] `docs/INCIDENT_RESPONSE.md` - Incident response

---

**Status:** 🟡 READY TO START
**Next Action:** Sprint 1 - Registry & Publication Infrastructure
**Created:** 2025-10-29
**Updated:** 2025-10-29

---

**Développeur:** Claude Code
**Priorité:** Phase 4 complète - Distribution + Advanced Features
**Approche:** Développement autonome "mode yolo" 🚀
