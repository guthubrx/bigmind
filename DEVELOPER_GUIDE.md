# 🚀 Guide du Développeur Débutant - BigMind

## 🎯 Scripts d'Assistance Automatique

### Scripts Principaux

- `./scripts/01-setup-dev-environment.sh` - Configuration de l'environnement
- `./scripts/02-fix-eslint.sh` - Correction automatique ESLint
- `./scripts/03-detect-refactor.sh` - Détection de refactoring nécessaire
- `./scripts/04-smart-pre-commit.sh` - Hook pre-commit intelligent
- `./scripts/05-quick-commit.sh "message"` - Commit rapide avec vérifications

### Alias Git Configurés

```bash
git st                    # git status
git quick-commit "msg"    # Commit rapide automatique
git fix-eslint           # Correction ESLint
git check-refactor       # Analyse de refactoring
git safe-commit          # Commit avec vérifications
```

## 🔧 Workflow Recommandé pour Débutants

### 1. Avant de coder

```bash
git check-refactor       # Analyser l'état du code
```

### 2. Pendant le développement

- Sauvegarder souvent (Ctrl+S dans VS Code)
- Le formatage et ESLint se corrigent automatiquement

### 3. Avant de committer

```bash
git fix-eslint          # Corriger les erreurs ESLint
git st                  # Vérifier les fichiers modifiés
git add .               # Stager les fichiers
git quick-commit "feat: ma nouvelle fonctionnalité"
```

### 4. Le pre-commit hook vérifie automatiquement :

- ✅ ESLint (avec correction automatique)
- ✅ TypeScript
- ✅ Secrets potentiels
- ✅ Taille des fichiers

## 🚨 En cas de problème

### ESLint bloque le commit

```bash
./scripts/02-fix-eslint.sh    # Correction automatique
# Ou voir les erreurs détaillées :
pnpm lint
```

### Erreurs TypeScript

```bash
pnpm type-check              # Voir toutes les erreurs
# Corriger manuellement les fichiers listés
```

### Code trop complexe

```bash
./scripts/03-detect-refactor.sh    # Analyse automatique
# Suivre les recommandations affichées
```

### Forcer un commit (non recommandé)

```bash
git commit --no-verify       # Ignore les vérifications
```

## 📁 Structure de Projet Recommandée

```
src/
├── components/          # Composants React
├── hooks/              # Hooks personnalisés
├── pages/              # Pages/vues principales
├── utils/              # Fonctions utilitaires
├── types/              # Types TypeScript
└── assets/             # Images, styles, etc.
```

## 💡 Conseils pour Débutants

1. **Commitez souvent** - Petits commits fréquents
2. **Lisez les messages d'erreur** - Ils contiennent souvent la solution
3. **Utilisez les scripts** - Ils automatisent les tâches répétitives
4. **Suivez les recommandations** - Les scripts donnent des conseils précis
5. **N'hésitez pas à demander de l'aide** - Les logs contiennent le contexte pour l'IA

## 🔍 Logs et Debugging

Tous les scripts sauvegardent des logs détaillés dans `logs/` :

- `logs/quick_commit_*.log` - Logs des commits
- `logs/eslint_fix_*.log` - Logs ESLint
- `logs/refactor_analysis_*.log` - Analyses de refactoring
- `logs/pre_commit_*.log` - Logs pre-commit

Ces logs contiennent le contexte complet pour diagnostiquer les problèmes.
