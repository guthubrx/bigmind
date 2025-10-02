#!/bin/bash

# FR: Script pour reconstruire les binaires d'une release existante
# EN: Script to rebuild binaries for an existing release
# Usage: ./scripts/rebuild-release.sh v0.2.0

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    
    # Vérifier que GitHub CLI est installé
    if ! command -v gh &> /dev/null; then
        log "ERROR" "❌ GitHub CLI (gh) n'est pas installé"
        log "INFO" "💡 Installez avec: brew install gh"
        exit 1
    fi
    
    # Vérifier qu'on est authentifié
    if ! gh auth status &> /dev/null; then
        log "ERROR" "❌ Vous n'êtes pas authentifié avec GitHub CLI"
        log "INFO" "💡 Exécutez: gh auth login"
        exit 1
    fi
    
    log "INFO" "✅ Prérequis satisfaits"
}

list_releases() {
    log "INFO" "📋 Releases disponibles:"
    gh release list --limit 10
}

validate_tag() {
    local tag="$1"
    
    if [[ -z "$tag" ]]; then
        log "ERROR" "❌ Aucun tag spécifié"
        log "INFO" "💡 Usage: $0 <tag>"
        list_releases
        exit 1
    fi
    
    # Vérifier que le tag existe
    if ! git tag -l | grep -q "^$tag$"; then
        log "ERROR" "❌ Le tag '$tag' n'existe pas"
        log "INFO" "💡 Tags disponibles:"
        git tag --sort=-version:refname | head -10
        exit 1
    fi
    
    # Vérifier que la release existe sur GitHub
    if ! gh release view "$tag" &> /dev/null; then
        log "ERROR" "❌ La release '$tag' n'existe pas sur GitHub"
        list_releases
        exit 1
    fi
    
    log "INFO" "✅ Tag '$tag' validé"
}

trigger_workflow() {
    local tag="$1"
    
    log "INFO" "🚀 Déclenchement du workflow de release pour $tag"
    
    # Déclencher le workflow sur le tag spécifique
    if gh workflow run release.yml --ref "$tag"; then
        log "INFO" "✅ Workflow déclenché avec succès"
        
        # Attendre un peu puis afficher le lien
        sleep 2
        local repo_info=$(gh repo view --json owner,name -q '.owner.login + "/" + .name')
        log "INFO" "🔗 Surveillez le workflow: https://github.com/$repo_info/actions"
        
        # Afficher les workflows en cours
        log "INFO" "📊 Workflows en cours:"
        gh run list --workflow=release.yml --limit 3
        
    else
        log "ERROR" "❌ Échec du déclenchement du workflow"
        exit 1
    fi
}

show_release_info() {
    local tag="$1"
    
    log "INFO" "📋 Informations sur la release $tag:"
    gh release view "$tag"
}

main() {
    local tag="$1"
    
    log "INFO" "🔄 Script de reconstruction de binaires pour release existante"
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Si aucun tag fourni, lister les releases
    if [[ -z "$tag" ]]; then
        log "INFO" "📋 Aucun tag spécifié. Releases disponibles:"
        list_releases
        echo ""
        log "INFO" "💡 Usage: $0 <tag>"
        log "INFO" "💡 Exemple: $0 v0.2.0"
        exit 0
    fi
    
    # Valider le tag
    validate_tag "$tag"
    
    # Afficher les infos de la release
    show_release_info "$tag"
    
    # Demander confirmation
    echo ""
    echo -e "${YELLOW}Voulez-vous reconstruire les binaires pour la release $tag ? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "INFO" "❌ Reconstruction annulée"
        exit 0
    fi
    
    # Déclencher le workflow
    trigger_workflow "$tag"
    
    log "INFO" "🎉 Reconstruction lancée!"
    log "INFO" "⏳ Les nouveaux binaires seront disponibles une fois le workflow terminé"
    log "INFO" "📦 Ils seront automatiquement ajoutés à la release $tag"
}

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
