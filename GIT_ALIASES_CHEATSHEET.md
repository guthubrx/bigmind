# 🚀 Aide-Mémoire : Alias Git Intelligents

## ⚡ Alias Principaux (Scripts Automatiques)

### 🔍 Analyse et Diagnostic

```bash
git check-refactor                    # Analyser le besoin de refactoring
git check-refactor apps/web/src       # Analyser un dossier spécifique
```

### 🔧 Corrections Automatiques

```bash
git fix-eslint                        # Corriger toutes les erreurs ESLint
git fix-eslint src/App.tsx            # Corriger un fichier spécifique
```

### 📝 Commits Intelligents

```bash
git quick-commit "feat: ma feature"   # Commit rapide avec vérifications
git safe-commit                       # Commit avec double vérification
```

## 🎯 Alias Git Standards

### 📊 Navigation et Information

```bash
git st                                # git status
git br                                # git branch
git co feature-branch                 # git checkout feature-branch
git last                              # Voir le dernier commit
```

### 🔄 Opérations Courantes

```bash
git ci -m "message"                   # git commit -m "message"
git unstage fichier.txt               # Retirer du staging
```

## 🚨 Erreurs Courantes à Éviter

❌ **INCORRECT :**

- `git refactor` → N'existe pas !
- `git eslint` → N'existe pas !
- `git commit-quick` → Mauvais ordre !

✅ **CORRECT :**

- `git check-refactor`
- `git fix-eslint`
- `git quick-commit`

## 🎯 Workflow Recommandé

### 🌅 Début de journée

```bash
git st                                # Voir l'état
git check-refactor apps/web/src       # Analyser le code
```

### 💻 Pendant le développement

```bash
git fix-eslint                        # Corriger ESLint si besoin
# ... coder ...
git st                                # Vérifier les changements
```

### 📝 Avant de committer

```bash
git fix-eslint                        # Dernière correction
git add .                             # Stager les fichiers
git quick-commit "feat: ma feature"   # Commit intelligent
```

### 🛡️ Commit ultra-sécurisé (si problèmes)

```bash
git add .
git safe-commit                       # Pre-commit hook + commit
```

## 🔧 Dépannage

### Si un alias ne fonctionne pas :

```bash
git config --local --list | grep alias    # Voir tous les alias
```

### Si vous voulez ajouter un alias :

```bash
git config --local alias.mon-alias "ma-commande"
```

### Pour supprimer un alias :

```bash
git config --local --unset alias.mon-alias
```

## 💡 Conseils pour Débutants

1. **Utilisez `git st` au lieu de `git status`** - Plus rapide !
2. **`git quick-commit` vérifie tout automatiquement** - Idéal pour débuter
3. **`git check-refactor` vous guide** - Lance-le régulièrement
4. **`git fix-eslint` corrige automatiquement** - Plus besoin de chercher les erreurs
5. **En cas de doute, consultez `DEVELOPER_GUIDE.md`**

## 🎉 Résultat

**Vous avez maintenant des "super-pouvoirs" Git qui automatisent 95% des tâches répétitives !**

---

_Généré automatiquement par le script d'installation BigMind_
