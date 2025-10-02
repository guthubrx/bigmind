#!/bin/bash

# FR: Script d'installation et configuration automatique pour développeurs débutants
# EN: Automatic setup and configuration script for beginner developers
# Usage: ./scripts/08-setup-dev-environment.sh

set -e

# Configuration
LOG_DIR="logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/setup_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        "INFO")
            echo -e "${GREEN}[SETUP]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[SETUP]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[SETUP]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SETUP]${NC} $message"
            ;;
        "INSTALL")
            echo -e "${BLUE}[SETUP]${NC} $message"
            ;;
    esac
}

# Installation du pre-commit hook intelligent
setup_pre_commit_hook() {
    log "INFO" "🪝 Configuration du pre-commit hook intelligent..."
    
    # Créer le répertoire .git/hooks s'il n'existe pas
    mkdir -p .git/hooks
    
    # Créer le pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook intelligent généré automatiquement
exec ./scripts/04-smart-pre-commit.sh
EOF
    
    # Rendre le hook exécutable
    chmod +x .git/hooks/pre-commit
    
    log "SUCCESS" "✅ Pre-commit hook installé"
    log "INFO" "   - Vérifiera automatiquement ESLint, TypeScript, secrets"
    log "INFO" "   - Corrigera automatiquement les erreurs quand possible"
    log "INFO" "   - Bloquera les commits problématiques"
}

# Configuration des alias Git utiles
setup_git_aliases() {
    log "INFO" "🔧 Configuration des alias Git pour développeurs débutants..."
    
    # Alias utiles pour les débutants
    git config --local alias.st "status"
    git config --local alias.co "checkout"
    git config --local alias.br "branch"
    git config --local alias.ci "commit"
    git config --local alias.unstage "reset HEAD --"
    git config --local alias.last "log -1 HEAD"
    git config --local alias.visual "!gitk"
    git config --local alias.type "cat-file -t"
    git config --local alias.dump "cat-file -p"
    
    # Alias spécifiques au projet
    git config --local alias.quick-commit "!./scripts/05-quick-commit.sh"
    git config --local alias.fix-eslint "!./scripts/02-fix-eslint.sh"
    git config --local alias.check-refactor "!./scripts/03-detect-refactor.sh"
    git config --local alias.safe-commit "!./scripts/04-smart-pre-commit.sh && git commit"
    
    log "SUCCESS" "✅ Alias Git configurés"
    log "INFO" "   - git st (status)"
    log "INFO" "   - git quick-commit \"message\""
    log "INFO" "   - git fix-eslint"
    log "INFO" "   - git check-refactor"
}

# Configuration de VS Code (si disponible)
setup_vscode_config() {
    log "INFO" "💻 Configuration de VS Code..."
    
    if ! command -v code &> /dev/null; then
        log "WARN" "⚠️ VS Code non détecté - configuration ignorée"
        return 0
    fi
    
    # Créer le répertoire .vscode s'il n'existe pas
    mkdir -p .vscode
    
    # Configuration des paramètres VS Code
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
EOF
    
    # Extensions recommandées
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
EOF
    
    # Tâches VS Code
    cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
            "label": "Fix ESLint",
            "type": "shell",
            "command": "./scripts/02-fix-eslint.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
            "label": "Check Refactor",
            "type": "shell",
            "command": "./scripts/03-detect-refactor.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
            "label": "Quick Commit",
            "type": "shell",
            "command": "./scripts/05-quick-commit.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
EOF
    
    log "SUCCESS" "✅ Configuration VS Code créée"
    log "INFO" "   - Format automatique à la sauvegarde"
    log "INFO" "   - Correction ESLint automatique"
    log "INFO" "   - Extensions recommandées"
    log "INFO" "   - Tâches personnalisées (Ctrl+Shift+P > Tasks)"
}

# Création du fichier d'aide pour développeurs débutants
create_developer_guide() {
    log "INFO" "📚 Création du guide développeur..."
    
    cat > DEVELOPER_GUIDE.md << 'EOF'
# 🚀 Guide du Développeur Débutant - BigMind

## 🎯 Scripts d'Assistance Automatique

### Scripts Principaux
- `./scripts/01-quick-commit.sh "message"` - Commit rapide avec vérifications
- `./scripts/05-fix-eslint.sh` - Correction automatique ESLint
- `./scripts/06-detect-refactor.sh` - Détection de refactoring nécessaire
- `./scripts/07-smart-pre-commit.sh` - Hook pre-commit intelligent

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
./scripts/05-fix-eslint.sh    # Correction automatique
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
./scripts/06-detect-refactor.sh    # Analyse automatique
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
EOF
    
    log "SUCCESS" "✅ Guide développeur créé : DEVELOPER_GUIDE.md"
}

# Vérification et installation des dépendances
check_dependencies() {
    log "INFO" "📦 Vérification des dépendances..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log "ERROR" "❌ Node.js n'est pas installé"
        log "ERROR" "💡 Installation: https://nodejs.org/"
        return 1
    fi
    
    # Vérifier pnpm
    if ! command -v pnpm &> /dev/null; then
        log "WARN" "⚠️ pnpm n'est pas installé"
        log "INSTALL" "🔧 Installation de pnpm..."
        npm install -g pnpm
        log "SUCCESS" "✅ pnpm installé"
    fi
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log "ERROR" "❌ Git n'est pas installé"
        log "ERROR" "💡 Installation: https://git-scm.com/"
        return 1
    fi
    
    log "SUCCESS" "✅ Toutes les dépendances sont présentes"
    return 0
}

# Test des scripts installés
test_scripts() {
    log "INFO" "🧪 Test des scripts installés..."
    
    # Tester le script ESLint
    if [ -f "scripts/02-fix-eslint.sh" ]; then
        log "SUCCESS" "✅ Script ESLint disponible"
    else
        log "ERROR" "❌ Script ESLint manquant"
    fi
    
    # Tester le script de refactoring
    if [ -f "scripts/03-detect-refactor.sh" ]; then
        log "SUCCESS" "✅ Script refactoring disponible"
    else
        log "ERROR" "❌ Script refactoring manquant"
    fi
    
    # Tester le pre-commit hook
    if [ -f ".git/hooks/pre-commit" ]; then
        log "SUCCESS" "✅ Pre-commit hook installé"
    else
        log "ERROR" "❌ Pre-commit hook manquant"
    fi
}

# Fonction principale
main() {
    log "INFO" "🚀 Configuration de l'Environnement de Développement pour Débutants"
    log "INFO" "🎯 Objectif: Automatiser au maximum pour éviter les erreurs courantes"
    log "INFO" ""
    
    # Vérifier les prérequis
    if ! check_dependencies; then
        log "ERROR" "❌ Prérequis manquants - installation interrompue"
        exit 1
    fi
    
    # Configuration étape par étape
    log "INFO" "📋 ÉTAPES DE CONFIGURATION :"
    log "INFO" ""
    
    # 1. Pre-commit hook
    setup_pre_commit_hook
    log "INFO" ""
    
    # 2. Alias Git
    setup_git_aliases
    log "INFO" ""
    
    # 3. Configuration VS Code
    setup_vscode_config
    log "INFO" ""
    
    # 4. Guide développeur
    create_developer_guide
    log "INFO" ""
    
    # 5. Test final
    test_scripts
    log "INFO" ""
    
    # Résumé final
    log "SUCCESS" "🎉 CONFIGURATION TERMINÉE AVEC SUCCÈS !"
    log "SUCCESS" ""
    log "SUCCESS" "✅ Votre environnement de développement est maintenant configuré pour :"
    log "SUCCESS" "   - Corrections automatiques ESLint"
    log "SUCCESS" "   - Détection de refactoring nécessaire"
    log "SUCCESS" "   - Pre-commit hooks intelligents"
    log "SUCCESS" "   - Alias Git pratiques"
    log "SUCCESS" "   - Configuration VS Code optimisée"
    log "SUCCESS" ""
    log "SUCCESS" "📚 Consultez DEVELOPER_GUIDE.md pour commencer"
    log "SUCCESS" "🔧 Testez avec: git quick-commit \"test: configuration initiale\""
    log "SUCCESS" ""
    log "SUCCESS" "📝 Log détaillé: $LOG_FILE"
}

# Exécuter la configuration
main "$@"
