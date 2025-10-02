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
        return $exit_code
    fi
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
    
    # Build des packages core
    run_command "Build du package core" "pnpm build --filter @bigmind/core"
    run_command "Build du package design" "pnpm build --filter @bigmind/design"
    run_command "Build du package ui" "pnpm build --filter @bigmind/ui"
    
    # Build de l'application web
    run_command "Build de l'application web" "pnpm build --filter bigmind-web"
}

# Fonction pour exécuter les tests
run_tests() {
    log "INFO" "🧪 Exécution des tests"
    
    cd "$PROJECT_ROOT"
    
    # Lint
    if run_command "Linting" "pnpm lint --filter bigmind-web"; then
        log "INFO" "✅ Linting réussi"
    else
        log "WARN" "⚠️ Problèmes de linting détectés"
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
