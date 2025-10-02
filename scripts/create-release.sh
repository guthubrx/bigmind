#!/bin/bash

# FR: Script de création de release manuelle pour BigMind
# EN: Manual release creation script for BigMind
# Usage: ./scripts/create-release.sh [patch|minor|major]

set -e

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
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} $message"
            ;;
    esac
}

check_prerequisites() {
    log "INFO" "🔍 Vérification des prérequis"
    
    # Vérifier qu'on est sur main
    local current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "main" ]]; then
        log "ERROR" "❌ Vous devez être sur la branche 'main' pour créer une release"
        log "INFO" "💡 Branche actuelle: $current_branch"
        exit 1
    fi
    
    # Vérifier qu'il n'y a pas de changements non commités
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log "ERROR" "❌ Il y a des changements non commités"
        log "INFO" "💡 Commitez ou stashez vos changements avant de créer une release"
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
    
    # Build des packages
    if ! pnpm build --filter @bigmind/core; then
        log "ERROR" "❌ Échec du build du package core"
        exit 1
    fi
    
    if ! pnpm build --filter @bigmind/design; then
        log "ERROR" "❌ Échec du build du package design"
        exit 1
    fi
    
    if ! pnpm build --filter @bigmind/ui; then
        log "ERROR" "❌ Échec du build du package ui"
        exit 1
    fi
    
    if ! pnpm build --filter bigmind-web; then
        log "ERROR" "❌ Échec du build de l'application web"
        exit 1
    fi
    
    log "INFO" "✅ Build réussi"
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
    
    log "INFO" "🎉 Release créée avec succès!"
    log "INFO" "📋 Tag: v$next_version"
    log "INFO" "🔗 Les binaires seront disponibles une fois le workflow terminé"
}

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
