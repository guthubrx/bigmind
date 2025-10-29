# 🚀 Quick Start - Déploiement en 5 Minutes

## Étape 1: Déployer sur GitHub (1 min)

```bash
cd /home/user/bigmind
./deploy-bigmind-plugins.sh
```

✅ Appuyez sur `y` quand demandé pour confirmer le push

---

## Étape 2: Configurer Cloudflare R2 (2 min)

1. Aller sur https://dash.cloudflare.com/
2. **R2 Object Storage** → **Create bucket** → Nom: `bigmind-plugins`
3. **Settings** → **R2 API tokens** → **Create API token**
   - Name: `bigmind-plugins-ci`
   - Permissions: **Object Read & Write**
   - Bucket: `bigmind-plugins`
4. **Copier et sauvegarder**:
   - Access Key ID
   - Secret Access Key
   - Account ID

---

## Étape 3: GitHub Secrets (1 min)

Aller sur: https://github.com/guthubrx/bigmind-plugins/settings/secrets/actions

Ajouter ces 5 secrets (copier/coller depuis Cloudflare):

```
CLOUDFLARE_ACCOUNT_ID = [Votre Account ID]
CLOUDFLARE_API_TOKEN = [Votre API Token]
R2_ACCESS_KEY_ID = [Votre Access Key ID]
R2_SECRET_ACCESS_KEY = [Votre Secret Access Key]
R2_BUCKET_NAME = bigmind-plugins
```

---

## Étape 4: Déployer Registry API (1 min)

```bash
# Installer Wrangler
npm install -g wrangler

# Login
wrangler login

# Créer le projet
cd ~/
mkdir bigmind-registry && cd bigmind-registry
```

Créer `wrangler.toml`:

```toml
name = "bigmind-registry"
main = "worker.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "bigmind-plugins"
```

Copier le fichier `worker.js` depuis DEPLOYMENT_GUIDE.md

```bash
# Déployer
wrangler deploy
```

**Copier l'URL retournée** (ex: `https://bigmind-registry.xxx.workers.dev`)

---

## Étape 5: Configurer BigMind App

Dans `/home/user/bigmind/.env`:

```bash
VITE_MARKETPLACE_URL=https://bigmind-registry.xxx.workers.dev
```

Remplacer `xxx` par votre URL Worker.

---

## ✅ C'est Fait !

### Tester:

```bash
cd /home/user/bigmind
pnpm dev
```

Ouvrir: http://localhost:3000 → Plugins → **Remote** tab

Vous devriez voir le plugin "Hello World" disponible à l'installation!

---

## 🎯 Pour Ajouter un Plugin

```bash
cd ~/bigmind-plugins-deploy
git checkout -b add-my-plugin

# Créer votre plugin dans official/my-plugin/
# Avec manifest.json et index.js

git add official/my-plugin
git commit -m "Add my plugin"
git push origin add-my-plugin
```

Créer la Pull Request sur GitHub → Auto validation → Merge → Auto publish! 🎉

---

## 📖 Documentation Complète

Voir `DEPLOYMENT_GUIDE.md` pour tous les détails.
