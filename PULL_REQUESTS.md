# 🔀 Pull Requests : Migration BigMind → Cartae

**Date :** 31 Octobre 2025
**Branches pushées :** ✅ Toutes les branches sont sur GitHub

---

## 📊 Status

| Repository             | Branch                        | Status    | PR URL                                                                                      |
| ---------------------- | ----------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| **cartae** (principal) | `migration/bigmind-to-cartae` | ✅ Pushée | [Créer PR](https://github.com/guthubrx/cartae/pull/new/migration/bigmind-to-cartae)         |
| **cartae-plugins**     | `migration/bigmind-to-cartae` | ✅ Pushée | [Créer PR](https://github.com/guthubrx/cartae-plugins/pull/new/migration/bigmind-to-cartae) |
| **cartae-private**     | `migration/bigmind-to-cartae` | ✅ Pushée | [Créer PR](https://github.com/guthubrx/cartae-private/pull/new/migration/bigmind-to-cartae) |

---

## 🚀 Créer les Pull Requests (5 min)

### Option 1 : URLs Directes (Rapide)

Clique sur les liens ci-dessus, ou :

1. **cartae (principal)**
   https://github.com/guthubrx/cartae/pull/new/migration/bigmind-to-cartae

2. **cartae-plugins**
   https://github.com/guthubrx/cartae-plugins/pull/new/migration/bigmind-to-cartae

3. **cartae-private**
   https://github.com/guthubrx/cartae-private/pull/new/migration/bigmind-to-cartae

---

### Option 2 : Depuis GitHub (Manuel)

Pour chaque repo :

1. Va sur le repo GitHub
2. Tu devrais voir un bandeau jaune : **"migration/bigmind-to-cartae had recent pushes"**
3. Clique sur **"Compare & pull request"**

---

## 📝 Template pour les Pull Requests

Utilise ce template pour les 3 PRs :

### Titre

```
feat: rename BigMind to Cartae
```

### Description

**Pour cartae (principal) :**

```markdown
## 🔄 Migration BigMind → Cartae

Complete brand migration from BigMind to Cartae.

### Changes Summary

- **192 files** modified in this repository
- **26 packages** renamed: `@bigmind/*` → `@cartae/*`
- **8+ plugin IDs** updated: `com.bigmind.*` → `com.cartae.*`
- **~150 TypeScript imports** updated
- **46 markdown files** updated
- All TypeScript configs updated (tsconfig paths)

### Technical Notes

- ✅ All `@cartae/*` packages build successfully
- ✅ Clean pnpm install performed
- ✅ Migration tag created: `pre-cartae-migration`
- ✅ Rollback possible via tag

### Known Issues (Pre-existing)

- Some TypeScript strict mode errors (not migration-related)
- Linting errors (pre-existing, to be fixed separately)

### Related

- See `MIGRATION_ANALYSIS_EXHAUSTIVE.md` for complete analysis
- See `MIGRATION_STATUS.md` for full status

### Checklist

- [x] Code migrated (246 files across 3 repos)
- [x] Packages renamed
- [x] Plugin IDs updated
- [x] Documentation updated
- [x] Clean install + rebuild
- [x] Repos renamed on GitHub
- [ ] PR reviewed and merged
- [ ] Services updated (Supabase, OAuth)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

**Pour cartae-plugins :**

```markdown
## 🔄 Migration BigMind → Cartae (Plugins)

Migration of plugins repository.

### Changes Summary

- **38 files** modified
- **6 plugins** updated (official + community)
- **registry.json** updated (CRITICAL - all plugin IDs + URLs)
- All manifest.json: `com.bigmind.*` → `com.cartae.*`
- All package.json: `@bigmind/*` → `@cartae/*`
- GitHub URLs updated: `bigmind-plugins` → `cartae-plugins`

### Plugins Updated

1. official/color-palettes-collection
2. official/dag-templates-collection
3. community/hello-world
4. community/example
5. community/event-monitor
6. community/analytics

### Critical Files

- ✅ `registry.json` updated (marketplace would break without this)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

**Pour cartae-private :**

```markdown
## 🔄 Migration BigMind → Cartae (Private)

Migration of private repository.

### Changes Summary

- **16 files** modified
- **admin-panel plugin** fully updated
- **shared package** renamed: `@bigmind-private/shared` → `@cartae-private/shared`
- Plugin ID: `com.bigmind.admin-panel` → `com.cartae.admin-panel`
- All TypeScript imports updated
- Documentation updated (TEST_ADMIN_FLOW.md, todo291025.md)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## ✅ Après Création des PRs

### 1. Review (Optionnel)

Si tu veux vérifier avant de merger :

- Regarde les **Files changed**
- Vérifie que les renommages sont corrects
- Check que `registry.json` est bien à jour (cartae-plugins)

### 2. Merge (Important)

**Ordre recommandé :**

1. **cartae-plugins** (pas de dépendances)
2. **cartae-private** (dépend de cartae-plugins pour registry)
3. **cartae** (principal) en dernier

**Comment merger :**

- Clique sur **"Merge pull request"**
- Choisis **"Create a merge commit"** (recommandé)
- Ou **"Squash and merge"** si tu veux un historique propre
- Confirme avec **"Confirm merge"**

---

## 🧹 Après Merge

### 1. Revenir sur `main` localement

```bash
# Repo 1 : cartae
cd /Users/moi/Nextcloud/10.Scripts/02.Cartae/cartae
git checkout main
git pull origin main

# Repo 2 : cartae-plugins
cd /Users/moi/Nextcloud/10.Scripts/02.Cartae/cartae-plugins
git checkout main
git pull origin main

# Repo 3 : cartae-private
cd /Users/moi/Nextcloud/10.Scripts/02.Cartae/cartae-private
git checkout main
git pull origin main
```

### 2. Supprimer les branches locales (Optionnel)

```bash
cd /Users/moi/Nextcloud/10.Scripts/02.Cartae/cartae
git branch -d migration/bigmind-to-cartae

cd /Users/moi/Nextcloud/10.Scripts/02.Cartae/cartae-plugins
git branch -d migration/bigmind-to-cartae

cd /Users/moi/Nextcloud/10.Scripts/02.Cartae/cartae-private
git branch -d migration/bigmind-to-cartae
```

### 3. Tag la version (Optionnel)

Si tu veux marquer cette migration comme une version majeure :

```bash
cd /Users/moi/Nextcloud/10.Scripts/02.Cartae/cartae
git checkout main
git pull origin main
git tag -a v2.0.0-cartae -m "Version 2.0.0 - Rebranding to Cartae"
git push origin v2.0.0-cartae
```

---

## 📊 Checklist Complète

### Avant Merge

- [ ] PR créée pour **cartae**
- [ ] PR créée pour **cartae-plugins**
- [ ] PR créée pour **cartae-private**
- [ ] (Optionnel) Review des changements

### Après Merge

- [ ] PRs mergées dans les 3 repos
- [ ] Retour sur `main` localement
- [ ] Pull des derniers changements
- [ ] (Optionnel) Tag v2.0.0-cartae créé

### Services Externes

- [ ] Supabase Project renommé
- [ ] GitHub OAuth App renommé

---

## 🎯 Prochaines Étapes

Une fois les PRs mergées :

1. **Mettre à jour Supabase Project** (2 min)
   - https://supabase.com/dashboard
   - Settings → General → Rename "BigMind" → "Cartae"

2. **Mettre à jour GitHub OAuth App** (2 min)
   - https://github.com/settings/developers
   - Rename "BigMind OAuth" → "Cartae OAuth"

3. **Célébrer !** 🎉
   - La migration est 100% complète !

---

## 🆘 Support

**Si problème avec les PRs :**

- Vérifie que tu es sur la bonne branche
- Vérifie que les remotes sont à jour : `git remote -v`
- Si besoin de rollback : `git reset --hard pre-cartae-migration`

**Si problème après merge :**

- Tu peux toujours revenir en arrière avec le tag : `git reset --hard pre-cartae-migration`

---

**Prêt ? Crée les 3 PRs et merge-les !** 🚀
