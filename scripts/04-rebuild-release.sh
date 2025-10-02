#!/bin/bash

# FR: Script pour reconstruire les binaires d'une release existante
# EN: Script to rebuild binaries for an existing release
# Usage: ./scripts/04-rebuild-release.sh v0.2.0

set -e

# Configuration des logs
LOG_DIR="logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/rebuild_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

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

check_prerequisites() {
    log "INFO" "🔍 Vérification des prérequis"
    
    # Vérifier que GitHub CLI est installé
    if ! command -v gh &> /dev/null; then
        log "ERROR" "❌ GitHub CLI (gh) n'est pas installé"
        log "ERROR" ""
        log "ERROR" "🔧 INSTALLATION GITHUB CLI :"
        log "ERROR" ""
        log "ERROR" "1️⃣ Sur macOS :"
        log "ERROR" "   brew install gh"
        log "ERROR" ""
        log "ERROR" "2️⃣ Sur Ubuntu/Debian :"
        log "ERROR" "   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
        log "ERROR" "   echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
        log "ERROR" "   sudo apt update"
        log "ERROR" "   sudo apt install gh"
        log "ERROR" ""
        log "ERROR" "3️⃣ Autres systèmes :"
        log "ERROR" "   https://github.com/cli/cli#installation"
        log "ERROR" ""
        exit 1
    fi
    
    # Vérifier qu'on est authentifié
    if ! gh auth status &> /dev/null; then
        log "ERROR" "❌ Vous n'êtes pas authentifié avec GitHub CLI"
        log "ERROR" ""
        log "ERROR" "🔧 AUTHENTIFICATION GITHUB :"
        log "ERROR" ""
        log "ERROR" "1️⃣ Authentification interactive :"
        log "ERROR" "   gh auth login"
        log "ERROR" "   # Choisir: GitHub.com > HTTPS > Yes > Login with browser"
        log "ERROR" ""
        log "ERROR" "2️⃣ Avec un token personnel :"
        log "ERROR" "   # Créer un token sur: https://github.com/settings/tokens"
        log "ERROR" "   # Permissions requises: repo, workflow, write:packages"
        log "ERROR" "   gh auth login --with-token < token.txt"
        log "ERROR" ""
        log "ERROR" "3️⃣ Vérifier l'authentification :"
        log "ERROR" "   gh auth status"
        log "ERROR" "   gh repo view"
        log "ERROR" ""
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
        log "ERROR" "❌ Le tag '$tag' n'existe pas localement"
        log "ERROR" ""
        log "ERROR" "🔧 RÉCUPÉRATION DES TAGS :"
        log "ERROR" ""
        log "ERROR" "1️⃣ Synchroniser les tags depuis GitHub :"
        log "ERROR" "   git fetch --tags"
        log "ERROR" "   git tag --sort=-version:refname | head -10"
        log "ERROR" ""
        log "ERROR" "2️⃣ Vérifier les tags disponibles :"
        log "ERROR" "   git tag -l"
        log "ERROR" ""
        log "ERROR" "3️⃣ Tags récents disponibles :"
        git tag --sort=-version:refname | head -10 | while read -r t; do
            log "ERROR" "   $t"
        done
        log "ERROR" ""
        log "ERROR" "4️⃣ Si le tag n'existe pas, créer une release :"
        log "ERROR" "   ./scripts/03-create-release.sh"
        log "ERROR" ""
        exit 1
    fi
    
    # Vérifier que la release existe sur GitHub
    if ! gh release view "$tag" &> /dev/null; then
        log "ERROR" "❌ La release '$tag' n'existe pas sur GitHub"
        log "ERROR" ""
        log "ERROR" "🔧 CRÉATION DE LA RELEASE GITHUB :"
        log "ERROR" ""
        log "ERROR" "1️⃣ Créer la release manuellement :"
        log "ERROR" "   gh release create $tag --title \"Release $tag\" --notes \"Release $tag\""
        log "ERROR" ""
        log "ERROR" "2️⃣ Ou utiliser le script de release :"
        log "ERROR" "   ./scripts/03-create-release.sh"
        log "ERROR" ""
        log "ERROR" "3️⃣ Vérifier les releases existantes :"
        log "ERROR" "   gh release list"
        log "ERROR" ""
        log "ERROR" "4️⃣ Releases disponibles :"
        gh release list --limit 10 | while IFS=$'\t' read -r title tag_name status date; do
            log "ERROR" "   $tag_name - $title ($status)"
        done 2>/dev/null || log "ERROR" "   Aucune release trouvée"
        log "ERROR" ""
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
        log "ERROR" ""
        log "ERROR" "🔧 DIAGNOSTIC DU WORKFLOW :"
        log "ERROR" ""
        log "ERROR" "1️⃣ Vérifier l'existence du workflow :"
        log "ERROR" "   gh workflow list"
        log "ERROR" "   gh workflow view release.yml"
        log "ERROR" ""
        log "ERROR" "2️⃣ Vérifier les permissions :"
        log "ERROR" "   gh auth status"
        log "ERROR" "   gh auth refresh -s workflow"
        log "ERROR" ""
        log "ERROR" "3️⃣ Déclencher manuellement via l'interface :"
        log "ERROR" "   https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/actions/workflows/release.yml"
        log "ERROR" "   # Cliquer sur 'Run workflow' et sélectionner le tag $tag"
        log "ERROR" ""
        log "ERROR" "4️⃣ Vérifier les workflows récents :"
        log "ERROR" "   gh run list --limit 10"
        log "ERROR" ""
        log "ERROR" "5️⃣ Alternative - créer une nouvelle release :"
        log "ERROR" "   ./scripts/03-create-release.sh"
        log "ERROR" ""
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
