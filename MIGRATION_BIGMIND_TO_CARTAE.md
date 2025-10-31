# 🔄 Plan de Migration : Cartae → Cartae

**Date :** 31 Octobre 2025
**Raison :** Changement de nom de domaine
**Statut :** 📋 PLANIFICATION

---

## 📊 Analyse de l'Étendue

### Repos GitHub à Renommer
1. `guthubrx/cartae` → `guthubrx/cartae`
2. `guthubrx/cartae-private` → `guthubrx/cartae-private`
3. `guthubrx/cartae-plugins` → `guthubrx/cartae-plugins`

### Scopes NPM à Changer
- `@cartae/*` → `@cartae/*`
  - `@cartae/core`
  - `@cartae/ui`
  - `@cartae/design`
  - `@cartae/plugin-system`
  - `@cartae/plugin-sdk`
  - `@cartae/plugin-marketplace`
- `@cartae-private/shared` → `@cartae-private/shared`

### Plugin IDs à Changer
- `com.cartae.*` → `com.cartae.*`
- Exemple : `com.cartae.admin-panel` → `com.cartae.admin-panel`

### Noms d'Applications
- `cartae-web` → `cartae-web`
- `cartae-desktop` → `cartae-desktop`

### Chemins de Fichiers
- `/Users/moi/Nextcloud/10.Scripts/cartae/cartae` → `/Users/moi/Nextcloud/10.Scripts/cartae/cartae`
- Tous les chemins absolus dans la config

### Bases de Données / Services
- Projet Supabase : `Cartae` → `Cartae` (ou garder pour éviter re-création ?)
- Edge Functions : routes OK, mais logs/noms à mettre à jour
- GitHub OAuth App : Nom à mettre à jour

### UI / Documentation
- Tous les titres "Cartae"
- Logos / Branding
- Messages utilisateur
- Documentation markdown
- Commentaires de code

---

## 🎯 Stratégie de Migration

### Option A : Migration Complète Immédiate (RECOMMANDÉ)
**Durée :** 2-3 heures
**Risque :** Moyen (breaking changes pendant migration)
**Avantages :**
- Migration propre et complète
- Pas de code legacy
- Cohérence totale

### Option B : Migration Progressive
**Durée :** 1-2 semaines
**Risque :** Faible
**Avantages :**
- Testable par étapes
- Rollback possible
**Inconvénients :**
- Code mixte Cartae/Cartae pendant transition
- Plus complexe à gérer

---

## 📋 Plan de Migration (Option A)

### Phase 1 : Préparation (30 min)
- [ ] Créer une branche `migration/cartae-to-cartae`
- [ ] Sauvegarder l'état actuel (git tag `pre-cartae-migration`)
- [ ] Documenter tous les services externes (GitHub OAuth, Supabase, etc.)
- [ ] Préparer liste complète des fichiers à modifier

### Phase 2 : Migration Locale (1h)
#### 2.1 Renommer les Packages
- [ ] `package.json` root : `"name": "cartae"` → `"name": "cartae"`
- [ ] `apps/web/package.json` : `cartae-web` → `cartae-web`
- [ ] `apps/desktop/package.json` : `cartae-desktop` → `cartae-desktop`
- [ ] `packages/*/package.json` : `@cartae/*` → `@cartae/*`

#### 2.2 Mettre à Jour les Imports
- [ ] Remplacer tous les `import ... from '@cartae/...'` → `'@cartae/...'`
- [ ] Mettre à jour `tsconfig.base.json` : paths aliases
- [ ] Mettre à jour `pnpm-workspace.yaml` si nécessaire

#### 2.3 Mettre à Jour les IDs de Plugins
- [ ] `plugins/*/manifest.json` : `com.cartae.*` → `com.cartae.*`
- [ ] `registry.json` : Tous les plugin IDs

#### 2.4 Mettre à Jour l'UI et la Documentation
- [ ] Titre de l'application : `<title>Cartae</title>` → `<title>Cartae</title>`
- [ ] Logos et branding
- [ ] README.md (tous les repos)
- [ ] Messages utilisateur
- [ ] Commentaires de code (optionnel)

#### 2.5 Mettre à Jour les Configs
- [ ] `.env.example` : Noms de variables si nécessaire
- [ ] `vite.config.ts` : Titre de l'app
- [ ] Playwright configs : Noms de tests
- [ ] GitHub workflows : Noms de jobs

### Phase 3 : Migration GitHub (30 min)
#### 3.1 Renommer les Repos
**GitHub Settings → General → Rename repository**
1. `cartae` → `cartae`
2. `cartae-private` → `cartae-private`
3. `cartae-plugins` → `cartae-plugins`

⚠️ **GitHub gère automatiquement les redirections** des anciennes URLs !

#### 3.2 Mettre à Jour les Remotes Localement
```bash
cd /Users/moi/Nextcloud/10.Scripts/cartae/cartae
git remote set-url origin https://github.com/guthubrx/cartae.git

cd /Users/moi/Nextcloud/10.Scripts/cartae/cartae-private
git remote set-url origin https://github.com/guthubrx/cartae-private.git

cd /Users/moi/Nextcloud/10.Scripts/cartae/cartae-plugins
git remote set-url origin https://github.com/guthubrx/cartae-plugins.git
```

#### 3.3 Mettre à Jour GitHub OAuth App
- Name: `Cartae OAuth` → `Cartae OAuth`
- Homepage URL: Mettre à jour si domaine change
- Callback URL: Vérifier compatibilité

### Phase 4 : Migration Supabase (10 min)
#### Option A : Garder le projet (RECOMMANDÉ)
- [ ] Renommer le projet : `Cartae` → `Cartae` (Settings → General)
- [ ] Mettre à jour les Edge Functions : logs et noms de fonctions
- [ ] Garder les URLs (évite de tout reconfigurer)

#### Option B : Créer nouveau projet (NON RECOMMANDÉ)
- Nécessite migration complète de la DB
- Re-déploiement de toutes les Edge Functions
- Nouvelles clés API à configurer partout

### Phase 5 : Tests (30 min)
- [ ] `pnpm install` (réinstaller avec nouveaux noms de packages)
- [ ] `pnpm build` (vérifier que tout build)
- [ ] `pnpm dev` (tester l'application)
- [ ] Vérifier les plugins chargent correctement
- [ ] Tester GitHub OAuth
- [ ] Tester admin panel (Edge Functions)
- [ ] Vérifier marketplace (registry.json)

### Phase 6 : Déploiement (30 min)
- [ ] Merger la branche `migration/cartae-to-cartae` → `main`
- [ ] Push vers les repos renommés
- [ ] Créer un tag `v2.0.0-cartae` (nouvelle ère !)
- [ ] Mettre à jour la documentation

---

## 🔍 Checklist de Vérification

### Fichiers Critiques à Vérifier
```bash
# Package names
grep -r '"name".*cartae' package.json apps/*/package.json packages/*/package.json

# Imports
grep -r "from '@cartae" --include="*.ts" --include="*.tsx" .

# Plugin IDs
grep -r "com.cartae" --include="*.json" .

# UI Text
grep -r "Cartae" --include="*.tsx" --include="*.ts" --include="*.html" apps/web/

# Documentation
grep -r "Cartae" --include="*.md" .
```

### Tests Post-Migration
- [ ] Application démarre sans erreurs
- [ ] Plugins se chargent
- [ ] Marketplace fonctionne
- [ ] GitHub OAuth fonctionne
- [ ] Admin panel fonctionne
- [ ] Edge Functions répondent
- [ ] Supabase connecté
- [ ] Build production OK

---

## ⚠️ Risques et Mitigation

### Risque 1 : Breaking Changes pour Utilisateurs
**Impact :** Les installations existantes pourraient casser
**Mitigation :**
- Garder compatibilité avec anciens plugin IDs (`com.cartae.*`)
- Migration automatique des configs utilisateur
- Message de migration dans l'app

### Risque 2 : Cache NPM / Node Modules
**Impact :** Anciens packages restent en cache
**Mitigation :**
```bash
rm -rf node_modules
rm -rf pnpm-lock.yaml
pnpm install
```

### Risque 3 : URLs Hardcodées
**Impact :** Liens cassés dans documentation
**Mitigation :**
- GitHub redirige automatiquement
- Mettre à jour manuellement les docs importantes

### Risque 4 : Supabase Edge Functions
**Impact :** Logs et noms de fonctions contiennent "Cartae"
**Mitigation :**
- Non critique, juste cosmétique
- Mettre à jour progressivement

---

## 📝 Script de Migration Automatique

```bash
#!/bin/bash

# Renommage automatique Cartae → Cartae
# Usage: ./migrate-to-cartae.sh

echo "🔄 Migration Cartae → Cartae"

# 1. Package names
find . -name "package.json" -type f -exec sed -i '' 's/"cartae"/"cartae"/g' {} +
find . -name "package.json" -type f -exec sed -i '' 's/@cartae/@cartae/g' {} +

# 2. Imports TypeScript/JavaScript
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i '' "s/'@cartae/'@cartae/g"
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i '' 's/"@cartae/"@cartae/g'

# 3. Plugin IDs
find . -name "manifest.json" -o -name "registry.json" | \
  xargs sed -i '' 's/com\.cartae/com.cartae/g'

# 4. UI Text (optionnel, à vérifier manuellement après)
# find apps/web/src -name "*.tsx" | xargs sed -i '' 's/Cartae/Cartae/g'

# 5. tsconfig
sed -i '' 's/@cartae/@cartae/g' tsconfig.base.json

echo "✅ Migration terminée !"
echo "⚠️  Vérifiez manuellement :"
echo "   - Titres UI (Cartae → Cartae)"
echo "   - Documentation"
echo "   - Logos/branding"
echo ""
echo "Ensuite :"
echo "   rm -rf node_modules pnpm-lock.yaml"
echo "   pnpm install"
echo "   pnpm build"
```

---

## 🎯 Ordre d'Exécution Recommandé

1. **Créer branche** + **Tag de sauvegarde**
2. **Exécuter script de migration** (ou manuel)
3. **Clean install** : `rm -rf node_modules && pnpm install`
4. **Build & Test** : `pnpm build && pnpm dev`
5. **Renommer repos GitHub**
6. **Mettre à jour remotes Git**
7. **Renommer projet Supabase**
8. **Tests complets**
9. **Merge + Push**
10. **Créer tag `v2.0.0-cartae`**

---

## ✅ Checklist Finale

### Avant de Commencer
- [ ] Sauvegarde complète (tag Git)
- [ ] Liste des services externes documentée
- [ ] Plan de rollback préparé

### Pendant la Migration
- [ ] Script exécuté ou modifications manuelles
- [ ] Clean install effectué
- [ ] Build réussi
- [ ] Tests passent

### Après la Migration
- [ ] Repos GitHub renommés
- [ ] Remotes Git mis à jour
- [ ] Supabase renommé
- [ ] Documentation à jour
- [ ] Tag `v2.0.0-cartae` créé

---

## 📞 Support

**En cas de problème :**
1. Rollback : `git reset --hard pre-cartae-migration`
2. Restaurer remotes : `git remote set-url origin <old-url>`
3. Réinstaller : `rm -rf node_modules && pnpm install`

**Temps estimé total :** 1h30 - 2 heures (avec script automatique)
**Difficulté :** Moyenne
**Réversible :** Oui (via Git)

---

## 📊 MISE À JOUR : Analyse Exhaustive Complétée

**Date :** 31 Octobre 2025
**Fichiers affectés :** **246 fichiers** (analyse exhaustive dans `MIGRATION_ANALYSIS_EXHAUSTIVE.md`)

### Répartition par Repository
- **cartae** (principal) : **192 fichiers** (78.0%)
- **cartae-plugins** : **38 fichiers** (15.4%)
- **cartae-private** : **16 fichiers** (6.5%)

### Types de Changements Identifiés
1. **Package Names** : 26 packages (@cartae/* → @cartae/*)
2. **Plugin IDs** : 8+ plugins (com.cartae.* → com.cartae.*)
3. **Imports TypeScript** : ~150+ occurrences
4. **URLs GitHub** : 40+ occurrences
5. **Texte UI/Documentation** : ~50+ occurrences
6. **Configs** : tsconfig, vite, playwright, etc.

### ⚠️ Fichiers Critiques
- `cartae-plugins/registry.json` - **Si oublié, marketplace cassé !**
- `tsconfig.base.json` - Paths TypeScript
- Tous les `package.json` (26 fichiers)
- Tous les `manifest.json` (8+ plugins)

**Voir `MIGRATION_ANALYSIS_EXHAUSTIVE.md` pour les détails complets.**

---

**Prêt à commencer ? Dis-moi et on lance la migration ! 🚀**
