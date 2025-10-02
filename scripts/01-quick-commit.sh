#!/bin/bash

# FR: Script de commit rapide pour BigMind
# EN: Quick commit script for BigMind
# Usage: ./scripts/quick-commit.sh "message de commit"

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

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
    esac
}

main() {
    local commit_message="$1"
    
    if [[ -z "$commit_message" ]]; then
        commit_message="feat: quick commit - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    cd "$PROJECT_ROOT"
    
    log "INFO" "🚀 Commit rapide BigMind"
    
    # Vérifier s'il y a des changements
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log "INFO" "📝 Changements détectés"
        
        # Build rapide pour vérifier que tout compile
        log "INFO" "🔨 Vérification de la compilation..."
        if pnpm build --filter bigmind-web > /dev/null 2>&1; then
            log "INFO" "✅ Compilation réussie"
        else
            log "ERROR" "❌ Échec de la compilation"
            log "ERROR" ""
            log "ERROR" "🔧 COMMANDES DE RÉPARATION IMMÉDIATE :"
            log "ERROR" ""
            log "ERROR" "1️⃣ Diagnostic rapide des erreurs :"
            log "ERROR" "   pnpm build --filter bigmind-web"
            log "ERROR" ""
            log "ERROR" "2️⃣ Si erreurs TypeScript :"
            log "ERROR" "   pnpm type-check --filter bigmind-web"
            log "ERROR" ""
            log "ERROR" "3️⃣ Si problème de dépendances :"
            log "ERROR" "   rm -rf node_modules"
            log "ERROR" "   pnpm install"
            log "ERROR" "   pnpm build --filter bigmind-web"
            log "ERROR" ""
            log "ERROR" "4️⃣ Si problème persiste :"
            log "ERROR" "   ./scripts/02-debug-and-commit.sh \"$COMMIT_MESSAGE\""
            log "ERROR" ""
            log "ERROR" "5️⃣ Nettoyage complet (dernier recours) :"
            log "ERROR" "   rm -rf node_modules packages/*/node_modules apps/*/node_modules"
            log "ERROR" "   rm -rf packages/*/dist apps/*/dist"
            log "ERROR" "   pnpm install"
            log "ERROR" ""
            exit 1
        fi
        
        # Commit
        log "INFO" "📝 Création du commit..."
        git add .
        git commit -m "$commit_message"
        
        local commit_hash=$(git rev-parse HEAD)
        log "INFO" "✅ Commit créé: $commit_hash"
        log "INFO" "📋 Message: $commit_message"
        
    else
        log "WARN" "⚠️ Aucun changement à commiter"
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
