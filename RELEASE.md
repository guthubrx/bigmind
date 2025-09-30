# 🚀 BigMind Releases

## Comment créer une release

### 1. Release automatique (recommandé)

Les releases sont créées automatiquement via GitHub Actions quand vous poussez sur la branche `main` avec des commits qui suivent le format [Conventional Commits](https://www.conventionalcommits.org/).

**Types de commits qui déclenchent une release :**

- `feat:` → Version mineure (0.1.0 → 0.2.0)
- `fix:` → Version patch (0.1.0 → 0.1.1)
- `BREAKING CHANGE:` → Version majeure (0.1.0 → 1.0.0)

**Exemple :**

```bash
git commit -m "feat: add dark mode support"
git push origin main
# → Crée automatiquement la release v0.2.0
```

### 2. Release manuelle

Si vous voulez créer une release manuellement :

```bash
# 1. Mettre à jour la version
pnpm version:patch  # ou :minor, :major

# 2. Build et créer la release
pnpm release:manual
```

### 3. Release locale (pour test)

```bash
# Build l'application
pnpm build
pnpm build:desktop

# Créer une release locale
gh release create v0.1.0 --title "BigMind v0.1.0" --notes "Release notes ici"
```

## 📦 Assets inclus dans chaque release

- **macOS** : `BigMind.app.zip` (Apple Silicon + Intel)
- **Windows** : `BigMind_0.1.0_x64_en-US.msi`
- **Linux** :
  - `BigMind_0.1.0_amd64.deb` (Debian/Ubuntu)
  - `BigMind-0.1.0-x86_64.AppImage` (Portable)

## 🔧 Configuration

### Semantic Release

- Configuration : `.releaserc`
- Génère automatiquement le CHANGELOG.md
- Met à jour package.json avec la nouvelle version

### GitHub Actions

- Workflow : `.github/workflows/release.yml`
- Build sur macOS, Windows, Linux
- Upload automatique des binaires

### Tauri

- Configuration : `apps/desktop/src-tauri/tauri.conf.json`
- Identifiant : `com.bigmind.app`
- Icônes : `apps/desktop/src-tauri/icons/`

## 📋 Checklist avant release

- [ ] Tests passent : `pnpm test`
- [ ] Lint OK : `pnpm lint`
- [ ] Build OK : `pnpm build`
- [ ] Desktop build OK : `pnpm build:desktop`
- [ ] Changelog à jour
- [ ] Version bumpé si nécessaire

## 🐛 Dépannage

### Erreur de build Tauri

```bash
# Nettoyer le cache
cd apps/desktop
cargo clean
pnpm build
```

### Erreur de permissions GitHub

Vérifiez que le token `GITHUB_TOKEN` a les permissions :

- `repo` (full control)
- `write:packages`
- `actions:write`
