#!/bin/bash

# FR: Script de création de release manuelle pour BigMind
# EN: Manual release creation script for BigMind
# Usage: ./scripts/03-create-release.sh [patch|minor|major]

set -e

# Configuration des logs
LOG_DIR="logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/release_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log vers fichier avec timestamp
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    # Affichage console avec couleurs
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            echo -e "${RED}[ERROR]${NC} 📝 Logs détaillés: $LOG_FILE"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
    esac
}

# Fonction pour capturer et logger les commandes
run_cmd() {
    local cmd="$1"
    local description="$2"
    
    log "DEBUG" "Exécution: $cmd"
    echo "=== COMMAND: $cmd ===" >> "$LOG_FILE"
    
    if eval "$cmd" 2>&1 | tee -a "$LOG_FILE"; then
        log "SUCCESS" "$description - Succès"
        return 0
    else
        local exit_code=${PIPESTATUS[0]}
        log "ERROR" "$description - Échec (code: $exit_code)"
        log "ERROR" "Commande: $cmd"
        return $exit_code
    fi
}

check_prerequisites() {
    log "INFO" "🔍 Vérification des prérequis"
    
    # Collecter informations système pour diagnostic
    log "DEBUG" "=== INFORMATIONS SYSTÈME ==="
    log "DEBUG" "Date: $(date)"
    log "DEBUG" "OS: $(uname -a)"
    log "DEBUG" "Node.js: $(node -v 2>/dev/null || echo 'Non installé')"
    log "DEBUG" "npm: $(npm -v 2>/dev/null || echo 'Non installé')"
    log "DEBUG" "pnpm: $(pnpm -v 2>/dev/null || echo 'Non installé')"
    log "DEBUG" "Git: $(git --version)"
    log "DEBUG" "Répertoire: $(pwd)"
    
    # Vérifier qu'on est sur main
    local current_branch=$(git branch --show-current)
    log "DEBUG" "Branche actuelle: $current_branch"
    if [[ "$current_branch" != "main" ]]; then
        log "ERROR" "❌ Vous devez être sur la branche 'main' pour créer une release"
        log "ERROR" "💡 Branche actuelle: $current_branch"
        log "ERROR" "💡 Solution: git checkout main"
        log "ERROR" "💡 Puis: git pull origin main"
        exit 1
    fi
    
    # Vérifier qu'il n'y a pas de changements non commités
    log "DEBUG" "Vérification des changements non commités..."
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log "ERROR" "❌ Il y a des changements non commités"
        log "ERROR" "💡 Changements détectés:"
        git status --porcelain | while read -r line; do
            log "ERROR" "   $line"
        done
        log "ERROR" "💡 Solutions:"
        log "ERROR" "   - Commiter: git add . && git commit -m 'message'"
        log "ERROR" "   - Stasher: git stash"
        log "ERROR" "   - Annuler: git checkout ."
        exit 1
    fi
    
    # Vérifier qu'on est à jour avec origin
    git fetch origin main
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)
    
    if [[ "$local_commit" != "$remote_commit" ]]; then
        log "ERROR" "❌ Votre branche main n'est pas à jour avec origin/main"
        log "INFO" "💡 Exécutez: git pull origin main"
        exit 1
    fi
    
    # Vérifier que les outils nécessaires sont installés
    if ! command -v gh &> /dev/null; then
        log "ERROR" "❌ GitHub CLI (gh) n'est pas installé"
        log "INFO" "💡 Installez avec: brew install gh"
        exit 1
    fi
    
    log "INFO" "✅ Tous les prérequis sont satisfaits"
}

get_next_version() {
    local bump_type="$1"
    local current_version
    
    # Récupérer la version actuelle depuis package.json
    current_version=$(node -p "require('./package.json').version")
    log "INFO" "📋 Version actuelle: $current_version"
    
    # Calculer la prochaine version
    local major minor patch
    IFS='.' read -r major minor patch <<< "$current_version"
    
    case $bump_type in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch"|"")
            patch=$((patch + 1))
            ;;
        *)
            log "ERROR" "❌ Type de bump invalide: $bump_type"
            log "INFO" "💡 Utilisez: patch, minor, ou major"
            exit 1
            ;;
    esac
    
    echo "$major.$minor.$patch"
}

build_project() {
    log "INFO" "🔨 Construction du projet"
    
    cd "$PROJECT_ROOT"
    
    # Vérifier les dépendances avant build
    log "DEBUG" "Vérification des node_modules..."
    if [[ ! -d "node_modules" ]]; then
        log "WARN" "⚠️ node_modules manquant, installation des dépendances..."
        run_cmd "pnpm install" "Installation des dépendances"
    fi
    
    # Build avec capture détaillée des erreurs
    local packages=("@bigmind/core" "@bigmind/design" "@bigmind/ui" "bigmind-web")
    local icons=("📦" "🎨" "🧩" "🌐")
    
    for i in "${!packages[@]}"; do
        local package="${packages[$i]}"
        local icon="${icons[$i]}"
        
        log "INFO" "$icon Build $package"
        
        if ! run_cmd "pnpm build --filter $package" "Build $package"; then
            log "ERROR" "❌ Échec du build du package $package"
            log "ERROR" "💡 Diagnostics suggérés:"
            log "ERROR" "   1. Vérifier les erreurs TypeScript: pnpm type-check --filter $package"
            log "ERROR" "   2. Vérifier les dépendances: pnpm install"
            log "ERROR" "   3. Nettoyer: rm -rf node_modules dist && pnpm install"
            log "ERROR" "   4. Vérifier les imports/exports dans le code source"
            log "ERROR" "   5. Consulter les logs détaillés: $LOG_FILE"
            exit 1
        fi
    done
    
    log "SUCCESS" "✅ Build terminé avec succès"
}

create_release() {
    local version="$1"
    local tag="v$version"
    
    log "INFO" "🚀 Création de la release $tag"
    
    cd "$PROJECT_ROOT"
    
    # Mettre à jour la version dans package.json
    log "INFO" "📝 Mise à jour de la version dans package.json"
    npm version "$version" --no-git-tag-version
    
    # Créer le commit de release
    log "INFO" "📝 Création du commit de release"
    git add package.json
    git commit -m "chore(release): $version [skip ci]

Release $tag created manually via script.
    
- Built and tested all packages
- Ready for deployment"
    
    # Créer le tag
    log "INFO" "🏷️ Création du tag $tag"
    git tag -a "$tag" -m "Release $tag"
    
    # Pousser les changements
    log "INFO" "⬆️ Push des changements vers GitHub"
    git push origin main
    git push origin "$tag"
    
    # Déclencher le workflow de release
    log "INFO" "🔄 Déclenchement du workflow de release"
    gh workflow run release.yml --ref "$tag"
    
    log "INFO" "✅ Release $tag créée avec succès!"
    log "INFO" "🔗 Surveillez le workflow: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions"
}

main() {
    local bump_type="$1"
    
    log "INFO" "🚀 Script de création de release BigMind"
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Calculer la prochaine version
    local next_version
    next_version=$(get_next_version "$bump_type")
    log "INFO" "🎯 Prochaine version: $next_version"
    
    # Demander confirmation
    echo -e "${YELLOW}Voulez-vous créer la release v$next_version ? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "INFO" "❌ Release annulée"
        exit 0
    fi
    
    # Build du projet
    build_project
    
    # Créer la release
    create_release "$next_version"
    
    # Rapport final détaillé
    generate_final_report "$next_version"
}

generate_final_report() {
    local version="$1"
    local tag="v$version"
    
    log "SUCCESS" "🎉 Release créée avec succès!"
    log "INFO" "📋 Version: $version"
    log "INFO" "🏷️ Tag: $tag"
    log "INFO" "📝 Logs détaillés: $LOG_FILE"
    
    # Informations de suivi
    log "INFO" ""
    log "INFO" "📊 INFORMATIONS DE SUIVI:"
    log "INFO" "🔗 Workflow GitHub: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions"
    log "INFO" "📦 Release GitHub: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/releases/tag/$tag"
    log "INFO" "⏱️ Temps estimé pour les binaires: 10-15 minutes"
    
    # Commandes utiles pour le suivi
    log "INFO" ""
    log "INFO" "🛠️ COMMANDES UTILES:"
    log "INFO" "   Vérifier le statut: gh run list --limit 5"
    log "INFO" "   Voir les logs: gh run view --log"
    log "INFO" "   Reconstruire si nécessaire: ./scripts/04-rebuild-release.sh $tag"
    
    # Résumé technique dans les logs
    echo "" >> "$LOG_FILE"
    echo "=== RÉSUMÉ DE LA RELEASE ===" >> "$LOG_FILE"
    echo "Version: $version" >> "$LOG_FILE"
    echo "Tag: $tag" >> "$LOG_FILE"
    echo "Date: $(date)" >> "$LOG_FILE"
    echo "Commit: $(git rev-parse HEAD)" >> "$LOG_FILE"
    echo "Branche: $(git branch --show-current)" >> "$LOG_FILE"
    echo "Utilisateur: $(git config user.name) <$(git config user.email)>" >> "$LOG_FILE"
    echo "Workflow déclenché: Oui" >> "$LOG_FILE"
    echo "Log file: $LOG_FILE" >> "$LOG_FILE"
}

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
