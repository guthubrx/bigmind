# 🔍 Analyse Exhaustive : Migration Cartae → Cartae

**Date :** 31 Octobre 2025
**Analyse complète :** 3 repositories

---

## 📊 Vue d'Ensemble

### Fichiers Affectés (TOTAL)

| Repository | Fichiers | % du Total |
|------------|----------|------------|
| **cartae** (principal) | **192** | 78.0% |
| **cartae-plugins** | **38** | 15.4% |
| **cartae-private** | **16** | 6.5% |
| **TOTAL** | **246** | 100% |

---

## 📁 Repo 1 : cartae (Principal) - 192 fichiers

### Répartition par Dossier

| Dossier | Fichiers | Description |
|---------|----------|-------------|
| `apps/` | **104** | Applications web + desktop |
| `packages/` | **34** | Packages monorepo (@cartae/*) |
| Documentation (*.md) | **46** | Tous les fichiers markdown racine |
| `tests/` | **2** | Tests Playwright |
| `infrastructure/` | **2** | Configs infrastructure |
| `.claude/` | **2** | Configs Claude Code |
| `examples/` | **1** | Plugin examples |
| Configs racine | **1** | tsconfig, vite, package.json |

### Détail apps/ (104 fichiers)

**apps/web/** (~70-80 fichiers estimés)
- Tous les composants React (*.tsx)
- Services TypeScript
- package.json
- Configs (vite, tsconfig)
- Imports `@cartae/*` partout

**apps/desktop/** (~20-30 fichiers estimés)
- Sources Electron
- package.json
- Configs

### Détail packages/ (34 fichiers)

Packages affectés (7 packages monorepo) :
1. `@cartae/core`
2. `@cartae/ui`
3. `@cartae/design`
4. `@cartae/plugin-system`
5. `@cartae/plugin-sdk`
6. `@cartae/plugin-marketplace`
7. `@cartae/plugin-storage` (?)

Chaque package contient :
- `package.json` (nom du package)
- Sources TypeScript avec imports inter-packages
- Configs (vite, tsconfig)

### Détail Documentation (46 fichiers .md)

**Fichiers de documentation critiques :**
- `README.md` (principal)
- `QUICK_START.md`
- `DEPLOYMENT_GUIDE.md`
- `CHANGELOG.md`
- Tous les fichiers `PHASE*.md` (8 fichiers)
- Tous les fichiers `PLUGIN_*.md` (6 fichiers)
- Tous les fichiers `TAGS_*.md` (7 fichiers)
- Autres (MARKETPLACE, GITHUB_OAUTH, etc.)

**Contenu à modifier :**
- Titre "Cartae" → "Cartae"
- Exemples de code avec `@cartae/...`
- Screenshots/diagrammes
- URLs de repos GitHub

---

## 📁 Repo 2 : cartae-plugins (Community) - 38 fichiers

### Fichiers Racine (5)
- `registry.json` ⚠️ **CRITIQUE** - Tous les plugin IDs
- `package.json` - Nom du workspace
- `README.md`
- `CONTRIBUTING.md`
- `community/README.md`

### Plugins (33 fichiers, 6 plugins)

**Structure par plugin :**
```
plugin-name/
├── manifest.json      → "id": "com.cartae.xxx"
├── package.json       → "name": "@cartae/xxx"
├── index.ts           → imports avec @cartae/plugin-sdk
├── vite.config.ts     → config build
├── package-lock.json
└── README.md (optionnel)
```

**Plugins affectés :**
1. **official/color-palettes-collection** (7 fichiers)
2. **official/dag-templates-collection** (7 fichiers)
3. **community/hello-world** (7 fichiers)
4. **community/example** (5 fichiers)
5. **community/event-monitor** (6 fichiers)
6. **community/analytics** (6 fichiers)

**Changements requis par plugin :**
- `manifest.json` : `"id": "com.cartae.xxx"` → `"com.cartae.xxx"`
- `package.json` : `"name": "@cartae/xxx"` → `"@cartae/xxx"`
- `index.ts` : `import { ... } from '@cartae/plugin-sdk'` → `'@cartae/plugin-sdk'`
- `README.md` : Texte "Cartae" → "Cartae"

### registry.json - CRITIQUE

**Format actuel :**
```json
{
  "plugins": [
    {
      "id": "com.cartae.hello-world",
      "manifestUrl": "https://raw.githubusercontent.com/guthubrx/cartae-plugins/main/community/hello-world/manifest.json",
      ...
    }
  ]
}
```

**Changements requis :**
- Tous les `"id": "com.cartae.*"` → `"com.cartae.*"`
- Toutes les URLs GitHub : `cartae-plugins` → `cartae-plugins`

---

## 📁 Repo 3 : cartae-private (Admin) - 16 fichiers

### Fichiers Racine (3)
- `package.json` - Nom workspace monorepo
- `README.md` - Documentation monorepo
- `todo291025.md` - Journal de développement (nombreuses références Cartae)

### Plugin admin-panel/ (8 fichiers)

**Fichiers :**
- `plugins/admin-panel/package.json` → `"name": "@cartae/admin-panel"`
- `plugins/admin-panel/manifest.json` → `"id": "com.cartae.admin-panel"`
- `plugins/admin-panel/vite.config.ts`
- `plugins/admin-panel/src/index.ts`
- `plugins/admin-panel/src/components/AdminPanel.tsx` - Texte UI
- `plugins/admin-panel/src/services/AdminAPIClient.ts`
- `plugins/admin-panel/src/types/plugin-system.d.ts` → Déclaration `@cartae/plugin-system`

### Shared package/ (4 fichiers)

**Fichiers :**
- `shared/package.json` → `"name": "@cartae-private/shared"`
- `shared/src/index.ts`
- `shared/src/config/github.ts` - OAuth app name
- `shared/src/components/GitHubLoginButton.tsx`
- `shared/src/services/GitHubAuthService.ts`

### Documentation (1 fichier)
- `TEST_ADMIN_FLOW.md` - Guide de test avec exemples Cartae

---

## 🎯 Types de Changements par Catégorie

### 1️⃣ Package Names (26 packages)

**Monorepo principal (7 packages) :**
```json
"@cartae/core" → "@cartae/core"
"@cartae/ui" → "@cartae/ui"
"@cartae/design" → "@cartae/design"
"@cartae/plugin-system" → "@cartae/plugin-system"
"@cartae/plugin-sdk" → "@cartae/plugin-sdk"
"@cartae/plugin-marketplace" → "@cartae/plugin-marketplace"
"@cartae/plugin-storage" → "@cartae/plugin-storage"
```

**Plugins community (6 packages) :**
```json
"@cartae/hello-world" → "@cartae/hello-world"
"@cartae/color-palettes-collection" → "@cartae/color-palettes-collection"
"@cartae/dag-templates-collection" → "@cartae/dag-templates-collection"
"@cartae/example" → "@cartae/example"
"@cartae/event-monitor" → "@cartae/event-monitor"
"@cartae/analytics" → "@cartae/analytics"
```

**Plugins privés (2 packages) :**
```json
"@cartae/admin-panel" → "@cartae/admin-panel"
"@cartae-private/shared" → "@cartae-private/shared"
```

**Workspaces racine (3) :**
```json
"cartae" → "cartae"
"cartae-plugins" → "cartae-plugins"
"@cartae/private-plugins" → "@cartae/private-plugins"
```

**Apps (2) :**
```json
"cartae-web" → "cartae-web"
"cartae-desktop" → "cartae-desktop"
```

### 2️⃣ Plugin IDs (8+ plugins)

**Format :**
```json
"com.cartae.xxx" → "com.cartae.xxx"
```

**Liste complète :**
- `com.cartae.hello-world`
- `com.cartae.color-palettes-collection`
- `com.cartae.dag-templates-collection`
- `com.cartae.event-monitor`
- `com.cartae.analytics`
- `com.cartae.example`
- `com.cartae.admin-panel`
- Tous les plugins officiels (tags-manager, export-manager, etc.)

### 3️⃣ Imports TypeScript (~150+ occurrences estimées)

**Pattern de recherche :**
```typescript
import { ... } from '@cartae/core'
import { ... } from '@cartae/ui'
import type { ... } from '@cartae/plugin-system'
```

**Remplacer par :**
```typescript
import { ... } from '@cartae/core'
import { ... } from '@cartae/ui'
import type { ... } from '@cartae/plugin-system'
```

**Fichiers impactés :**
- Tous les fichiers dans `apps/web/src/` (~70 fichiers)
- Tous les fichiers dans `apps/desktop/src/` (~20 fichiers)
- Tous les fichiers dans `packages/*/src/` (~30 fichiers)
- Tous les plugins (~30 fichiers)

### 4️⃣ TypeScript Configs (4 fichiers)

**tsconfig.base.json :**
```json
{
  "compilerOptions": {
    "paths": {
      "@cartae/core": ["./packages/core/dist/index.d.ts"],
      "@cartae/ui": ["./packages/ui/dist/index.d.ts"],
      ...
    }
  }
}
```

### 5️⃣ URLs GitHub (40+ occurrences)

**Pattern :**
```
https://github.com/guthubrx/cartae
https://github.com/guthubrx/cartae-plugins
https://github.com/guthubrx/cartae-private
```

**Remplacer par :**
```
https://github.com/guthubrx/cartae
https://github.com/guthubrx/cartae-plugins
https://github.com/guthubrx/cartae-private
```

**Localisation :**
- `registry.json` (cartae-plugins) - manifestUrl
- Tous les README.md
- package.json - repository.url
- Documentation markdown

### 6️⃣ Texte UI / Documentation (~50+ occurrences)

**Texte à remplacer :**
- Titres : "Cartae" → "Cartae"
- `<title>Cartae</title>` → `<title>Cartae</title>`
- Messages utilisateur
- Commentaires de code (optionnel)
- Noms de variables (optionnel)

**Fichiers impactés :**
- `apps/web/index.html`
- Composants React avec texte
- Tous les README.md (46 fichiers)
- Documentation technique

### 7️⃣ Configs Build / CI (10+ fichiers)

**Fichiers :**
- `vite.config.ts` (multiple) - Titre de l'app
- `playwright.config.ts` - Noms de tests
- `.github/workflows/*.yml` (si présents) - Noms de jobs
- `package.json` scripts

---

## ⚠️ Points Critiques à NE PAS Oublier

### 🔴 CRITIQUE 1 : registry.json
**Fichier :** `cartae-plugins/registry.json`

**Impact :** Si oublié, tous les plugins du marketplace cassent !

**Changements :**
- Tous les plugin IDs
- Toutes les URLs manifestUrl
- URLs GitHub du repo

### 🔴 CRITIQUE 2 : Supabase Project Name
**Service :** Supabase Dashboard

**Impact :** Non-critique mais important pour cohérence

**Action :** Renommer "Cartae" → "Cartae" dans Settings

### 🔴 CRITIQUE 3 : GitHub OAuth App
**Service :** GitHub OAuth App

**Impact :** Nom affiché lors du login

**Action :** Renommer dans GitHub Developer Settings

### 🔴 CRITIQUE 4 : Clean Install
**Action requise :** `rm -rf node_modules pnpm-lock.yaml && pnpm install`

**Impact :** Sans ça, les anciens packages restent en cache

### 🔴 CRITIQUE 5 : TypeScript Paths
**Fichier :** `tsconfig.base.json`

**Impact :** Sans ça, tous les imports cassent en dev

---

## 📋 Estimation de Temps RÉELLE

### Migration Automatique (Script)
- **Préparation :** 15 min (branche, tag, backup)
- **Exécution script :** 5 min
- **Clean install :** 10 min
- **Build & vérification :** 15 min
- **Tests manuels :** 20 min
- **Renommage GitHub :** 10 min
- **Mise à jour services :** 10 min
- **Documentation :** 15 min

**TOTAL : ~1h30 - 2h** (au lieu de 30-45min estimés initialement)

### Migration Manuelle
- **Préparation :** 15 min
- **Renommage packages :** 30 min (26 packages)
- **Imports TypeScript :** 45 min (~150 imports)
- **Plugin IDs :** 20 min (8+ plugins)
- **URLs GitHub :** 30 min (40+ URLs)
- **Texte UI :** 30 min
- **Configs :** 20 min
- **Clean install :** 10 min
- **Tests :** 30 min
- **GitHub/Services :** 20 min

**TOTAL : ~4h-5h**

---

## ✅ Recommandation Finale

**Option : Migration Automatique via Script**

**Pourquoi ?**
1. ✅ **246 fichiers** : Trop pour du manuel
2. ✅ **Cohérence** : Pas de risque d'oubli
3. ✅ **Temps** : 2h vs 5h
4. ✅ **Sécurité** : Tag Git + branche
5. ✅ **Réversible** : Rollback en 1 commande

**Script à améliorer :**
- Ajouter vérification pre-migration
- Ajouter backup automatique
- Ajouter vérification post-migration
- Ajouter rapport de migration

**Prêt à lancer ?** 🚀
