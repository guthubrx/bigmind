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

# Fonction de diagnostic et réparation automatique pour GitHub CLI
auto_diagnose_github_cmd() {
    local description="$1"
    local command="$2"
    local temp_log=$(mktemp)
    
    log "DEBUG" "🔍 DIAGNOSTIC AUTOMATIQUE: $description"
    
    # Exécuter la commande et capturer la sortie
    if eval "$command" > "$temp_log" 2>&1; then
        log "SUCCESS" "$description - Succès"
        rm -f "$temp_log"
        return 0
    fi
    
    local exit_code=$?
    log "ERROR" "❌ $description - Échec (code: $exit_code)"
    
    # Analyser le type d'erreur GitHub CLI
    local error_type=""
    local auto_fix_available=false
    local specific_errors=""
    
    if grep -q "authentication\|auth\|login\|token" "$temp_log"; then
        error_type="github_auth_error"
        auto_fix_available=true
        specific_errors=$(grep -i "auth\|login\|token" "$temp_log" | head -3)
    elif grep -q "not found\|404\|repository" "$temp_log"; then
        error_type="github_not_found"
        auto_fix_available=false
        specific_errors=$(grep -E "(not found|404|repository)" "$temp_log" | head -3)
    elif grep -q "rate limit\|API rate limit" "$temp_log"; then
        error_type="github_rate_limit"
        auto_fix_available=false
        specific_errors=$(grep -i "rate limit" "$temp_log" | head -3)
    elif grep -q "network\|connection\|timeout" "$temp_log"; then
        error_type="network_error"
        auto_fix_available=true
        specific_errors=$(grep -E "(network|connection|timeout)" "$temp_log" | head -3)
    elif grep -q "permission\|forbidden\|403" "$temp_log"; then
        error_type="github_permission"
        auto_fix_available=true
        specific_errors=$(grep -E "(permission|forbidden|403)" "$temp_log" | head -3)
    else
        error_type="unknown_github_error"
        auto_fix_available=false
        specific_errors=$(head -10 "$temp_log" | grep -E "(error|Error|ERROR)" | head -3)
    fi
    
    log "ERROR" "🎯 Type d'erreur GitHub: $error_type"
    
    # Tentative de réparation automatique
    if [ "$auto_fix_available" = true ]; then
        log "INFO" "🔧 RÉPARATION AUTOMATIQUE DISPONIBLE"
        
        case "$error_type" in
            "github_auth_error")
                log "INFO" "   Tentative de réauthentification..."
                if [ -n "$specific_errors" ]; then
                    log "INFO" "📋 Erreurs d'authentification détectées:"
                    echo "$specific_errors" | while read -r error; do
                        [ -n "$error" ] && log "INFO" "   - $error"
                    done
                fi
                
                # Vérifier le statut d'authentification
                if gh auth status 2>&1 | tee -a "$temp_log.auth"; then
                    log "INFO" "✅ Authentification OK - problème temporaire"
                    # Tester à nouveau
                    if eval "$command" > /dev/null 2>&1; then
                        log "SUCCESS" "🎉 RÉPARATION RÉUSSIE !"
                        rm -f "$temp_log" "$temp_log.auth"
                        return 0
                    fi
                else
                    log "WARN" "⚠️ Authentification requise - intervention manuelle nécessaire"
                fi
                ;;
                
            "network_error")
                log "INFO" "   Tentative de reconnexion réseau..."
                if [ -n "$specific_errors" ]; then
                    log "INFO" "📋 Erreurs réseau détectées:"
                    echo "$specific_errors" | while read -r error; do
                        [ -n "$error" ] && log "INFO" "   - $error"
                    done
                fi
                
                # Attendre un peu et réessayer
                log "INFO" "   Attente de 5 secondes..."
                sleep 5
                if eval "$command" > /dev/null 2>&1; then
                    log "SUCCESS" "🎉 RÉPARATION RÉUSSIE !"
                    rm -f "$temp_log"
                    return 0
                fi
                ;;
                
            "github_permission")
                log "INFO" "   Tentative de rafraîchissement des permissions..."
                if [ -n "$specific_errors" ]; then
                    log "INFO" "📋 Erreurs de permissions détectées:"
                    echo "$specific_errors" | while read -r error; do
                        [ -n "$error" ] && log "INFO" "   - $error"
                    done
                fi
                
                # Rafraîchir les permissions
                if gh auth refresh -s workflow,repo 2>&1 | tee -a "$temp_log.perms"; then
                    log "INFO" "✅ Permissions rafraîchies"
                    # Tester à nouveau
                    if eval "$command" > /dev/null 2>&1; then
                        log "SUCCESS" "🎉 RÉPARATION RÉUSSIE !"
                        rm -f "$temp_log" "$temp_log.perms"
                        return 0
                    fi
                fi
                ;;
        esac
        
        log "WARN" "⚠️ La réparation automatique n'a pas résolu le problème"
    fi
    
    # Afficher les diagnostics détaillés pour handoff IA/Expert
    log "ERROR" ""
    log "ERROR" "🚨 ÉCHEC GITHUB CLI - DIAGNOSTIC POUR EXPERT/IA :"
    log "ERROR" ""
    log "ERROR" "🤖 CONTEXTE TECHNIQUE COMPLET :"
    log "ERROR" "   - Commande échouée: $command"
    log "ERROR" "   - Description: $description"
    log "ERROR" "   - Code de sortie: $exit_code"
    log "ERROR" "   - Type d'erreur: $error_type"
    log "ERROR" "   - OS: $(uname -s) $(uname -r)"
    log "ERROR" "   - GitHub CLI: $(gh --version 2>/dev/null | head -1 || echo 'N/A')"
    log "ERROR" "   - PWD: $(pwd)"
    log "ERROR" "   - Repo: $(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || echo 'N/A')"
    log "ERROR" ""
    
    if [ -n "$specific_errors" ]; then
        log "ERROR" "🔍 ERREURS GITHUB SPÉCIFIQUES :"
        echo "$specific_errors" | while read -r error; do
            [ -n "$error" ] && log "ERROR" "   ERROR: $error"
        done
    else
        log "ERROR" "📋 LOG BRUT GITHUB CLI :"
        head -15 "$temp_log" | while read -r line; do
            log "ERROR" "   RAW: $line"
        done
    fi
    
    log "ERROR" ""
    log "ERROR" "📝 LOGS DÉTAILLÉS SAUVEGARDÉS :"
    log "ERROR" "   - Log principal: $LOG_FILE"
    log "ERROR" "   - Log de l'erreur: $temp_log"
    log "ERROR" ""
    
    case "$error_type" in
        "github_auth_error")
            log "ERROR" "🔧 COMMANDES DE RÉPARATION AUTHENTIFICATION :"
            log "ERROR" "   1. Réauthentification: gh auth login"
            log "ERROR" "   2. Vérifier le statut: gh auth status"
            log "ERROR" "   3. Rafraîchir le token: gh auth refresh"
            ;;
        "github_not_found")
            log "ERROR" "🔧 COMMANDES DE VÉRIFICATION REPOSITORY :"
            log "ERROR" "   1. Vérifier le repo: gh repo view"
            log "ERROR" "   2. Lister les releases: gh release list"
            log "ERROR" "   3. Vérifier les tags: git tag -l"
            ;;
        "github_rate_limit")
            log "ERROR" "🔧 GESTION RATE LIMIT :"
            log "ERROR" "   1. Attendre: sleep 3600  # 1 heure"
            log "ERROR" "   2. Vérifier les limites: gh api rate_limit"
            log "ERROR" "   3. Utiliser un token avec plus de quota"
            ;;
        *)
            log "ERROR" "🔧 COMMANDES DE DIAGNOSTIC GÉNÉRAL :"
            log "ERROR" "   1. Voir le log complet: cat $temp_log"
            log "ERROR" "   2. Tester GitHub CLI: gh auth status && gh repo view"
            log "ERROR" "   3. Relancer: $command"
            ;;
    esac
    
    log "ERROR" ""
    return $exit_code
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
    
    # Déclencher le workflow sur le tag spécifique avec diagnostic automatique
    if auto_diagnose_github_cmd "Déclenchement du workflow release.yml" "gh workflow run release.yml --ref $tag"; then
        log "INFO" "✅ Workflow déclenché avec succès"
        
        # Attendre un peu puis afficher le lien
        sleep 2
        local repo_info=$(gh repo view --json owner,name -q '.owner.login + "/" + .name')
        log "INFO" "🔗 Surveillez le workflow: https://github.com/$repo_info/actions"
        
        # Afficher les workflows en cours
        log "INFO" "📊 Workflows en cours:"
        gh run list --workflow=release.yml --limit 3
        
    else
        # Le diagnostic automatique a échoué - les détails sont déjà affichés
        log "ERROR" "🚨 ARRÊT - Impossible de déclencher le workflow pour $tag"
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
