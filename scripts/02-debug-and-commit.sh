#!/bin/bash

# FR: Script de débogage et commit pour BigMind
# EN: Debug and commit script for BigMind
# Usage: ./scripts/debug-and-commit.sh [message de commit]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/debug_$TIMESTAMP.log"

# Créer le répertoire de logs s'il n'existe pas
mkdir -p "$LOG_DIR"

# Fonction de logging
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        *)
            echo "[$timestamp] $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Fonction pour exécuter une commande avec logging
run_command() {
    local description="$1"
    shift
    local command="$*"
    
    log "INFO" "🔄 $description"
    log "DEBUG" "Commande: $command"
    
    if eval "$command" >> "$LOG_FILE" 2>&1; then
        log "INFO" "✅ $description - Succès"
        return 0
    else
        local exit_code=$?
        log "ERROR" "❌ $description - Échec (code: $exit_code)"
        log "ERROR" "Commande échouée: $command"
        log "ERROR" ""
        
        # Diagnostics spécifiques selon le type de commande
        case "$command" in
            *"pnpm build --filter @bigmind/core"*)
                log "ERROR" "🔧 RÉPARATION PACKAGE CORE :"
                log "ERROR" "1️⃣ Diagnostic immédiat :"
                log "ERROR" "   cd packages/core"
                log "ERROR" "   pnpm build --verbose"
                log "ERROR" "   pnpm type-check"
                log "ERROR" ""
                log "ERROR" "2️⃣ Nettoyer et rebuilder :"
                log "ERROR" "   rm -rf packages/core/node_modules packages/core/dist"
                log "ERROR" "   pnpm install --filter @bigmind/core"
                log "ERROR" "   pnpm build --filter @bigmind/core"
                ;;
            *"pnpm build --filter @bigmind/design"*)
                log "ERROR" "🔧 RÉPARATION PACKAGE DESIGN :"
                log "ERROR" "1️⃣ Diagnostic immédiat :"
                log "ERROR" "   cd packages/design"
                log "ERROR" "   pnpm build --verbose"
                log "ERROR" "   pnpm type-check"
                log "ERROR" ""
                log "ERROR" "2️⃣ Vérifier les dépendances :"
                log "ERROR" "   pnpm list --filter @bigmind/design"
                log "ERROR" "   rm -rf packages/design/node_modules packages/design/dist"
                log "ERROR" "   pnpm install --filter @bigmind/design"
                ;;
            *"pnpm build --filter @bigmind/ui"*)
                log "ERROR" "🔧 RÉPARATION PACKAGE UI :"
                log "ERROR" "1️⃣ Diagnostic immédiat :"
                log "ERROR" "   cd packages/ui"
                log "ERROR" "   pnpm build --verbose"
                log "ERROR" "   pnpm type-check"
                log "ERROR" ""
                log "ERROR" "2️⃣ Nettoyer et rebuilder :"
                log "ERROR" "   rm -rf packages/ui/node_modules packages/ui/dist"
                log "ERROR" "   pnpm install --filter @bigmind/ui"
                ;;
            *"pnpm build --filter bigmind-web"*)
                log "ERROR" "🔧 RÉPARATION APPLICATION WEB :"
                log "ERROR" "1️⃣ Diagnostic immédiat :"
                log "ERROR" "   cd apps/web"
                log "ERROR" "   pnpm build --verbose"
                log "ERROR" "   pnpm type-check"
                log "ERROR" ""
                log "ERROR" "2️⃣ Vérifier les dépendances des packages :"
                log "ERROR" "   pnpm build --filter @bigmind/core"
                log "ERROR" "   pnpm build --filter @bigmind/design"
                log "ERROR" "   pnpm build --filter @bigmind/ui"
                log "ERROR" "   pnpm build --filter bigmind-web"
                ;;
            *"pnpm lint"*)
                log "ERROR" "🔧 RÉPARATION LINTING :"
                log "ERROR" "1️⃣ Voir les erreurs détaillées :"
                log "ERROR" "   pnpm lint --filter bigmind-web"
                log "ERROR" ""
                log "ERROR" "2️⃣ Auto-fix des erreurs simples :"
                log "ERROR" "   pnpm lint --filter bigmind-web --fix"
                log "ERROR" ""
                log "ERROR" "3️⃣ Vérifier la config ESLint :"
                log "ERROR" "   cat apps/web/.eslintrc.cjs"
                ;;
            *"pnpm install"*)
                log "ERROR" "🔧 RÉPARATION INSTALLATION :"
                log "ERROR" "1️⃣ Nettoyer le cache :"
                log "ERROR" "   pnpm store prune"
                log "ERROR" "   rm -rf node_modules pnpm-lock.yaml"
                log "ERROR" "   pnpm install"
                log "ERROR" ""
                log "ERROR" "2️⃣ Si problème persiste :"
                log "ERROR" "   rm -rf ~/.pnpm-store"
                log "ERROR" "   pnpm install"
                ;;
            *)
                log "ERROR" "🔧 RÉPARATION GÉNÉRALE :"
                log "ERROR" "1️⃣ Réexécuter avec plus de détails :"
                log "ERROR" "   $command --verbose"
                log "ERROR" ""
                log "ERROR" "2️⃣ Vérifier les prérequis :"
                log "ERROR" "   node --version"
                log "ERROR" "   pnpm --version"
                log "ERROR" "   git status"
                ;;
        esac
        
        log "ERROR" ""
        log "ERROR" "3️⃣ NETTOYAGE COMPLET (si tout échoue) :"
        log "ERROR" "   rm -rf node_modules packages/*/node_modules apps/*/node_modules"
        log "ERROR" "   rm -rf packages/*/dist apps/*/dist"
        log "ERROR" "   pnpm install"
        log "ERROR" ""
        log "ERROR" "📝 Logs détaillés dans: $LOG_FILE"
        log "ERROR" ""
        
        return $exit_code
    fi
}

# Fonction de diagnostic et réparation automatique avancée
auto_diagnose_and_repair() {
    local description="$1"
    local command="$2"
    local temp_log=$(mktemp)
    
    log "INFO" "🔍 DIAGNOSTIC AUTOMATIQUE: $description"
    
    # Exécuter la commande et capturer la sortie
    if eval "$command" > "$temp_log" 2>&1; then
        log "INFO" "✅ $description - Succès"
        rm -f "$temp_log"
        return 0
    fi
    
    local exit_code=$?
    log "ERROR" "❌ $description - Échec (code: $exit_code)"
    
    # Analyser le type d'erreur et proposer une réparation automatique
    local error_type=""
    local auto_fix_available=false
    
    # Détection intelligente du type d'erreur
    if grep -q "Cannot find module\|Module not found\|ERR_MODULE_NOT_FOUND" "$temp_log"; then
        error_type="missing_module"
        auto_fix_available=true
    elif grep -q "ENOENT.*node_modules\|pnpm-lock.yaml" "$temp_log"; then
        error_type="missing_dependencies"
        auto_fix_available=true
    elif grep -q "Type error\|TS[0-9]\|TypeScript" "$temp_log"; then
        error_type="typescript_error"
        auto_fix_available=false
    elif grep -q "ERESOLVE\|peer dep\|version conflict" "$temp_log"; then
        error_type="dependency_conflict"
        auto_fix_available=true
    elif grep -q "EACCES\|permission denied" "$temp_log"; then
        error_type="permission_error"
        auto_fix_available=true
    elif grep -q "ENOSPC\|no space left" "$temp_log"; then
        error_type="disk_space"
        auto_fix_available=false
    else
        error_type="unknown"
        auto_fix_available=false
    fi
    
    log "ERROR" "🎯 Type d'erreur: $error_type"
    
    # Tentative de réparation automatique
    if [ "$auto_fix_available" = true ]; then
        log "INFO" "🔧 RÉPARATION AUTOMATIQUE DISPONIBLE"
        
        case "$error_type" in
            "missing_module"|"missing_dependencies")
                log "INFO" "   Réinstallation des dépendances..."
                if rm -rf node_modules && pnpm install; then
                    log "INFO" "✅ Dépendances réinstallées"
                    # Tester à nouveau
                    if eval "$command" > /dev/null 2>&1; then
                        log "INFO" "🎉 RÉPARATION RÉUSSIE !"
                        rm -f "$temp_log"
                        return 0
                    fi
                fi
                ;;
                
            "dependency_conflict")
                log "INFO" "   Résolution des conflits de dépendances..."
                if rm -rf node_modules pnpm-lock.yaml && pnpm install; then
                    log "INFO" "✅ Conflits résolus"
                    # Tester à nouveau
                    if eval "$command" > /dev/null 2>&1; then
                        log "INFO" "🎉 RÉPARATION RÉUSSIE !"
                        rm -f "$temp_log"
                        return 0
                    fi
                fi
                ;;
                
            "permission_error")
                log "INFO" "   Correction des permissions..."
                if sudo chown -R $(whoami) node_modules 2>/dev/null; then
                    log "INFO" "✅ Permissions corrigées"
                    # Tester à nouveau
                    if eval "$command" > /dev/null 2>&1; then
                        log "INFO" "🎉 RÉPARATION RÉUSSIE !"
                        rm -f "$temp_log"
                        return 0
                    fi
                fi
                ;;
        esac
        
        log "WARN" "⚠️ La réparation automatique n'a pas résolu le problème"
    fi
    
    # Afficher les diagnostics détaillés
    log "ERROR" ""
    log "ERROR" "🔧 DIAGNOSTICS DÉTAILLÉS :"
    log "ERROR" ""
    
    case "$error_type" in
        "typescript_error")
            log "ERROR" "📋 Erreurs TypeScript détectées:"
            grep -E "(TS[0-9]+|Type error|error TS)" "$temp_log" | head -10 | while read -r line; do
                log "ERROR" "   $line"
            done
            log "ERROR" ""
            log "ERROR" "🔧 COMMANDES DE RÉPARATION MANUELLE :"
            log "ERROR" "   1. Vérifier la syntaxe TypeScript:"
            log "ERROR" "      pnpm type-check --filter bigmind-web"
            log "ERROR" "   2. Corriger les erreurs dans le code source"
            log "ERROR" "   3. Relancer: $command"
            ;;
            
        "disk_space")
            log "ERROR" "💾 Problème d'espace disque détecté"
            log "ERROR" "🔧 COMMANDES DE NETTOYAGE :"
            log "ERROR" "   1. Vérifier l'espace disponible:"
            log "ERROR" "      df -h"
            log "ERROR" "   2. Nettoyer les caches:"
            log "ERROR" "      pnpm store prune"
            log "ERROR" "      rm -rf ~/.npm/_cacache"
            log "ERROR" "   3. Nettoyer les node_modules:"
            log "ERROR" "      find . -name 'node_modules' -type d -exec rm -rf {} +"
            ;;
            
        *)
            log "ERROR" "📋 Erreurs complètes (20 premières lignes):"
            cat "$temp_log" | head -20 | while read -r line; do
                log "ERROR" "   $line"
            done
            log "ERROR" ""
            log "ERROR" "🔧 COMMANDES DE DIAGNOSTIC GÉNÉRAL :"
            log "ERROR" "   1. Voir toutes les erreurs:"
            log "ERROR" "      cat $temp_log"
            log "ERROR" "   2. Nettoyage complet:"
            log "ERROR" "      rm -rf node_modules packages/*/node_modules apps/*/node_modules"
            log "ERROR" "      pnpm install"
            log "ERROR" "   3. Relancer: $command"
            ;;
    esac
    
    log "ERROR" ""
    log "ERROR" "📝 Log complet sauvegardé: $temp_log"
    log "ERROR" "📝 Log principal: $LOG_FILE"
    log "ERROR" ""
    
    return $exit_code
}

# Fonction pour collecter les informations système
collect_system_info() {
    log "INFO" "📊 Collecte des informations système"
    
    {
        echo "=== INFORMATIONS SYSTÈME ==="
        echo "Date: $(date)"
        echo "OS: $(uname -a)"
        echo "Node.js: $(node --version 2>/dev/null || echo 'Non installé')"
        echo "npm: $(npm --version 2>/dev/null || echo 'Non installé')"
        echo "pnpm: $(pnpm --version 2>/dev/null || echo 'Non installé')"
        echo "Git: $(git --version 2>/dev/null || echo 'Non installé')"
        echo ""
        
        echo "=== INFORMATIONS GIT ==="
        echo "Branche actuelle: $(git branch --show-current 2>/dev/null || echo 'Inconnue')"
        echo "Dernier commit: $(git log -1 --oneline 2>/dev/null || echo 'Aucun')"
        echo "Statut Git:"
        git status --porcelain 2>/dev/null || echo "Erreur lors de la récupération du statut Git"
        echo ""
        
        echo "=== STRUCTURE DU PROJET ==="
        find "$PROJECT_ROOT" -maxdepth 3 -name "package.json" -exec echo "Package.json trouvé: {}" \;
        echo ""
        
        echo "=== VARIABLES D'ENVIRONNEMENT PERTINENTES ==="
        env | grep -E "(NODE|NPM|PNPM|PATH)" | head -10
        echo ""
    } >> "$LOG_FILE"
}

# Fonction pour vérifier les dépendances
check_dependencies() {
    log "INFO" "🔍 Vérification des dépendances"
    
    cd "$PROJECT_ROOT"
    
    # Vérifier les lockfiles
    if [[ -f "pnpm-lock.yaml" ]]; then
        log "DEBUG" "pnpm-lock.yaml trouvé"
    else
        log "WARN" "pnpm-lock.yaml manquant"
    fi
    
    # Vérifier node_modules
    if [[ -d "node_modules" ]]; then
        log "DEBUG" "node_modules trouvé à la racine"
    else
        log "WARN" "node_modules manquant à la racine"
    fi
    
    # Vérifier les packages
    for pkg in "apps/web" "packages/core" "packages/design" "packages/ui"; do
        if [[ -d "$pkg/node_modules" ]]; then
            log "DEBUG" "node_modules trouvé dans $pkg"
        else
            log "WARN" "node_modules manquant dans $pkg"
        fi
    done
}

# Fonction pour nettoyer et réinstaller
clean_and_install() {
    log "INFO" "🧹 Nettoyage et réinstallation des dépendances"
    
    cd "$PROJECT_ROOT"
    
    # Nettoyer les node_modules
    run_command "Suppression des node_modules" "find . -name 'node_modules' -type d -prune -exec rm -rf {} +"
    
    # Nettoyer les fichiers de build
    run_command "Suppression des fichiers de build" "find . -name 'dist' -type d -prune -exec rm -rf {} +"
    
    # Réinstaller les dépendances
    run_command "Installation des dépendances" "pnpm install"
}

# Fonction pour construire le projet
build_project() {
    log "INFO" "🔨 Construction du projet"
    
    cd "$PROJECT_ROOT"
    
    # Build des packages avec diagnostic automatique
    auto_diagnose_and_repair "Build du package core" "pnpm build --filter @bigmind/core"
    auto_diagnose_and_repair "Build du package design" "pnpm build --filter @bigmind/design"
    auto_diagnose_and_repair "Build du package ui" "pnpm build --filter @bigmind/ui"
    
    # Build de l'application web
    auto_diagnose_and_repair "Build de l'application web" "pnpm build --filter bigmind-web"
}

# Fonction pour exécuter les tests
run_tests() {
    log "INFO" "🧪 Exécution des tests"
    
    cd "$PROJECT_ROOT"
    
    # Lint avec diagnostic automatique
    if auto_diagnose_and_repair "Linting" "pnpm lint --filter bigmind-web"; then
        log "INFO" "✅ Linting réussi"
    else
        log "WARN" "⚠️ Problèmes de linting détectés - voir diagnostics ci-dessus"
    fi
    
    # Tests unitaires (si disponibles)
    if [[ -f "apps/web/package.json" ]] && grep -q '"test"' "apps/web/package.json"; then
        run_command "Tests unitaires" "pnpm test --filter bigmind-web"
    else
        log "INFO" "Aucun test unitaire configuré"
    fi
}

# Fonction pour créer un commit
create_commit() {
    local commit_message="$1"
    
    if [[ -z "$commit_message" ]]; then
        commit_message="debug: automated commit with logs - $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    log "INFO" "📝 Création du commit"
    
    cd "$PROJECT_ROOT"
    
    # Ajouter tous les fichiers modifiés
    run_command "Ajout des fichiers modifiés" "git add ."
    
    # Créer le commit
    if run_command "Création du commit" "git commit -m '$commit_message'"; then
        log "INFO" "✅ Commit créé avec succès: $commit_message"
        
        # Afficher le hash du commit
        local commit_hash=$(git rev-parse HEAD)
        log "INFO" "Hash du commit: $commit_hash"
        
        # Ajouter les informations du commit au log
        {
            echo ""
            echo "=== INFORMATIONS DU COMMIT ==="
            echo "Message: $commit_message"
            echo "Hash: $commit_hash"
            echo "Auteur: $(git config user.name) <$(git config user.email)>"
            echo "Date: $(date)"
            echo ""
            echo "Fichiers modifiés:"
            git show --name-status HEAD
        } >> "$LOG_FILE"
        
    else
        log "ERROR" "❌ Échec de la création du commit"
        return 1
    fi
}

# Fonction pour générer un rapport final
generate_report() {
    log "INFO" "📋 Génération du rapport final"
    
    {
        echo ""
        echo "=== RAPPORT FINAL ==="
        echo "Script exécuté le: $(date)"
        echo "Fichier de log: $LOG_FILE"
        echo "Répertoire du projet: $PROJECT_ROOT"
        echo ""
        echo "Résumé des étapes:"
        grep -E "\[(INFO|ERROR)\]" "$LOG_FILE" | tail -20
        echo ""
        echo "=== FIN DU RAPPORT ==="
    } >> "$LOG_FILE"
    
    log "INFO" "📁 Rapport complet disponible dans: $LOG_FILE"
}

# Fonction principale
main() {
    local commit_message="$1"
    
    log "INFO" "🚀 Démarrage du script de débogage BigMind"
    log "INFO" "📁 Répertoire du projet: $PROJECT_ROOT"
    log "INFO" "📝 Fichier de log: $LOG_FILE"
    
    # Collecter les informations système
    collect_system_info
    
    # Vérifier les dépendances
    check_dependencies
    
    # Demander si on veut nettoyer et réinstaller
    if [[ -t 0 ]]; then  # Si on est dans un terminal interactif
        echo -e "${YELLOW}Voulez-vous nettoyer et réinstaller les dépendances ? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            clean_and_install
        fi
    else
        log "INFO" "Mode non-interactif: pas de nettoyage automatique"
    fi
    
    # Construire le projet
    if build_project; then
        log "INFO" "✅ Construction réussie"
    else
        log "ERROR" "❌ Échec de la construction"
        generate_report
        exit 1
    fi
    
    # Exécuter les tests
    run_tests
    
    # Créer le commit
    if create_commit "$commit_message"; then
        log "INFO" "✅ Processus terminé avec succès"
    else
        log "ERROR" "❌ Échec de la création du commit"
        generate_report
        exit 1
    fi
    
    # Générer le rapport final
    generate_report
    
    log "INFO" "🎉 Script terminé avec succès!"
    log "INFO" "📋 Consultez le fichier de log pour plus de détails: $LOG_FILE"
}

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
