# 🏪 BigMind Marketplace - Architecture & Hébergement

## 📋 Table des matières

1. [Votre Question](#votre-question)
2. [Comparaison des Modèles](#comparaison-des-modèles)
3. [Options d'Hébergement & Coûts](#options-dhébergement--coûts)
4. [Architecture Recommandée pour BigMind](#architecture-recommandée-pour-bigmind)
5. [Implémentation Technique](#implémentation-technique)
6. [Modèle de Contrôle](#modèle-de-contrôle)
7. [Roadmap de Migration](#roadmap-de-migration)

---

## 🎯 Votre Question

> "Je veux que les users ne chargent pas tous les plugins d'un coup en faisant le clone (du coup faut sûrement un autre repo) mais juste ceux dont ils ont besoin. Comment on héberge, est-ce payant, comment on contrôle ou pas : App Store like ? WordPress like... Quelles sont les bonnes pratiques ?"

**Réponse courte :** Vous avez raison à 100% ! Il faut **séparer les plugins du monorepo principal** et créer une **marketplace distante** avec téléchargement à la demande.

---

## 🔍 Comparaison des Modèles

### 1. VS Code Marketplace (Microsoft)

| Aspect | Détails |
|--------|---------|
| **Architecture** | Centralisée sur Azure DevOps |
| **Format** | `.vsix` (ZIP avec manifest) |
| **Hébergement** | Azure Blob Storage + CDN |
| **Contrôle** | ⚠️ Modéré (review manuelle pour malware) |
| **Coûts** | Gratuit pour les développeurs, Microsoft paie |
| **API** | Propriétaire (non documentée officiellement) |
| **Download** | HTTP direct depuis `marketplace.visualstudio.com` |
| **Updates** | Auto-check toutes les 12h |
| **✅ Avantages** | Fiable, rapide, gratuit |
| **❌ Inconvénients** | Propriétaire, pas de contrôle total |

**Revenus Microsoft :** Indirect (lock-in écosystème VS Code)

---

### 2. WordPress.org Plugin Directory

| Aspect | Détails |
|--------|---------|
| **Architecture** | Centralisée (WordPress.org) |
| **Format** | `.zip` (code PHP brut) |
| **Hébergement** | Serveurs WordPress.org (donations) |
| **Contrôle** | 🟢 Ouvert mais reviewé |
| **Coûts** | 100% gratuit (non-profit) |
| **API** | Publique et documentée |
| **Download** | HTTP via `downloads.wordpress.org` |
| **Updates** | Check via `plugins_api` hook |
| **✅ Avantages** | Ouvert, gratuit, confiance communauté |
| **❌ Inconvénients** | Review lente (7-14 jours), pas de versioning |

**Plugins Premium :** Hébergés sur serveurs privés des développeurs

---

### 3. NPM Registry

| Aspect | Détails |
|--------|---------|
| **Architecture** | Décentralisée possible (Verdaccio, Open-Registry) |
| **Format** | `.tgz` (tarball) |
| **Hébergement** | Cloudflare (npmjs.com) ou self-hosted |
| **Contrôle** | 🟡 Minimal (malware scan basique) |
| **Coûts** | Gratuit (public), $7/user/mois (private) |
| **API** | Publique et très bien documentée |
| **Download** | HTTP + CDN (jsDelivr, UNPKG) |
| **Updates** | `npm outdated` / semver ranges |
| **✅ Avantages** | Décentralisé, CDN gratuit, versioning parfait |
| **❌ Inconvénients** | Moins de contrôle qualité |

**Self-hosted :** Verdaccio (gratuit, Node.js)

---

### 4. Apple App Store / Google Play

| Aspect | Détails |
|--------|---------|
| **Architecture** | Ultra-centralisée |
| **Format** | `.ipa` / `.apk` (signés) |
| **Hébergement** | Apple/Google CDN |
| **Contrôle** | 🔴 Très strict (review 1-7 jours) |
| **Coûts** | $99/an (Apple), $25 one-time (Google) |
| **API** | Privée |
| **Commission** | 30% (15% <$1M revenue) |
| **✅ Avantages** | Très sécurisé, confiance users |
| **❌ Inconvénients** | Coûteux, lent, arbitraire |

---

## 💰 Options d'Hébergement & Coûts

### Comparaison Exhaustive

| Solution | Stockage | Bande Passante | Coût/mois | Limite Gratuite | Recommandé pour |
|----------|----------|----------------|-----------|-----------------|-----------------|
| **GitHub Releases** | Illimité | 100 GB/mois | **$0** | Soft limit 100GB | ✅ MVP, petits projets |
| **jsDelivr (CDN)** | Via GitHub/NPM | **Illimité** | **$0** | Aucune | ✅ Distribution open source |
| **Cloudflare R2** | $0.015/GB | **$0 egress** | $1.50 (100GB) | 10GB gratuits | ⭐ **RECOMMANDÉ** |
| **AWS S3** | $0.023/GB | $0.09/GB | $9.90 (100GB+egress) | Aucune | ❌ Trop cher |
| **Vercel** | Illimité | 100 GB/mois | **$0** | 100GB gratuit | ✅ Static files |
| **Netlify** | Illimité | 100 GB/mois | **$0** | 100GB gratuit | ✅ Avec CI/CD |
| **Self-hosted** | Dépend serveur | Dépend serveur | $5-20 | Aucune | ⚠️ Si compétences DevOps |

### 🏆 Solution Recommandée : Cloudflare R2

**Pourquoi R2 est parfait pour BigMind :**

| Métrique | Projection An 1 | Projection An 3 | Coût R2 | Coût S3 (comparaison) |
|----------|-----------------|-----------------|---------|------------------------|
| **Plugins hébergés** | 50 | 300 | - | - |
| **Taille moyenne/plugin** | 5 MB | 10 MB | - | - |
| **Stockage total** | 250 MB | 3 GB | $0.045/mois | $0.069/mois |
| **Downloads/mois** | 50,000 | 500,000 | - | - |
| **Bande passante** | 250 GB | 5 TB | **$0** 🎉 | **$450** 💸 |
| **Opérations (reads)** | 2M | 20M | $9/mois | Inclus |
| **TOTAL/mois** | **~$10** | **~$50** | **~$500** |

**Économies An 3 : $450/mois = $5,400/an** 🚀

---

### Pourquoi PAS les autres ?

#### ❌ GitHub Releases
- Limite soft 100 GB/mois (ban possible si dépassé)
- Pas de versioning automatique
- Pas d'analytics (combien de downloads ?)
- Dépendance GitHub (si down, marketplace down)

#### ✅ jsDelivr (complément)
- **À UTILISER en complément de R2**
- Gratuit et illimité pour l'open source
- CDN global ultra-rapide
- Mais nécessite GitHub/NPM en source

#### ❌ AWS S3
- Egress fees = **ruineux** ($0.09/GB)
- Complexité de configuration
- Coûts imprévisibles

---

## 🏗️ Architecture Recommandée pour BigMind

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────┐
│                   BIGMIND ECOSYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐     ┌─────────────────┐          │
│  │  bigmind (mono)  │     │  bigmind-plugins│          │
│  │  github.com      │     │  (separate repo)│          │
│  ├──────────────────┤     ├─────────────────┤          │
│  │ • Core app       │     │ • Plugin sources│          │
│  │ • Plugin SDK     │     │ • Examples      │          │
│  │ • Marketplace UI │     │ • Templates     │          │
│  └────────┬─────────┘     └────────┬────────┘          │
│           │                        │                    │
│           │                        │                    │
│  ┌────────▼────────────────────────▼────────┐          │
│  │     Plugin Registry API (Cloudflare)     │          │
│  │  workers.cloudflare.com/bigmind-registry │          │
│  ├───────────────────────────────────────────┤          │
│  │  • Search & discovery                     │          │
│  │  • Version management                     │          │
│  │  • License validation                     │          │
│  │  • Analytics tracking                     │          │
│  │  • Auto-update checks                     │          │
│  └────────┬──────────────────────────────────┘          │
│           │                                             │
│  ┌────────▼──────────────────────────────┐             │
│  │  Cloudflare R2 Storage                │             │
│  │  (Plugin .zip files)                  │             │
│  ├────────────────────────────────────────┤             │
│  │  plugins/                              │             │
│  │  ├── com.bigmind.teams/                │             │
│  │  │   ├── 1.0.0.zip                     │             │
│  │  │   ├── 1.0.1.zip                     │             │
│  │  │   └── manifest.json                 │             │
│  │  ├── com.bigmind.anki/                 │             │
│  │  │   └── 2.0.0.zip                     │             │
│  │  └── community/                        │             │
│  │      └── com.user.plugin/             │             │
│  └─────────────────────────────────────────┘             │
│                                                          │
│  ┌────────────────────────────────────┐                 │
│  │  jsDelivr CDN (Mirror)             │                 │
│  │  cdn.jsdelivr.net/gh/bigmind-plugins │                │
│  │  (Fallback + Fast global delivery) │                 │
│  └─────────────────────────────────────┘                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Structure des Repositories

#### 📁 Repository Principal : `bigmind`

```
bigmind/
├── apps/
│   ├── web/
│   └── desktop/
├── packages/
│   ├── core/
│   ├── ui/
│   ├── plugin-sdk/           ← SDK pour développeurs
│   ├── plugin-system/        ← Runtime existant
│   ├── plugin-licensing/     ← Nouveau : licensing
│   └── plugin-marketplace/   ← Nouveau : UI marketplace
└── examples/
    └── hello-world-plugin/   ← Exemple de base
```

**Ce qui reste dans le monorepo :**
- ✅ SDK de développement (`@bigmind/plugin-sdk`)
- ✅ Plugin system runtime
- ✅ UI du marketplace (client)
- ✅ 1-2 plugins d'exemple pour les développeurs

---

#### 📁 Repository Séparé : `bigmind-plugins`

```
bigmind-plugins/
├── official/                 ← Plugins officiels BigMind
│   ├── teams-collaboration/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── manifest.json
│   │   └── README.md
│   ├── spaced-repetition/
│   ├── life-dashboard/
│   └── ai-copilot/
├── community/                ← Plugins communautaires (PRs)
│   ├── themes/
│   ├── integrations/
│   └── templates/
├── .github/
│   └── workflows/
│       ├── build-plugin.yml  ← Build automatique
│       ├── publish.yml       ← Publish vers R2
│       └── review.yml        ← Review automatique
└── tools/
    ├── build-plugin.js       ← Script de build
    ├── validate-plugin.js    ← Validation manifest
    └── publish-plugin.js     ← Upload vers R2
```

**Workflow de publication :**

1. Développeur commit dans `bigmind-plugins/official/teams-collaboration/`
2. GitHub Actions déclenché sur push
3. Build automatique → génère `com.bigmind.teams-1.0.0.zip`
4. Validation (manifest, sécurité, tests)
5. Upload vers Cloudflare R2
6. Mise à jour du registry (JSON)
7. Notification aux users (nouveau plugin disponible)

---

### 📡 API du Registry (Cloudflare Workers)

**Endpoints nécessaires :**

| Endpoint | Méthode | Description | Exemple |
|----------|---------|-------------|---------|
| `/api/plugins` | GET | Liste tous les plugins | `?category=productivity` |
| `/api/plugins/:id` | GET | Détails d'un plugin | `/api/plugins/com.bigmind.teams` |
| `/api/plugins/:id/versions` | GET | Versions disponibles | `/api/plugins/com.bigmind.teams/versions` |
| `/api/plugins/:id/download` | GET | Télécharger plugin | `?version=1.0.0` |
| `/api/plugins/search` | GET | Recherche | `?q=anki&category=productivity` |
| `/api/plugins/featured` | GET | Plugins mis en avant | - |
| `/api/plugins/updates` | POST | Check updates | Body: `{installed: [...]}` |
| `/api/plugins/publish` | POST | Publier (authentifié) | Body: plugin data |
| `/api/analytics/:id` | POST | Track download/install | Body: `{event, version}` |

**Format de réponse `/api/plugins` :**

```json
{
  "total": 150,
  "plugins": [
    {
      "id": "com.bigmind.teams",
      "name": "Teams Collaboration",
      "version": "1.0.2",
      "description": "Real-time collaboration for teams",
      "author": "BigMind Team",
      "pricing": "freemium",
      "category": "productivity",
      "downloads": 12450,
      "rating": 4.8,
      "icon": "https://r2.bigmind.dev/icons/teams.svg",
      "verified": true,
      "updatedAt": "2025-10-15T10:00:00Z",
      "downloadUrl": "https://r2.bigmind.dev/plugins/com.bigmind.teams/1.0.2.zip",
      "size": 5242880
    }
  ]
}
```

---

### 💾 Stockage sur Cloudflare R2

**Structure des fichiers :**

```
r2://bigmind-plugins/
├── registry.json              ← Index de tous les plugins
├── featured.json              ← Plugins mis en avant
├── categories.json            ← Catégories disponibles
├── plugins/
│   ├── com.bigmind.teams/
│   │   ├── manifest.json      ← Metadata
│   │   ├── 1.0.0.zip
│   │   ├── 1.0.1.zip
│   │   ├── 1.0.2.zip          ← Latest
│   │   ├── icon.svg
│   │   ├── banner.png
│   │   └── screenshots/
│   │       ├── 1.png
│   │       └── 2.png
│   └── com.community.myplugin/
│       └── 1.0.0.zip
└── stats/
    └── 2025-10/
        └── downloads.json     ← Analytics
```

**`registry.json` (auto-généré) :**

```json
{
  "version": "1.0",
  "updatedAt": "2025-10-29T12:00:00Z",
  "plugins": {
    "com.bigmind.teams": {
      "latest": "1.0.2",
      "versions": ["1.0.0", "1.0.1", "1.0.2"],
      "category": "productivity",
      "verified": true
    }
  }
}
```

---

## 🛠️ Implémentation Technique

### Phase 1 : Registry API (Cloudflare Workers)

Créez `packages/plugin-registry-api/` :

```typescript
// packages/plugin-registry-api/src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route: GET /api/plugins
    if (url.pathname === '/api/plugins') {
      return handleListPlugins(env);
    }

    // Route: GET /api/plugins/:id
    if (url.pathname.startsWith('/api/plugins/') && !url.pathname.includes('/download')) {
      const pluginId = url.pathname.split('/')[3];
      return handleGetPlugin(pluginId, env);
    }

    // Route: GET /api/plugins/:id/download
    if (url.pathname.endsWith('/download')) {
      const pluginId = url.pathname.split('/')[3];
      const version = url.searchParams.get('version');
      return handleDownload(pluginId, version, env);
    }

    // Route: POST /api/plugins/updates
    if (url.pathname === '/api/plugins/updates' && request.method === 'POST') {
      const body = await request.json();
      return handleCheckUpdates(body, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function handleListPlugins(env: Env): Promise<Response> {
  // Lire registry.json depuis R2
  const registry = await env.R2.get('registry.json');
  const data = await registry.json();

  return Response.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300' // Cache 5min
    }
  });
}

async function handleDownload(
  pluginId: string,
  version: string | null,
  env: Env
): Promise<Response> {
  // Get manifest to find latest version
  const manifestKey = `plugins/${pluginId}/manifest.json`;
  const manifest = await env.R2.get(manifestKey);

  if (!manifest) {
    return new Response('Plugin not found', { status: 404 });
  }

  const data = await manifest.json();
  const targetVersion = version || data.version;

  // Get zip file
  const zipKey = `plugins/${pluginId}/${targetVersion}.zip`;
  const zipFile = await env.R2.get(zipKey);

  if (!zipFile) {
    return new Response('Version not found', { status: 404 });
  }

  // Track download (analytics)
  await trackDownload(pluginId, targetVersion, env);

  return new Response(zipFile.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${pluginId}-${targetVersion}.zip"`,
      'Cache-Control': 'public, max-age=31536000' // Cache 1 an (immutable)
    }
  });
}

async function handleCheckUpdates(
  installed: Array<{id: string, version: string}>,
  env: Env
): Promise<Response> {
  const updates = [];

  for (const plugin of installed) {
    const manifest = await env.R2.get(`plugins/${plugin.id}/manifest.json`);
    if (!manifest) continue;

    const data = await manifest.json();

    // Compare versions (simplistic, use semver in production)
    if (data.version !== plugin.version) {
      updates.push({
        id: plugin.id,
        currentVersion: plugin.version,
        latestVersion: data.version,
        downloadUrl: `/api/plugins/${plugin.id}/download?version=${data.version}`
      });
    }
  }

  return Response.json({ updates });
}

async function trackDownload(
  pluginId: string,
  version: string,
  env: Env
): Promise<void> {
  // Option 1: Cloudflare Analytics Engine (gratuit)
  if (env.ANALYTICS) {
    env.ANALYTICS.writeDataPoint({
      indexes: [pluginId, version],
      blobs: ['download'],
      doubles: [1]
    });
  }

  // Option 2: Simple counter dans R2
  const statsKey = `stats/${new Date().toISOString().slice(0, 7)}/downloads.json`;
  const stats = await env.R2.get(statsKey);
  const data = stats ? await stats.json() : {};

  data[pluginId] = (data[pluginId] || 0) + 1;

  await env.R2.put(statsKey, JSON.stringify(data));
}
```

**Déploiement Cloudflare Workers :**

```bash
# wrangler.toml
name = "bigmind-registry"
main = "src/index.ts"
compatibility_date = "2025-10-29"

[[r2_buckets]]
binding = "R2"
bucket_name = "bigmind-plugins"

[[analytics_engine_datasets]]
binding = "ANALYTICS"
```

```bash
npm install -g wrangler
wrangler login
wrangler publish
# URL: https://bigmind-registry.workers.dev
```

**Coût Cloudflare Workers :**
- Gratuit jusqu'à 100,000 requêtes/jour
- $5/mois pour 10M requêtes (largement suffisant An 1-3)

---

### Phase 2 : Client Marketplace (dans votre monorepo)

Modifiez `packages/plugin-marketplace/src/PluginStore.ts` :

```typescript
// packages/plugin-marketplace/src/PluginStore.ts
export class PluginStore {
  private registryUrl = 'https://bigmind-registry.workers.dev/api';

  /**
   * Fetch all plugins from registry
   */
  async fetchPlugins(filters?: {
    category?: string;
    search?: string;
    featured?: boolean;
  }): Promise<PluginListing[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.search) params.set('q', filters.search);

    const url = filters?.featured
      ? `${this.registryUrl}/plugins/featured`
      : `${this.registryUrl}/plugins?${params}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.plugins;
  }

  /**
   * Download and install a plugin
   */
  async installPlugin(pluginId: string, version?: string): Promise<void> {
    // 1. Download ZIP from registry
    const url = `${this.registryUrl}/plugins/${pluginId}/download${version ? `?version=${version}` : ''}`;

    const response = await fetch(url);
    const zipBlob = await response.blob();

    // 2. Extract ZIP
    const zip = await JSZip.loadAsync(zipBlob);

    // 3. Validate manifest
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Invalid plugin: missing manifest.json');
    }

    const manifest = JSON.parse(await manifestFile.async('text'));

    // 4. Security checks
    await this.validatePlugin(manifest, zip);

    // 5. Extract plugin code
    const pluginCode = await zip.file('index.js').async('text');

    // 6. Load plugin dynamically
    const Plugin = await this.loadPluginFromCode(pluginCode);

    // 7. Register with PluginRegistry
    await pluginRegistry.register(new Plugin());

    // 8. Save to local storage (for persistence)
    await this.saveInstalledPlugin(pluginId, version, manifest);

    console.log(`✅ Installed ${pluginId} v${version}`);
  }

  /**
   * Check for plugin updates
   */
  async checkUpdates(): Promise<UpdateInfo[]> {
    const installed = await this.getInstalledPlugins();

    const response = await fetch(`${this.registryUrl}/plugins/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ installed })
    });

    const data = await response.json();
    return data.updates;
  }

  /**
   * Load plugin from code string (using eval in sandbox)
   */
  private async loadPluginFromCode(code: string): Promise<any> {
    // Option 1: Web Worker (secure)
    const worker = new Worker(URL.createObjectURL(new Blob([code])));

    // Option 2: Dynamic import (requires build step)
    const dataUrl = `data:text/javascript;base64,${btoa(code)}`;
    return await import(/* @vite-ignore */ dataUrl);

    // Option 3: Eval (⚠️ moins sécurisé, uniquement si sandboxed)
    // return new Function(`return ${code}`)();
  }
}
```

---

### Phase 3 : CLI de Publication (pour développeurs)

Créez `packages/plugin-cli/` :

```bash
# Usage
npx @bigmind/plugin-cli publish

# Ou
bigmind-plugin publish --plugin ./my-plugin
```

```typescript
// packages/plugin-cli/src/publish.ts
import { R2Client } from '@cloudflare/workers-sdk';
import JSZip from 'jszip';
import fs from 'fs';

export async function publishPlugin(pluginPath: string) {
  // 1. Validate manifest
  const manifest = JSON.parse(fs.readFileSync(`${pluginPath}/manifest.json`, 'utf-8'));
  const validation = validateManifest(manifest);

  if (!validation.valid) {
    console.error('❌ Invalid manifest:', validation.errors);
    process.exit(1);
  }

  // 2. Build plugin
  console.log('📦 Building plugin...');
  await buildPlugin(pluginPath);

  // 3. Create ZIP
  const zip = new JSZip();
  const files = fs.readdirSync(`${pluginPath}/dist`);

  files.forEach(file => {
    zip.file(file, fs.readFileSync(`${pluginPath}/dist/${file}`));
  });

  zip.file('manifest.json', JSON.stringify(manifest));

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  // 4. Upload to R2
  console.log('☁️  Uploading to Cloudflare R2...');

  const r2 = new R2Client({
    accountId: process.env.CF_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  });

  const key = `plugins/${manifest.id}/${manifest.version}.zip`;
  await r2.putObject('bigmind-plugins', key, zipBuffer);

  // 5. Update manifest in R2
  await r2.putObject(
    'bigmind-plugins',
    `plugins/${manifest.id}/manifest.json`,
    JSON.stringify(manifest)
  );

  // 6. Update registry.json
  await updateRegistry(manifest);

  console.log(`✅ Published ${manifest.id} v${manifest.version}`);
  console.log(`📥 Download: https://r2.bigmind.dev/plugins/${manifest.id}/${manifest.version}.zip`);
}
```

---

## 🎛️ Modèle de Contrôle

### Comparaison des Approches

| Modèle | Exemples | Avantages | Inconvénients | Recommandé ? |
|--------|----------|-----------|---------------|--------------|
| **Fermé (App Store)** | Apple, Microsoft Store | Très sécurisé, qualité | Lent, arbitraire, coûteux | ❌ Non |
| **Ouvert (NPM)** | NPM, GitHub | Rapide, flexible | Spam, malware, faible qualité | ⚠️ Trop risqué |
| **Hybride (WordPress)** | WordPress.org | Équilibre confiance/vitesse | Review queue 7-14j | ✅ **Oui** |
| **Verified (VS Code)** | VS Code Marketplace | Rapide + badges verified | Complexe à mettre en place | ⭐ **Idéal** |

---

### 🏆 Modèle Recommandé : **Verified Hybrid**

**Principe :**

```
┌─────────────────────────────────────────────┐
│         BIGMIND PLUGIN MARKETPLACE          │
├─────────────────────────────────────────────┤
│                                             │
│  🟢 VERIFIED (Official + Top Community)     │
│  ├── Plugins BigMind officiels              │
│  ├── Top contributeurs (>10 PRs)            │
│  ├── Review manuelle initiale               │
│  └── Badge ✓ "Verified"                     │
│                                             │
│  🟡 COMMUNITY (Review automatique)          │
│  ├── Plugins communautaires                 │
│  ├── Scan malware automatique               │
│  ├── Tests automatiques                     │
│  └── Peut devenir Verified (promotions)     │
│                                             │
│  🔴 UNLISTED (Privés / En développement)    │
│  ├── Installable via URL directe           │
│  ├── Pas dans le marketplace public         │
│  └── Pour entreprises/tests                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Workflow de Publication

#### A) Plugins VERIFIED (officiels)

1. Développeur commit dans `bigmind-plugins/official/`
2. GitHub Actions → build automatique
3. Tests automatiques (unit, security scan)
4. **Review manuelle** par core team (1-2 jours)
5. Approval → publish vers R2 avec badge ✓
6. Notification users marketplace

**Critères Verified :**
- ✅ Code open source
- ✅ Tests coverage >80%
- ✅ Documentation complète
- ✅ Maintenu activement (updates <3 mois)
- ✅ Pas de télémétrie non-divulguée
- ✅ Compatible dernière version BigMind

---

#### B) Plugins COMMUNITY

1. Développeur fork `bigmind-plugins`
2. Crée plugin dans `community/`
3. Submit PR
4. **GitHub Actions automatique :**
   - Validation manifest
   - Tests de sécurité (virus scan, code analysis)
   - Build test
   - Check license (doit être open source)
5. Auto-merge si tous les checks passent ✅
6. Publish vers R2 catégorie "Community"
7. Peut obtenir badge "Verified" après :
   - 100+ installs
   - Rating >4.0
   - Aucun incident sécurité
   - Review manuelle approuvée

---

#### C) Plugins UNLISTED (privés)

1. Développeur héberge sur son serveur
2. Utilisateurs installent via URL :
   ```
   bigmind-plugin install https://monsite.com/plugin.zip
   ```
3. Pas de validation (⚠️ warning utilisateur)
4. Utile pour :
   - Plugins d'entreprise internes
   - Beta testing privé
   - Plugins payants auto-hébergés

---

### Sécurité & Review Automatique

**Checks automatiques GitHub Actions :**

```yaml
# .github/workflows/review-plugin.yml
name: Review Community Plugin

on:
  pull_request:
    paths:
      - 'community/**'

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Scan for malware
        uses: github/codeql-action/analyze@v2

      - name: Check for eval() / dangerous code
        run: |
          if grep -r "eval(" community/; then
            echo "❌ eval() detected"
            exit 1
          fi

      - name: Validate manifest
        run: node tools/validate-plugin.js ${{ github.event.pull_request.head.ref }}

      - name: Check license
        run: |
          # Must be MIT, GPL, AGPL, Apache
          node tools/check-license.js

      - name: Run tests
        run: |
          cd community/$PLUGIN_NAME
          npm test

      - name: Build plugin
        run: node tools/build-plugin.js

      - name: Size check (<10MB)
        run: |
          SIZE=$(du -sm dist/*.zip | cut -f1)
          if [ $SIZE -gt 10 ]; then
            echo "❌ Plugin too large: ${SIZE}MB (max 10MB)"
            exit 1
          fi
```

---

## 🗺️ Roadmap de Migration

### Timeline : 6 semaines

#### **Semaine 1-2 : Infrastructure**

- [ ] Créer compte Cloudflare (gratuit)
- [ ] Setup R2 bucket `bigmind-plugins`
- [ ] Développer Registry API (Cloudflare Worker)
- [ ] Déployer API sur `bigmind-registry.workers.dev`
- [ ] Tester upload/download manuel

**Livrable :** API fonctionnelle pour list/download plugins

---

#### **Semaine 3 : Client Marketplace**

- [ ] Créer `packages/plugin-marketplace/` dans monorepo
- [ ] UI de listing plugins (React)
- [ ] Fonction `installPlugin()` avec download + extraction
- [ ] Auto-update checker
- [ ] Tests E2E

**Livrable :** Users peuvent browse + installer plugins depuis UI

---

#### **Semaine 4 : Repository Séparé**

- [ ] Créer repo `bigmind-plugins` (public)
- [ ] Migrer exemple plugins vers `official/`
- [ ] Setup GitHub Actions (build, security, publish)
- [ ] Documentation pour contributeurs
- [ ] Template plugin avec CLI `create-bigmind-plugin`

**Livrable :** Développeurs peuvent publier facilement

---

#### **Semaine 5 : Premium & Licensing**

- [ ] Intégrer `LicenseManager` dans download flow
- [ ] API endpoint `/api/plugins/:id/verify-license`
- [ ] UI d'activation de licence
- [ ] Système de trial (14 jours)
- [ ] Tableau de bord développeur (revenues, stats)

**Livrable :** Plugins payants fonctionnels

---

#### **Semaine 6 : Polish & Launch**

- [ ] Analytics (downloads, installs, ratings)
- [ ] Search amélioré (Algolia ou MeiliSearch)
- [ ] Featured plugins (curation)
- [ ] Email notifications (nouveaux plugins)
- [ ] Blog post "Introducing BigMind Marketplace"
- [ ] Submit to Product Hunt

**Livrable :** Marketplace public lancé 🚀

---

## 💵 Coûts Totaux Estimés

### An 1 (90k users, 50 plugins)

| Service | Utilisation | Coût/mois | Coût/an |
|---------|-------------|-----------|---------|
| **Cloudflare R2** | 250 MB storage, 250 GB bandwidth | $10 | $120 |
| **Cloudflare Workers** | 500k requêtes/mois | Gratuit | $0 |
| **GitHub** | Public repos | Gratuit | $0 |
| **jsDelivr CDN** | Bandwidth illimité | Gratuit | $0 |
| **Domain** | bigmind.dev | $12/an | $12 |
| **Total** | - | **$10/mois** | **$132/an** |

### An 3 (500k users, 300 plugins)

| Service | Utilisation | Coût/mois | Coût/an |
|---------|-------------|-----------|---------|
| **Cloudflare R2** | 3 GB storage, 5 TB bandwidth | $50 | $600 |
| **Cloudflare Workers** | 5M requêtes/mois | $5 | $60 |
| **MeiliSearch Cloud** | Search engine (optionnel) | $29 | $348 |
| **Total** | - | **$84/mois** | **$1,008/an** |

**ROI :** Si vous générez $380k An 1 (projection), $1k/an d'infrastructure = **0.26%** des revenus 🎉

---

## ✅ Checklist de Démarrage

### MVP (2 semaines)

- [ ] Créer bucket Cloudflare R2
- [ ] Déployer Registry API (Cloudflare Worker)
- [ ] UI marketplace basique dans `apps/web`
- [ ] Fonction `installPlugin()` fonctionnelle
- [ ] 3 plugins de test publiés

### Production (6 semaines)

- [ ] Repository `bigmind-plugins` public
- [ ] GitHub Actions (build + publish)
- [ ] Security scans automatiques
- [ ] Licensing intégré
- [ ] Analytics dashboard
- [ ] Documentation complète

---

## 🎯 Conclusion

### Réponses à vos questions :

| Question | Réponse |
|----------|---------|
| **Faut-il un autre repo ?** | ✅ Oui, `bigmind-plugins` séparé |
| **Comment héberger ?** | ⭐ Cloudflare R2 (0$ egress, $10/mois) |
| **Est-ce payant ?** | 💰 $10-50/mois (quasi-gratuit) |
| **App Store ou WordPress ?** | 🏆 Hybride : Verified (officiel) + Community (ouvert) |
| **Bonnes pratiques ?** | ✅ Security scans auto, versioning semver, CDN multi-région |

### L'architecture recommandée :

```
┌─────────────────────────────────────────────┐
│  Repository: bigmind (monorepo)             │
│  → Plugin SDK + Marketplace UI              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Repository: bigmind-plugins (séparé)       │
│  → Plugin sources + GitHub Actions          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Cloudflare Workers: Registry API           │
│  → List, search, download, updates          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Cloudflare R2: Plugin storage              │
│  → .zip files, manifests, assets            │
│  → $0 egress, $0.015/GB storage             │
└─────────────────────────────────────────────┘
```

**Coût total : ~$10-50/mois pour 500k users** 🚀

---

Voulez-vous que je :
1. **Implémente le Registry API** (Cloudflare Worker) ?
2. **Crée le client Marketplace** (UI React) ?
3. **Setup le repo `bigmind-plugins`** avec GitHub Actions ?
4. **Développe le CLI de publication** pour développeurs ?

**Créé le :** 2025-10-29
**Version :** 1.0
