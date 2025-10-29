# Phase 4 - Core vs Plugin Architecture Analysis 🏗️

**Philosophie:** Plugin First - Tout ce qui peut être un plugin DOIT être un plugin.

**Date:** 2025-10-29
**Principe:** Le core doit être minimal et fournir uniquement les APIs/infrastructure critiques.

---

## 🎯 Principes de Décision

### CORE si:
1. ✅ **Sécurité critique** - Nécessaire pour la sécurité de toute la plateforme
2. ✅ **Infrastructure de base** - APIs utilisées par tous les plugins
3. ✅ **Performances critiques** - Impact direct sur toute l'application
4. ✅ **Dépendance circulaire** - Utilisé par le système de plugins lui-même

### PLUGIN si:
1. ✅ **Fonctionnalité optionnelle** - Peut être désactivée sans casser le core
2. ✅ **UI/UX spécifique** - Interface utilisateur additionnelle
3. ✅ **Intégration externe** - Connecteur vers service tiers
4. ✅ **Cas d'usage spécifique** - Utile pour certains utilisateurs seulement

---

## 📊 Sprint 1: Registry & Publication Infrastructure

### CORE ✅

#### 1. Distribution Schema & Validation
**Fichiers:**
- `apps/web/src/core/plugins/DistributionSchema.ts`
- `apps/web/src/core/plugins/ManifestValidator.ts`
- Extension de `packages/plugin-system/src/types/manifest.ts`

**Justification:**
- **Sécurité critique** ✅ : Validation des manifests est essentielle pour sécurité
- **Infrastructure de base** ✅ : Tous les plugins utilisent ces types
- **Dépendance système** ✅ : Le PluginManager a besoin de ces validations

**Décision:** CORE ✅

#### 2. Code Signing (Signer, Verifier, KeyManager)
**Fichiers:**
- `apps/web/src/security/Signer.ts`
- `apps/web/src/security/Verifier.ts`
- `apps/web/src/security/KeyManager.ts`

**Justification:**
- **Sécurité critique** ✅✅✅ : Vérification des signatures avant load
- **Infrastructure de base** ✅ : Tous les plugins signés utilisent cette API
- **Zero-trust** : Pas d'installation de plugin sans vérification

**Décision:** CORE ✅

**MAIS** - Avec API publique pour permettre plugins de signer leur contenu

#### 3. Verdaccio Infrastructure
**Fichiers:**
- `infrastructure/verdaccio/` (config, Dockerfile, docker-compose)

**Justification:**
- **Infrastructure de base** ✅ : Registry npm pour distribution
- **Non-optionnel** : Nécessaire pour tout le système de distribution

**Décision:** CORE ✅ (Infrastructure, pas code app)

---

### PLUGIN ❌ → Rien pour Sprint 1

**Raison:** Sprint 1 = Infrastructure critique. Tout est CORE.

---

## 📊 Sprint 2: CDN & Caching Strategy

### CORE ✅

#### 1. CacheManager & CacheStrategy
**Fichiers:**
- `apps/web/src/distribution/CacheManager.ts`
- `apps/web/src/distribution/CacheStrategy.ts`

**Justification:**
- **Performances critiques** ✅ : Cache impacte tous les plugins
- **Infrastructure de base** ✅ : API de cache réutilisable

**Décision:** CORE ✅

#### 2. AssetUploader & AssetVersioning
**Fichiers:**
- `apps/web/src/distribution/AssetUploader.ts`
- `apps/web/src/distribution/AssetVersioning.ts`

**Justification:**
- **Infrastructure de base** ✅ : Upload assets pour tous plugins
- **SRI/Integrity** ✅ : Lié à la sécurité

**Décision:** CORE ✅

#### 3. CDN Infrastructure (Nginx)
**Fichiers:**
- `infrastructure/cdn/nginx.conf`
- `infrastructure/cdn/cache-rules.conf`

**Justification:**
- **Infrastructure de base** ✅ : Servir tous les assets
- **Performances critiques** ✅ : Cache edge global

**Décision:** CORE ✅ (Infrastructure)

---

### PLUGIN ❌ → Rien pour Sprint 2

---

## 📊 Sprint 3: Dependency Resolution & Bundling

### CORE ✅

#### 1. DependencyResolver & DependencyGraph
**Fichiers:**
- `apps/web/src/distribution/DependencyResolver.ts`
- `apps/web/src/distribution/DependencyGraph.ts`
- `apps/web/src/distribution/VersionResolver.ts`

**Justification:**
- **Infrastructure de base** ✅ : Résolution de deps pour tous plugins
- **Sécurité** ✅ : Prévenir conflits de versions

**Décision:** CORE ✅

#### 2. IntegrityChecker
**Fichiers:**
- `apps/web/src/distribution/IntegrityChecker.ts`

**Justification:**
- **Sécurité critique** ✅✅ : Vérification hash/SRI
- **Non-optionnel** : Obligatoire avant load

**Décision:** CORE ✅

#### 3. BundleConfig
**Fichiers:**
- `apps/web/src/distribution/BundleConfig.ts`
- `vite.config.plugin.ts`

**Justification:**
- **Infrastructure de base** ✅ : Configuration bundling pour tous plugins
- **Shared externals** ✅ : React, react-dom partagés

**Décision:** CORE ✅

---

### PLUGIN ❌ → Rien pour Sprint 3

---

## 📊 Sprint 4: Marketplace Backend & API

### CORE ✅

#### 1. Marketplace API (Backend)
**Fichiers:**
- `apps/api/` (PluginService, SearchService, ReviewService, AnalyticsService)
- `infrastructure/database/schema.sql`

**Justification:**
- **Infrastructure de base** ✅ : API pour découvrir/installer plugins
- **Sécurité** ✅ : Auth, validation, modération

**Décision:** CORE ✅

---

### PLUGIN ✅ → Marketplace Frontend UI

#### Plugin: `@bigmind/plugin-marketplace-ui`

**Fichiers à migrer vers plugin:**
- `src/components/plugins/PluginMarketplace.tsx` → Plugin
- `src/components/plugins/PluginCard.tsx` → Plugin
- `src/components/plugins/PluginFilters.tsx` → Plugin
- `src/components/plugins/PluginDetailModal.tsx` → Plugin

**Justification:**
- **UI optionnelle** ✅ : Utilisateurs peuvent utiliser CLI/API
- **Personnalisable** ✅ : Différents styles de marketplace
- **Non-critique** ✅ : Installation possible sans UI

**Décision:** PLUGIN ✅

**API Core exposée:**
```typescript
// Core API (apps/web/src/core/marketplace/)
export interface MarketplaceAPI {
  search(query: string): Promise<Plugin[]>;
  getPlugin(id: string): Promise<Plugin>;
  install(id: string, version: string): Promise<void>;
  uninstall(id: string): Promise<void>;
}
```

**Plugin utilise l'API:**
```typescript
// Dans plugin-marketplace-ui
import { useMarketplaceAPI } from '@bigmind/core';

function PluginMarketplace() {
  const api = useMarketplaceAPI();
  const plugins = await api.search('export');
  // ... UI rendering
}
```

---

## 📊 Sprint 5: PluginInstaller & UpdateManager

### CORE ✅

#### 1. RegistryClient
**Fichiers:**
- `apps/web/src/distribution/RegistryClient.ts`

**Justification:**
- **Infrastructure de base** ✅ : Communication avec registry
- **Utilisé par système** ✅ : PluginManager utilise

**Décision:** CORE ✅

#### 2. PluginInstaller
**Fichiers:**
- `apps/web/src/distribution/PluginInstaller.ts`

**Justification:**
- **Infrastructure de base** ✅ : Installation de plugins
- **Sécurité critique** ✅ : Vérification signatures
- **Dépendance système** ✅ : Core du lifecycle

**Décision:** CORE ✅

#### 3. UpdateManager
**Fichiers:**
- `apps/web/src/distribution/UpdateManager.ts`

**Justification:**
- **Infrastructure de base** ✅ : Mises à jour automatiques
- **Sécurité** ✅ : Appliquer patches de sécurité

**Décision:** CORE ✅

#### 4. DeltaUpdater
**Fichiers:**
- `apps/web/src/distribution/DeltaUpdater.ts`

**Justification:**
- **Performances** ✅ : Optimisation bande passante
- **Infrastructure** ✅ : Tous les plugins en bénéficient

**Décision:** CORE ✅

---

### PLUGIN ✅ → UI Components

#### Plugin: `@bigmind/plugin-update-notifications`

**Fichiers à migrer vers plugin:**
- `src/components/distribution/UpdateNotification.tsx` → Plugin
- `src/components/distribution/ProgressBar.tsx` → Plugin
- `src/components/distribution/ReleaseNotes.tsx` → Plugin

**Justification:**
- **UI optionnelle** ✅ : Updates peuvent être silencieuses
- **Personnalisable** ✅ : Différents styles de notifications
- **Non-critique** ✅ : Updates fonctionnent sans UI

**Décision:** PLUGIN ✅

#### Plugin: `@bigmind/plugin-installer-ui`

**Fichiers:**
- `src/components/distribution/PluginInstaller.tsx` → Plugin

**Justification:**
- **UI optionnelle** ✅ : Installation via CLI possible
- **Personnalisable** ✅ : Workflow custom

**Décision:** PLUGIN ✅

---

## 📊 Sprint 6: Monorepo & Developer Experience

### CORE ✅

#### 1. Turborepo Configuration
**Fichiers:**
- `turbo.json`
- Workspaces setup

**Justification:**
- **Infrastructure de base** ✅ : Build system
- **DX critique** ✅ : Tous les devs utilisent

**Décision:** CORE ✅

#### 2. CLI Tools
**Fichiers:**
- `packages/cli/` (bigmind plugin create/build/publish)

**Justification:**
- **Infrastructure de base** ✅ : Outils dev pour tous plugins
- **DX** ✅ : Simplifie création plugins

**Décision:** CORE ✅

---

### PLUGIN ❌ → Rien

**Raison:** DX tools sont core infrastructure.

---

## 📊 Sprint 7: State Management & Persistence

### CORE ✅

#### 1. AppStore & Slices
**Fichiers:**
- `apps/web/src/stores/AppStore.ts`
- `apps/web/src/stores/slices/` (mindmap, plugins, ui, settings)

**Justification:**
- **Infrastructure de base** ✅ : Store centralisé
- **Performances** ✅ : State global optimisé
- **Dépendance système** ✅ : Tous les composants utilisent

**Décision:** CORE ✅

#### 2. Persistence Layer
**Fichiers:**
- `apps/web/src/persistence/IndexedDBAdapter.ts`
- `apps/web/src/persistence/LocalStorageAdapter.ts`
- `apps/web/src/persistence/StorageManager.ts`

**Justification:**
- **Infrastructure de base** ✅ : API de persistence réutilisable
- **Performances** ✅ : Auto-save optimisé

**Décision:** CORE ✅

**MAIS:** Plugins peuvent utiliser l'API pour persister leurs données

#### 3. Undo/Redo System
**Fichiers:**
- `apps/web/src/history/HistoryManager.ts`
- `apps/web/src/history/commands/`

**Justification:**
- **Fonctionnalité de base** ✅ : Undo/Redo attendu par utilisateurs
- **Intégration profonde** ✅ : Toutes les actions doivent être trackées

**Décision:** CORE ✅

**MAIS:** Plugins peuvent enregistrer leurs propres commands

---

### PLUGIN ❌ → Rien pour Sprint 7

**Raison:** State management est infrastructure critique.

---

## 📊 Sprint 8: Performance & Optimization

### CORE ✅

#### 1. Virtual Rendering
**Fichiers:**
- `apps/web/src/rendering/VirtualCanvas.tsx`
- `apps/web/src/rendering/QuadTree.ts`
- `apps/web/src/rendering/Culling.ts`

**Justification:**
- **Performances critiques** ✅✅ : Rendering 1000+ nodes
- **Fonctionnalité de base** ✅ : Canvas est core

**Décision:** CORE ✅

#### 2. Memoization Utilities
**Fichiers:**
- `apps/web/src/optimization/memoization.ts`
- `apps/web/src/optimization/useShallowMemo.ts`

**Justification:**
- **Infrastructure de base** ✅ : Hooks réutilisables
- **Performances** ✅ : Utilisé partout

**Décision:** CORE ✅

**MAIS:** API publique pour plugins

#### 3. Web Workers
**Fichiers:**
- `apps/web/src/workers/WorkerPool.ts`

**Justification:**
- **Infrastructure de base** ✅ : Worker pool réutilisable
- **Performances** ✅ : Offload CPU-heavy tasks

**Décision:** CORE ✅

---

### PLUGIN ✅ → Export/Import Workers

#### Plugin: `@bigmind/plugin-export-workers`

**Fichiers:**
- `apps/web/src/workers/exportWorker.ts` → Plugin
- `apps/web/src/workers/importWorker.ts` → Plugin
- `apps/web/src/workers/searchWorker.ts` → Plugin

**Justification:**
- **Fonctionnalité spécifique** ✅ : Export/Import sont des features
- **Optionnel** ✅ : Peut être synchrone si pas de plugin
- **Extensible** ✅ : Autres plugins peuvent ajouter formats

**Décision:** PLUGIN ✅

**Core fournit:**
```typescript
// Core WorkerPool API
export interface WorkerPoolAPI {
  registerWorker(name: string, worker: Worker): void;
  executeTask<T>(workerName: string, task: Task): Promise<T>;
}
```

---

## 📊 Résumé Final

### Core Components (Total: 90%)

**Sprint 1 (100% Core):**
- ✅ Distribution Schema & Validation
- ✅ Code Signing (Signer, Verifier, KeyManager)
- ✅ Verdaccio Infrastructure

**Sprint 2 (100% Core):**
- ✅ CacheManager, CacheStrategy, CacheInvalidator
- ✅ AssetUploader, AssetVersioning
- ✅ CDN Infrastructure

**Sprint 3 (100% Core):**
- ✅ DependencyResolver, DependencyGraph, VersionResolver
- ✅ IntegrityChecker
- ✅ BundleConfig

**Sprint 4 (50% Core, 50% Plugin):**
- ✅ CORE: Marketplace API Backend
- 🔌 PLUGIN: Marketplace UI Frontend

**Sprint 5 (70% Core, 30% Plugin):**
- ✅ CORE: RegistryClient, PluginInstaller, UpdateManager, DeltaUpdater
- 🔌 PLUGIN: Update Notifications UI, Installer UI

**Sprint 6 (100% Core):**
- ✅ Turborepo, CLI Tools

**Sprint 7 (100% Core):**
- ✅ AppStore, Persistence, Undo/Redo

**Sprint 8 (80% Core, 20% Plugin):**
- ✅ CORE: VirtualCanvas, QuadTree, Memoization, WorkerPool
- 🔌 PLUGIN: Export/Import/Search Workers

---

## 🔌 Plugins à Créer (Phase 4)

### 1. `@bigmind/plugin-marketplace-ui`
**Description:** Interface utilisateur pour le marketplace
**Dépendances:** Core Marketplace API
**Features:**
- Plugin discovery UI
- Search & filters
- Plugin details modal
- Installation wizard

### 2. `@bigmind/plugin-update-notifications`
**Description:** Notifications de mises à jour
**Dépendances:** Core UpdateManager API
**Features:**
- Update notifications
- Release notes viewer
- Progress tracking
- Auto-update settings

### 3. `@bigmind/plugin-installer-ui`
**Description:** UI pour installation de plugins
**Dépendances:** Core PluginInstaller API
**Features:**
- Installation progress
- Dependency tree visualization
- Error handling UI
- Rollback interface

### 4. `@bigmind/plugin-export-workers`
**Description:** Workers pour export/import formats
**Dépendances:** Core WorkerPool API
**Features:**
- PDF export worker
- PNG/SVG export worker
- Import workers (XMind, FreeMind, etc.)
- Search indexing worker

---

## 🎯 Décisions Architecturales

### Principe 1: Security First → CORE
Tout ce qui touche à la sécurité DOIT être dans le core:
- Code signing ✅
- Integrity checks ✅
- Validation ✅
- Authentication ✅

### Principe 2: UI → PLUGIN
Toutes les interfaces utilisateur PEUVENT être des plugins:
- Marketplace UI 🔌
- Installer UI 🔌
- Update notifications 🔌
- Settings panels 🔌 (déjà fait Phase 3)

### Principe 3: Infrastructure → CORE
Les APIs de base sont core, les implémentations peuvent être plugins:
- WorkerPool API ✅ (core)
- Export workers 🔌 (plugin)
- Storage API ✅ (core)
- Specific adapters 🔌 (plugins possibles)

### Principe 4: Performance Critical → CORE
Ce qui impacte toute l'app reste core:
- Virtual rendering ✅
- State management ✅
- Cache system ✅

---

## 📋 Actions de Migration

### À Migrer vers Plugins

1. **Créer plugin-marketplace-ui**
   - Déplacer `src/components/plugins/PluginMarketplace.tsx`
   - Créer manifest avec UI contributions
   - Exposer via Slot/Fill

2. **Créer plugin-update-notifications**
   - Déplacer `src/components/distribution/UpdateNotification.tsx`
   - Intégrer avec Core UpdateManager

3. **Créer plugin-installer-ui**
   - Déplacer `src/components/distribution/PluginInstaller.tsx`
   - Intégrer avec Core PluginInstaller

4. **Créer plugin-export-workers**
   - Déplacer `src/workers/exportWorker.ts`
   - Déplacer `src/workers/importWorker.ts`
   - Utiliser Core WorkerPool API

### APIs Core à Créer

1. **MarketplaceAPI** (Sprint 4)
   ```typescript
   export interface MarketplaceAPI {
     search(query: string): Promise<Plugin[]>;
     getPlugin(id: string): Promise<Plugin>;
     install(id: string, version: string): Promise<void>;
   }
   ```

2. **InstallerAPI** (Sprint 5)
   ```typescript
   export interface InstallerAPI {
     install(id: string, opts?: InstallOptions): Promise<void>;
     uninstall(id: string): Promise<void>;
     getProgress(id: string): Promise<InstallProgress>;
   }
   ```

3. **WorkerPoolAPI** (Sprint 8)
   ```typescript
   export interface WorkerPoolAPI {
     registerWorker(name: string, worker: Worker): void;
     executeTask<T>(name: string, task: Task): Promise<T>;
   }
   ```

---

## ✅ Validation Checklist

Avant d'implémenter une feature, se demander:

- [ ] Est-ce critique pour la sécurité ? → CORE
- [ ] Est-ce utilisé par le système de plugins ? → CORE
- [ ] Est-ce une UI optionnelle ? → PLUGIN
- [ ] Peut-on désactiver sans casser l'app ? → PLUGIN
- [ ] Est-ce une intégration externe ? → PLUGIN
- [ ] Impact sur les performances globales ? → CORE
- [ ] Peut-on l'implémenter via une API publique ? → PLUGIN

---

**Philosophie:** "Core fournit les outils, Plugins fournissent les features"

**Statut:** 🟢 VALIDÉ
**Prochaine action:** Continuer Sprint 1 avec architecture validée
