# 🚀 Guide de Déploiement - BigMind Plugins Marketplace

## 📦 Étape 1: Déployer le Repository GitHub

### Exécuter le script de déploiement

```bash
cd /home/user/bigmind
./deploy-bigmind-plugins.sh
```

Ce script va:
1. ✅ Cloner `https://github.com/guthubrx/bigmind-plugins`
2. ✅ Copier tous les fichiers depuis `/tmp/bigmind-plugins`
3. ✅ Commit et push vers GitHub
4. ✅ Vérifier que tout est déployé correctement

---

## ☁️ Étape 2: Configurer Cloudflare R2 & Workers

### 2.1 Créer un Bucket R2

1. Aller sur https://dash.cloudflare.com/
2. Sélectionner votre compte
3. Aller dans **R2 Object Storage**
4. Cliquer **Create bucket**
   - Name: `bigmind-plugins`
   - Location: Automatic
   - Storage class: Standard
5. Cliquer **Create bucket**

### 2.2 Obtenir les credentials R2

1. Dans R2, aller dans **Settings** → **R2 API tokens**
2. Cliquer **Create API token**
   - Token name: `bigmind-plugins-ci`
   - Permissions: **Object Read & Write**
   - Bucket: `bigmind-plugins`
3. **IMPORTANT**: Copier et sauvegarder:
   - Access Key ID
   - Secret Access Key
   - Bucket name: `bigmind-plugins`
   - Account ID (visible dans l'URL du dashboard)

### 2.3 Configurer Public Access (optionnel)

Pour permettre le téléchargement public des plugins:

1. Dans le bucket `bigmind-plugins`
2. Aller dans **Settings** → **Public access**
3. Activer **Allow public access**
4. Copier l'URL publique: `https://pub-xxxxx.r2.dev`

---

## 🔐 Étape 3: Configurer GitHub Secrets

Aller sur https://github.com/guthubrx/bigmind-plugins/settings/secrets/actions

Ajouter ces secrets:

| Secret Name | Description | Où le trouver |
|-------------|-------------|---------------|
| `CLOUDFLARE_ACCOUNT_ID` | ID de compte Cloudflare | Dashboard Cloudflare URL |
| `CLOUDFLARE_API_TOKEN` | Token API R2 | Créé à l'étape 2.2 |
| `R2_ACCESS_KEY_ID` | R2 Access Key | Créé à l'étape 2.2 |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key | Créé à l'étape 2.2 |
| `R2_BUCKET_NAME` | Nom du bucket | `bigmind-plugins` |

### Comment ajouter un secret:

1. Cliquer **New repository secret**
2. Name: `CLOUDFLARE_ACCOUNT_ID`
3. Secret: Coller la valeur
4. Cliquer **Add secret**
5. Répéter pour chaque secret

---

## 🔧 Étape 4: Déployer Cloudflare Worker (Registry API)

### 4.1 Créer le Worker

Créer un fichier `registry-api/worker.js`:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /api/plugins - List all plugins
    if (url.pathname === '/api/plugins') {
      try {
        const registry = await env.R2_BUCKET.get('registry.json');
        if (!registry) {
          return new Response(JSON.stringify({ plugins: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const data = await registry.text();
        return new Response(data, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /api/plugins/:id - Get specific plugin
    const pluginMatch = url.pathname.match(/^\/api\/plugins\/([^\/]+)$/);
    if (pluginMatch) {
      const pluginId = pluginMatch[1];
      try {
        const registry = await env.R2_BUCKET.get('registry.json');
        if (!registry) {
          return new Response(JSON.stringify({ error: 'Plugin not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const data = JSON.parse(await registry.text());
        const plugin = data.plugins.find(p => p.id === pluginId);
        if (!plugin) {
          return new Response(JSON.stringify({ error: 'Plugin not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(plugin), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // GET /api/plugins/:id/download - Download plugin ZIP
    const downloadMatch = url.pathname.match(/^\/api\/plugins\/([^\/]+)\/download$/);
    if (downloadMatch) {
      const pluginId = downloadMatch[1];
      const version = url.searchParams.get('version') || 'latest';

      try {
        // Get plugin info from registry
        const registry = await env.R2_BUCKET.get('registry.json');
        if (!registry) {
          return new Response('Plugin not found', { status: 404 });
        }
        const data = JSON.parse(await registry.text());
        const plugin = data.plugins.find(p => p.id === pluginId);
        if (!plugin) {
          return new Response('Plugin not found', { status: 404 });
        }

        // Determine version to download
        const targetVersion = version === 'latest' ? plugin.version : version;
        const zipPath = `plugins/${pluginId}/${pluginId}-${targetVersion}.zip`;

        // Get ZIP file from R2
        const zipFile = await env.R2_BUCKET.get(zipPath);
        if (!zipFile) {
          return new Response('Plugin ZIP not found', { status: 404 });
        }

        return new Response(zipFile.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${pluginId}-${targetVersion}.zip"`
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
```

### 4.2 Créer `wrangler.toml`:

```toml
name = "bigmind-registry"
main = "worker.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "bigmind-plugins"
```

### 4.3 Déployer le Worker:

```bash
# Installer Wrangler CLI
npm install -g wrangler

# Login Cloudflare
wrangler login

# Déployer
wrangler deploy
```

Copier l'URL du Worker déployé (ex: `https://bigmind-registry.xxx.workers.dev`)

---

## 🔗 Étape 5: Connecter BigMind App au Registry

### 5.1 Mettre à jour la configuration

Dans le monorepo `bigmind`, créer/modifier `.env`:

```bash
# .env
VITE_MARKETPLACE_URL=https://bigmind-registry.xxx.workers.dev
```

### 5.2 Tester l'intégration

```bash
cd /home/user/bigmind
pnpm install
pnpm dev
```

Ouvrir http://localhost:3000 → Plugins → Remote tab

---

## ✅ Étape 6: Tester le Pipeline Complet

### 6.1 Créer un nouveau plugin

```bash
cd ~/bigmind-plugins-deploy
mkdir -p official/test-plugin
cd official/test-plugin
```

Créer `manifest.json`:

```json
{
  "id": "com.bigmind.test",
  "name": "Test Plugin",
  "version": "1.0.0",
  "description": "Plugin de test",
  "author": {
    "name": "BigMind Team",
    "email": "team@bigmind.com"
  },
  "main": "./index.js",
  "permissions": ["mindmap:read"],
  "category": "developer",
  "pricing": "free",
  "bigmind": "^1.0.0"
}
```

Créer `index.js`:

```javascript
export default class TestPlugin {
  async activate(context) {
    console.log('Test plugin activated!');
  }

  async deactivate() {
    console.log('Test plugin deactivated');
  }
}
```

### 6.2 Créer une Pull Request

```bash
git checkout -b add-test-plugin
git add official/test-plugin
git commit -m "Add test plugin"
git push origin add-test-plugin
```

Sur GitHub:
1. Créer une Pull Request
2. Vérifier que le workflow **Validate Plugin** s'exécute ✅
3. Si validé, merger vers `main`
4. Vérifier que le workflow **Publish Plugin** s'exécute ✅
5. Vérifier dans R2 que le fichier `plugins/com.bigmind.test/com.bigmind.test-1.0.0.zip` existe

### 6.3 Installer depuis BigMind App

1. Ouvrir BigMind → Plugins → Remote tab
2. Chercher "Test Plugin"
3. Cliquer **Install**
4. Vérifier qu'il apparaît dans Local tab
5. Activer le plugin
6. Vérifier dans la console: "Test plugin activated!"

---

## 📊 Coûts Estimés

| Service | Coût Mensuel | Notes |
|---------|--------------|-------|
| Cloudflare R2 | $0.015/GB stockage | ~$1-5 pour 100-300 plugins |
| Cloudflare Workers | Free tier | 100k requêtes/jour gratuit |
| GitHub Actions | Free tier | 2000 min/mois gratuit |
| **TOTAL** | **~$1-10/mois** | Vs $500+ avec AWS S3 |

---

## 🎯 Prochaines Améliorations

1. **Authentification**: Ajouter auth pour plugins payants
2. **Analytics**: Tracking des téléchargements/installations
3. **CDN**: Cloudflare CDN pour accélérer downloads
4. **Webhook**: Notifier Discord/Slack des nouvelles publications
5. **Review System**: Note et commentaires utilisateurs
6. **Auto-update**: Vérification automatique des mises à jour
7. **Plugin Store UI**: Interface web pour parcourir les plugins

---

## 🆘 Troubleshooting

### Erreur: "Plugin ZIP not found"
- Vérifier que le workflow `publish-plugin.yml` s'est bien exécuté
- Vérifier dans R2 que le fichier ZIP existe
- Vérifier que `registry.json` est à jour

### Erreur: "Failed to download plugin"
- Vérifier que le Worker est déployé
- Vérifier CORS dans le Worker
- Vérifier l'URL du registry dans `.env`

### Workflow GitHub Actions échoue
- Vérifier les GitHub Secrets
- Vérifier les permissions du token API Cloudflare
- Consulter les logs dans l'onglet Actions

---

## 📚 Documentation Complète

- **Repository Plugins**: https://github.com/guthubrx/bigmind-plugins
- **Repository Main**: https://github.com/guthubrx/bigmind
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/

---

**Questions? Besoin d'aide?**

Créer une issue sur: https://github.com/guthubrx/bigmind-plugins/issues
