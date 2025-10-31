# 🔄 Guide : Renommer les Repos GitHub (BigMind → Cartae)

**Date :** 31 Octobre 2025
**Durée estimée :** 10 minutes

---

## ✅ Ce qui est DÉJÀ FAIT

- ✅ Code migré (246 fichiers)
- ✅ Commits dans les 3 repos
- ✅ Tag de sauvegarde `pre-cartae-migration`
- ✅ Branche `migration/bigmind-to-cartae`

---

## 🎯 Objectif

Renommer les 3 repositories GitHub :
1. `guthubrx/bigmind` → `guthubrx/cartae`
2. `guthubrx/bigmind-plugins` → `guthubrx/cartae-plugins`
3. `guthubrx/bigmind-private` → `guthubrx/cartae-private`

---

## 🔒 Garanties GitHub

### GitHub gère AUTOMATIQUEMENT les redirections !

✅ **Toutes les anciennes URLs continueront de fonctionner**
✅ **Tous les clones existants fonctionneront**
✅ **Tous les liens (issues, PRs, etc.) restent valides**
✅ **Aucune donnée n'est perdue**

### Exemple :
```
Ancienne URL : https://github.com/guthubrx/bigmind
                         ↓ (redirection automatique)
Nouvelle URL : https://github.com/guthubrx/cartae
```

---

## 📋 Étapes de Renommage

### **Repo 1/3 : bigmind → cartae**

#### 1. Ouvrir GitHub
- Va sur : https://github.com/guthubrx/bigmind

#### 2. Accéder aux Settings
- Clique sur **Settings** (onglet en haut à droite)

#### 3. Renommer
- Scroll vers le bas jusqu'à la section **"Danger Zone"** (en rouge)
- Clique sur **"Rename repository"**
- Entre le nouveau nom : `cartae`
- Confirme en tapant : `guthubrx/cartae`
- Clique sur **"I understand, rename this repository"**

#### 4. Vérification
- ✅ Tu es automatiquement redirigé vers la nouvelle URL
- ✅ L'ancienne URL https://github.com/guthubrx/bigmind redirige vers la nouvelle

---

### **Repo 2/3 : bigmind-plugins → cartae-plugins**

#### 1. Ouvrir GitHub
- Va sur : https://github.com/guthubrx/bigmind-plugins

#### 2. Settings → Rename
- **Settings** → **Danger Zone** → **"Rename repository"**
- Nouveau nom : `cartae-plugins`
- Confirme : `guthubrx/cartae-plugins`

---

### **Repo 3/3 : bigmind-private → cartae-private**

#### 1. Ouvrir GitHub
- Va sur : https://github.com/guthubrx/bigmind-private

#### 2. Settings → Rename
- **Settings** → **Danger Zone** → **"Rename repository"**
- Nouveau nom : `cartae-private`
- Confirme : `guthubrx/cartae-private`

---

## 🖥️ Mettre à Jour les Remotes Localement

**Après avoir renommé les 3 repos sur GitHub**, exécute ces commandes :

```bash
# Repo 1 : cartae (principal)
cd /Users/moi/Nextcloud/10.Scripts/bigmind/bigmind
git remote set-url origin https://github.com/guthubrx/cartae.git
git remote -v  # Vérifier

# Repo 2 : cartae-plugins
cd /Users/moi/Nextcloud/10.Scripts/bigmind/bigmind-plugins
git remote set-url origin https://github.com/guthubrx/cartae-plugins.git
git remote -v  # Vérifier

# Repo 3 : cartae-private
cd /Users/moi/Nextcloud/10.Scripts/bigmind/bigmind-private
git remote set-url origin https://github.com/guthubrx/cartae-private.git
git remote -v  # Vérifier
```

---

## 🔍 Vérifications Post-Renommage

### Vérifier que tout fonctionne :

```bash
# Test 1 : Vérifier que les remotes pointent vers les nouvelles URLs
cd /Users/moi/Nextcloud/10.Scripts/bigmind/bigmind
git remote -v
# Devrait afficher : origin  https://github.com/guthubrx/cartae.git

# Test 2 : Tester un fetch
git fetch origin

# Test 3 : Vérifier que l'ancienne URL redirige (optionnel)
git ls-remote https://github.com/guthubrx/bigmind.git
# Devrait fonctionner grâce à la redirection GitHub !
```

---

## 📊 Ce qui Change / Ce qui NE Change PAS

### ✅ Ce qui CHANGE
- URLs des repos GitHub
- Noms des repos dans l'interface GitHub
- URLs dans `git remote -v` (après `set-url`)

### ✅ Ce qui NE CHANGE PAS
- Historique Git (commits, branches, tags)
- Issues et Pull Requests
- GitHub Actions / Workflows
- Clones existants (continuent de fonctionner avec redirection)
- Fichiers locaux

---

## ⚠️ Notes Importantes

### 1. Les Anciennes URLs Fonctionnent TOUJOURS
GitHub maintient une **redirection permanente** :
- `https://github.com/guthubrx/bigmind` → `https://github.com/guthubrx/cartae`

### 2. Les Clones Existants Fonctionnent
Si tu as cloné le repo ailleurs sur ton système, il continuera de fonctionner :
```bash
# Même avec l'ancienne URL, ça marche !
git fetch origin
git pull origin main
```

### 3. Mise à Jour des URLs (Recommandé mais pas Obligatoire)
Pour "propretté", il est recommandé de mettre à jour les remotes avec `git remote set-url`, mais ce n'est **pas bloquant**.

---

## 🎯 Ordre d'Exécution

1. ✅ **Renommer sur GitHub** (3 repos) - ~5 min
2. ✅ **Mettre à jour remotes localement** - ~2 min
3. ✅ **Vérifier avec `git fetch`** - ~1 min

---

## 🆘 En Cas de Problème

### Si une URL ne fonctionne pas :
```bash
# Vérifier la remote actuelle
git remote -v

# Si besoin, forcer la mise à jour
git remote remove origin
git remote add origin https://github.com/guthubrx/cartae.git
```

### Si tu as besoin de rollback :
**Impossible** : Une fois renommé sur GitHub, tu ne peux pas "annuler" facilement (il faudrait renommer à nouveau).

**Mais** : Aucune donnée n'est perdue, c'est juste un renommage.

---

## ✅ Checklist Finale

Après avoir tout fait :

- [ ] Repo `cartae` accessible sur GitHub
- [ ] Repo `cartae-plugins` accessible sur GitHub
- [ ] Repo `cartae-private` accessible sur GitHub
- [ ] Remote locale mise à jour pour `cartae`
- [ ] Remote locale mise à jour pour `cartae-plugins`
- [ ] Remote locale mise à jour pour `cartae-private`
- [ ] `git fetch origin` fonctionne sur les 3 repos

---

## 🎉 Une Fois Terminé

Tu pourras :
1. ✅ Push tes branches `migration/bigmind-to-cartae` vers les nouveaux repos
2. ✅ Créer des Pull Requests
3. ✅ Merger dans `main`
4. ✅ Mettre à jour Supabase Project name
5. ✅ Mettre à jour GitHub OAuth App name

---

**Prêt ? Lance le renommage et reviens me voir après !** 🚀
