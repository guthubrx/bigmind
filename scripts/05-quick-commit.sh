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
    
    # Analyser le type d'erreur avec détection précise des modules
    local error_type=""
    local fix_attempted=false
    local specific_modules=""
    local specific_errors=""
    
    # Extraire les modules spécifiques qui posent problème
    if grep -q "Cannot find module\|Module not found\|ERR_MODULE_NOT_FOUND" "$temp_log"; then
        error_type="missing_dependencies"
        specific_modules=$(grep -o "Cannot find module '[^']*'\|Module not found: [^ ]*\|ERR_MODULE_NOT_FOUND.*'[^']*'" "$temp_log" | head -5)
    elif grep -q "Type error\|TS[0-9]\|TypeScript" "$temp_log"; then
        error_type="typescript_error"
        specific_errors=$(grep -E "(TS[0-9]+|Type error)" "$temp_log" | head -5)
    elif grep -q "ENOENT.*node_modules\|pnpm-lock.yaml" "$temp_log"; then
        error_type="missing_node_modules"
        specific_modules=$(grep -o "ENOENT.*node_modules/[^/]*/[^/]*" "$temp_log" | head -3)
    elif grep -q "ERESOLVE\|peer dep\|version conflict\|ENOTFOUND" "$temp_log"; then
        error_type="dependency_conflict"
        specific_modules=$(grep -o "ERESOLVE.*[a-zA-Z0-9@/-]*\|peer dep.*[a-zA-Z0-9@/-]*" "$temp_log" | head -3)
    elif grep -q "EACCES\|permission denied" "$temp_log"; then
        error_type="permission_error"
        specific_modules=$(grep -o "EACCES.*[^ ]*\|permission denied.*[^ ]*" "$temp_log" | head -3)
    else
        error_type="unknown"
        # Capturer les premières lignes d'erreur pour diagnostic IA
        specific_errors=$(head -10 "$temp_log" | grep -E "(error|Error|ERROR)" | head -5)
    fi
    
    log "INFO" "🎯 Type d'erreur détecté: $error_type"
    log "INFO" ""
    
    # Étape 2: Appliquer la réparation automatique selon le type
    case "$error_type" in
        "missing_node_modules")
            log "INFO" "2️⃣ RÉPARATION: Installation des dépendances manquantes..."
            if [ -n "$specific_modules" ]; then
                log "INFO" "📋 Modules manquants détectés:"
                echo "$specific_modules" | while read -r module; do
                    [ -n "$module" ] && log "INFO" "   - $module"
                done
            fi
            log "INFO" "   Commande: pnpm install"
            if pnpm install 2>&1 | tee -a "$temp_log.install"; then
                log "INFO" "✅ Installation réussie"
                fix_attempted=true
            else
                log "ERROR" "❌ Échec de l'installation"
                log "ERROR" "📋 Erreurs d'installation spécifiques:"
                tail -10 "$temp_log.install" | while read -r line; do
                    log "ERROR" "   $line"
                done
                log "ERROR" "🔧 Commandes de réparation spécifiques:"
                log "ERROR" "   pnpm install --force"
                log "ERROR" "   pnpm install --no-frozen-lockfile"
            fi
            ;;
            
        "missing_dependencies")
            log "INFO" "2️⃣ RÉPARATION: Réinstallation complète des dépendances..."
            if [ -n "$specific_modules" ]; then
                log "INFO" "📋 Modules problématiques identifiés:"
                echo "$specific_modules" | while read -r module; do
                    [ -n "$module" ] && log "INFO" "   - $module"
                done
            fi
            log "INFO" "   Commandes: rm -rf node_modules && pnpm install"
            rm -rf node_modules
            if pnpm install 2>&1 | tee -a "$temp_log.reinstall"; then
                log "INFO" "✅ Réinstallation réussie"
                fix_attempted=true
            else
                log "ERROR" "❌ Échec de la réinstallation"
                log "ERROR" "📋 Erreurs de réinstallation:"
                tail -15 "$temp_log.reinstall" | while read -r line; do
                    log "ERROR" "   $line"
                done
                log "ERROR" "🔧 Commandes de diagnostic spécifiques:"
                log "ERROR" "   pnpm why <module-name>  # Pour chaque module problématique"
                log "ERROR" "   pnpm install --force --no-frozen-lockfile"
                log "ERROR" "   rm -rf ~/.pnpm-store && pnpm install"
            fi
            ;;
            
        "dependency_conflict")
            log "INFO" "2️⃣ RÉPARATION: Résolution des conflits de dépendances..."
            if [ -n "$specific_modules" ]; then
                log "INFO" "📋 Conflits de dépendances détectés:"
                echo "$specific_modules" | while read -r conflict; do
                    [ -n "$conflict" ] && log "INFO" "   - $conflict"
                done
            fi
            log "INFO" "   Commandes: rm -rf node_modules pnpm-lock.yaml && pnpm install"
            rm -rf node_modules pnpm-lock.yaml
            if pnpm install 2>&1 | tee -a "$temp_log.resolve"; then
                log "INFO" "✅ Conflits résolus"
                fix_attempted=true
            else
                log "ERROR" "❌ Échec de la résolution des conflits"
                log "ERROR" "📋 Conflits persistants:"
                grep -E "(ERESOLVE|peer dep|conflict)" "$temp_log.resolve" | head -10 | while read -r line; do
                    log "ERROR" "   $line"
                done
                log "ERROR" "🔧 Commandes de résolution manuelle:"
                log "ERROR" "   pnpm install --force"
                log "ERROR" "   pnpm install --legacy-peer-deps"
                log "ERROR" "   pnpm add <package>@latest  # Pour chaque package en conflit"
            fi
            ;;
            
        "permission_error")
            log "INFO" "2️⃣ RÉPARATION: Correction des permissions..."
            if [ -n "$specific_modules" ]; then
                log "INFO" "📋 Problèmes de permissions détectés:"
                echo "$specific_modules" | while read -r perm; do
                    [ -n "$perm" ] && log "INFO" "   - $perm"
                done
            fi
            log "INFO" "   Commandes: sudo chown -R $(whoami) node_modules"
            if sudo chown -R $(whoami) node_modules 2>&1 | tee -a "$temp_log.perms"; then
                log "INFO" "✅ Permissions corrigées"
                fix_attempted=true
            else
                log "ERROR" "❌ Échec de la correction des permissions"
                log "ERROR" "📋 Erreurs de permissions:"
                cat "$temp_log.perms" | while read -r line; do
                    log "ERROR" "   $line"
                done
                log "ERROR" "🔧 Commandes alternatives:"
                log "ERROR" "   sudo rm -rf node_modules && pnpm install"
                log "ERROR" "   chown -R $(whoami):$(id -gn) node_modules"
            fi
            ;;
            
        "typescript_error")
            log "INFO" "2️⃣ DIAGNOSTIC: Vérification TypeScript détaillée..."
            if [ -n "$specific_errors" ]; then
                log "ERROR" "📋 Erreurs TypeScript spécifiques:"
                echo "$specific_errors" | while read -r error; do
                    [ -n "$error" ] && log "ERROR" "   - $error"
                done
                log "ERROR" ""
            fi
            log "INFO" "   Commande: pnpm type-check --filter bigmind-web"
            pnpm type-check --filter bigmind-web 2>&1 | tee -a "$temp_log.typecheck"
            
            # Extraire les fichiers et erreurs spécifiques
            local ts_files=$(grep -o "[^(]*\.tsx\?([0-9]*,[0-9]*)" "$temp_log.typecheck" | head -5)
            local ts_errors=$(grep -E "TS[0-9]+" "$temp_log.typecheck" | head -5)
            
            log "WARN" "⚠️ Erreurs TypeScript détectées - correction manuelle requise"
            if [ -n "$ts_files" ]; then
                log "ERROR" "📁 Fichiers à corriger:"
                echo "$ts_files" | while read -r file; do
                    [ -n "$file" ] && log "ERROR" "   - $file"
                done
            fi
            if [ -n "$ts_errors" ]; then
                log "ERROR" "🔧 Types d'erreurs:"
                echo "$ts_errors" | while read -r error; do
                    [ -n "$error" ] && log "ERROR" "   - $error"
                done
            fi
            log "ERROR" "🔧 Commandes de diagnostic TypeScript:"
            log "ERROR" "   pnpm type-check --filter bigmind-web --pretty"
            log "ERROR" "   # Puis corriger manuellement les fichiers listés ci-dessus"
            ;;
            
        *)
            log "WARN" "⚠️ Type d'erreur non reconnu - diagnostic approfondi requis"
            log "ERROR" "📋 Erreurs brutes détectées (pour diagnostic IA):"
            if [ -n "$specific_errors" ]; then
                echo "$specific_errors" | while read -r error; do
                    [ -n "$error" ] && log "ERROR" "   ERROR: $error"
                done
            else
                head -20 "$temp_log" | while read -r line; do
                    log "ERROR" "   RAW: $line"
                done
            fi
            log "ERROR" ""
            log "ERROR" "🤖 INFORMATIONS POUR DIAGNOSTIC IA:"
            log "ERROR" "   - Commande échouée: pnpm build --filter bigmind-web"
            log "ERROR" "   - Code de sortie: $build_exit_code"
            log "ERROR" "   - Log complet: $temp_log"
            log "ERROR" "   - OS: $(uname -s)"
            log "ERROR" "   - Node: $(node -v 2>/dev/null || echo 'N/A')"
            log "ERROR" "   - pnpm: $(pnpm -v 2>/dev/null || echo 'N/A')"
            log "ERROR" "   - Répertoire: $(pwd)"
            log "ERROR" ""
            log "ERROR" "🔧 Commandes de diagnostic général:"
            log "ERROR" "   cat $temp_log  # Voir le log complet"
            log "ERROR" "   pnpm build --filter bigmind-web --verbose"
            log "ERROR" "   ./scripts/02-debug-and-commit.sh \"$commit_message\""
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
        log "INFO" "🤖 Génération automatique du message de commit..."
        
        # Vérifier si le session logger est disponible
        if [ -f "scripts/09-session-logger.sh" ]; then
            commit_message=$(./scripts/09-session-logger.sh generate)
            log "INFO" "💡 Message généré: $commit_message"
            
            # Demander confirmation à l'utilisateur
            echo ""
            echo -e "${YELLOW}🎯 Message de commit généré automatiquement :${NC}"
            echo -e "${GREEN}\"$commit_message\"${NC}"
            echo ""
            read -p "Utiliser ce message ? [Y/n] " -n 1 -r
            echo ""
            
            if [[ $REPLY =~ ^[Nn]$ ]]; then
                echo "Veuillez fournir un message de commit :"
                read -r commit_message
                if [ -z "$commit_message" ]; then
                    commit_message="feat: quick commit - $(date '+%Y-%m-%d %H:%M:%S')"
                fi
            fi
        else
            commit_message="feat: quick commit - $(date '+%Y-%m-%d %H:%M:%S')"
            log "INFO" "💡 Message par défaut utilisé (installez le session logger pour l'auto-génération)"
        fi
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
        
        # Sauvegarder le contexte de commit et nettoyer la session
        if [ -f "scripts/09-session-logger.sh" ]; then
            ./scripts/09-session-logger.sh save "$commit_message"
            ./scripts/09-session-logger.sh cleanup
        fi
        
    else
        log "WARN" "⚠️ Aucun changement à commiter"
    fi
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
