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

# Fonction de diagnostic et réparation automatique
auto_diagnose_and_fix() {
    local commit_message="$1"
    local temp_log=$(mktemp)
    
    log "INFO" "🔍 DIAGNOSTIC AUTOMATIQUE EN COURS..."
    log "INFO" ""
    
    # Étape 1: Diagnostic détaillé pour identifier le type d'erreur
    log "INFO" "1️⃣ Analyse des erreurs de compilation..."
    pnpm build --filter bigmind-web > "$temp_log" 2>&1
    local build_exit_code=$?
    
    # Analyser le type d'erreur
    local error_type=""
    local fix_attempted=false
    
    if grep -q "Cannot find module\|Module not found" "$temp_log"; then
        error_type="missing_dependencies"
    elif grep -q "Type error\|TS[0-9]" "$temp_log"; then
        error_type="typescript_error"
    elif grep -q "ENOENT\|node_modules" "$temp_log"; then
        error_type="missing_node_modules"
    elif grep -q "version\|peer dep\|ERESOLVE" "$temp_log"; then
        error_type="dependency_conflict"
    else
        error_type="unknown"
    fi
    
    log "INFO" "🎯 Type d'erreur détecté: $error_type"
    log "INFO" ""
    
    # Étape 2: Appliquer la réparation automatique selon le type
    case "$error_type" in
        "missing_node_modules")
            log "INFO" "2️⃣ RÉPARATION: Installation des dépendances manquantes..."
            log "INFO" "   Commande: pnpm install"
            if pnpm install; then
                log "INFO" "✅ Installation réussie"
                fix_attempted=true
            else
                log "ERROR" "❌ Échec de l'installation"
            fi
            ;;
            
        "missing_dependencies")
            log "INFO" "2️⃣ RÉPARATION: Réinstallation complète des dépendances..."
            log "INFO" "   Commandes: rm -rf node_modules && pnpm install"
            rm -rf node_modules
            if pnpm install; then
                log "INFO" "✅ Réinstallation réussie"
                fix_attempted=true
            else
                log "ERROR" "❌ Échec de la réinstallation"
            fi
            ;;
            
        "dependency_conflict")
            log "INFO" "2️⃣ RÉPARATION: Résolution des conflits de dépendances..."
            log "INFO" "   Commandes: rm -rf node_modules pnpm-lock.yaml && pnpm install"
            rm -rf node_modules pnpm-lock.yaml
            if pnpm install; then
                log "INFO" "✅ Conflits résolus"
                fix_attempted=true
            else
                log "ERROR" "❌ Échec de la résolution"
            fi
            ;;
            
        "typescript_error")
            log "INFO" "2️⃣ DIAGNOSTIC: Vérification TypeScript détaillée..."
            log "INFO" "   Commande: pnpm type-check --filter bigmind-web"
            pnpm type-check --filter bigmind-web
            log "WARN" "⚠️ Erreurs TypeScript détectées - correction manuelle requise"
            log "INFO" "💡 Vérifiez les erreurs ci-dessus et corrigez le code source"
            ;;
            
        *)
            log "WARN" "⚠️ Type d'erreur non reconnu - diagnostic approfondi requis"
            log "INFO" "📋 Erreurs détectées:"
            cat "$temp_log" | head -20
            ;;
    esac
    
    # Étape 3: Tester si la réparation a fonctionné
    if [ "$fix_attempted" = true ]; then
        log "INFO" ""
        log "INFO" "3️⃣ VÉRIFICATION: Test de la réparation..."
        log "INFO" "   Commande: pnpm build --filter bigmind-web"
        
        if pnpm build --filter bigmind-web > /dev/null 2>&1; then
            log "INFO" "🎉 RÉPARATION RÉUSSIE ! Compilation OK"
            log "INFO" ""
            
            # Continuer avec le commit
            log "INFO" "📝 Création du commit..."
            git add .
            git commit -m "$commit_message"
            log "INFO" "✅ Commit créé avec succès !"
            
            # Nettoyer et sortir
            rm -f "$temp_log"
            return 0
        else
            log "ERROR" "❌ La réparation n'a pas résolu le problème"
            log "INFO" ""
        fi
    fi
    
    # Étape 4: Si rien n'a fonctionné, proposer des solutions avancées
    log "ERROR" "🚨 RÉPARATION AUTOMATIQUE ÉCHOUÉE"
    log "ERROR" ""
    log "ERROR" "🔧 OPTIONS AVANCÉES :"
    log "ERROR" ""
    log "ERROR" "1️⃣ Nettoyage complet (automatique) :"
    log "ERROR" "   Tapez 'y' pour lancer: rm -rf node_modules packages/*/node_modules apps/*/node_modules && pnpm install"
    log "ERROR" ""
    log "ERROR" "2️⃣ Diagnostic approfondi :"
    log "ERROR" "   ./scripts/02-debug-and-commit.sh \"$commit_message\""
    log "ERROR" ""
    log "ERROR" "3️⃣ Voir les erreurs complètes :"
    log "ERROR" "   cat $temp_log"
    log "ERROR" ""
    
    # Demander à l'utilisateur s'il veut le nettoyage complet automatique
    if [ -t 0 ]; then # Vérifier si on est dans un terminal interactif
        read -p "Voulez-vous lancer le nettoyage complet automatique ? (y/N): " -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            log "INFO" "🧹 NETTOYAGE COMPLET EN COURS..."
            log "INFO" "   Suppression de tous les node_modules..."
            rm -rf node_modules packages/*/node_modules apps/*/node_modules
            rm -rf packages/*/dist apps/*/dist
            
            log "INFO" "   Réinstallation complète..."
            if pnpm install; then
                log "INFO" "   Test final..."
                if pnpm build --filter bigmind-web > /dev/null 2>&1; then
                    log "INFO" "🎉 NETTOYAGE RÉUSSI ! Compilation OK"
                    
                    # Commit final
                    git add .
                    git commit -m "$commit_message"
                    log "INFO" "✅ Commit créé avec succès !"
                    rm -f "$temp_log"
                    return 0
                fi
            fi
            log "ERROR" "❌ Le nettoyage complet a échoué"
        fi
    fi
    
    # Nettoyer et sortir en erreur
    rm -f "$temp_log"
    log "ERROR" "💡 Utilisez ./scripts/02-debug-and-commit.sh pour un diagnostic complet"
    exit 1
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
            log "INFO" "🔍 Lancement du diagnostic automatique..."
            
            # Diagnostic et réparation automatique
            auto_diagnose_and_fix "$commit_message"
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
