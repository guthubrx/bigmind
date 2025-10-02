#!/bin/bash

# FR: Pre-commit hook intelligent pour développeurs débutants
# EN: Smart pre-commit hook for beginner developers
# Usage: Appelé automatiquement par Git avant chaque commit

set -e

# Configuration
LOG_DIR="logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/pre_commit_$TIMESTAMP.log"
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
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        "INFO")
            echo -e "${GREEN}[PRE-COMMIT]${NC} $message"
            ;;
        "WARN")
            echo -e "${YELLOW}[PRE-COMMIT]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[PRE-COMMIT]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[PRE-COMMIT]${NC} $message"
            ;;
    esac
}

# Vérification intelligente des fichiers modifiés
check_staged_files() {
    local staged_files=$(git diff --cached --name-only)
    
    if [ -z "$staged_files" ]; then
        log "WARN" "⚠️ Aucun fichier stagé pour le commit"
        log "WARN" "💡 Utilisez: git add <fichiers> avant de committer"
        return 1
    fi
    
    log "INFO" "📁 Fichiers à committer:"
    echo "$staged_files" | while read -r file; do
        [ -n "$file" ] && log "INFO" "   - $file"
    done
    
    return 0
}

# Vérification ESLint automatique avec réparation
check_and_fix_eslint() {
    log "INFO" "🔍 Vérification ESLint..."
    
    # Obtenir les fichiers TypeScript/JavaScript stagés
    local ts_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)
    
    if [ -z "$ts_files" ]; then
        log "INFO" "✅ Aucun fichier TypeScript/JavaScript à vérifier"
        return 0
    fi
    
    log "INFO" "📝 Fichiers à vérifier:"
    echo "$ts_files" | while read -r file; do
        [ -n "$file" ] && log "INFO" "   - $file"
    done
    
    # Vérifier ESLint sur les fichiers stagés
    local temp_log=$(mktemp)
    if echo "$ts_files" | xargs pnpm lint > "$temp_log" 2>&1; then
        log "SUCCESS" "✅ ESLint: Aucune erreur détectée"
        rm -f "$temp_log"
        return 0
    fi
    
    log "WARN" "⚠️ Erreurs ESLint détectées"
    
    # Tentative de réparation automatique
    log "INFO" "🔧 Tentative de réparation automatique..."
    if echo "$ts_files" | xargs pnpm lint --fix > /dev/null 2>&1; then
        # Re-stager les fichiers corrigés
        echo "$ts_files" | xargs git add
        
        # Vérifier si les erreurs sont résolues
        if echo "$ts_files" | xargs pnpm lint > /dev/null 2>&1; then
            log "SUCCESS" "🎉 Erreurs ESLint corrigées automatiquement !"
            log "INFO" "📝 Fichiers mis à jour et re-stagés"
            rm -f "$temp_log"
            return 0
        fi
    fi
    
    # Si la réparation automatique a échoué
    log "ERROR" "❌ Erreurs ESLint non réparables automatiquement"
    log "ERROR" ""
    log "ERROR" "🔧 ACTIONS REQUISES :"
    log "ERROR" ""
    
    # Analyser les erreurs spécifiques
    local error_count=$(grep -c "error" "$temp_log" 2>/dev/null || echo "0")
    local warning_count=$(grep -c "warning" "$temp_log" 2>/dev/null || echo "0")
    
    log "ERROR" "📊 Résumé: $error_count erreurs, $warning_count avertissements"
    log "ERROR" ""
    
    # Montrer les premières erreurs
    log "ERROR" "🚨 Premières erreurs à corriger :"
    head -10 "$temp_log" | while read -r line; do
        [ -n "$line" ] && log "ERROR" "   $line"
    done
    log "ERROR" ""
    
    log "ERROR" "💡 SOLUTIONS RAPIDES :"
    log "ERROR" "   1. Corriger automatiquement: ./scripts/05-fix-eslint.sh"
    log "ERROR" "   2. Voir toutes les erreurs: pnpm lint"
    log "ERROR" "   3. Corriger manuellement puis: git add <fichiers>"
    log "ERROR" "   4. Ignorer temporairement: git commit --no-verify"
    log "ERROR" ""
    
    rm -f "$temp_log"
    return 1
}

# Vérification TypeScript
check_typescript() {
    log "INFO" "🔍 Vérification TypeScript..."
    
    local temp_log=$(mktemp)
    if pnpm type-check > "$temp_log" 2>&1; then
        log "SUCCESS" "✅ TypeScript: Aucune erreur de type"
        rm -f "$temp_log"
        return 0
    fi
    
    log "ERROR" "❌ Erreurs TypeScript détectées"
    log "ERROR" ""
    
    # Analyser les erreurs TypeScript
    local ts_errors=$(grep -E "TS[0-9]+" "$temp_log" | head -5)
    if [ -n "$ts_errors" ]; then
        log "ERROR" "🚨 Erreurs de type détectées :"
        echo "$ts_errors" | while read -r error; do
            [ -n "$error" ] && log "ERROR" "   $error"
        done
        log "ERROR" ""
    fi
    
    log "ERROR" "💡 SOLUTIONS :"
    log "ERROR" "   1. Voir toutes les erreurs: pnpm type-check"
    log "ERROR" "   2. Corriger les types dans les fichiers listés"
    log "ERROR" "   3. Aide TypeScript: ./scripts/05-fix-eslint.sh"
    log "ERROR" "   4. Ignorer temporairement: git commit --no-verify"
    log "ERROR" ""
    
    rm -f "$temp_log"
    return 1
}

# Vérification des tests (si disponibles)
check_tests() {
    # Vérifier si des tests existent
    if [ ! -f "package.json" ] || ! grep -q '"test"' package.json; then
        log "INFO" "ℹ️ Aucun test configuré - ignoré"
        return 0
    fi
    
    log "INFO" "🧪 Vérification des tests..."
    
    local temp_log=$(mktemp)
    if pnpm test --passWithNoTests > "$temp_log" 2>&1; then
        log "SUCCESS" "✅ Tests: Tous les tests passent"
        rm -f "$temp_log"
        return 0
    fi
    
    log "WARN" "⚠️ Échec des tests détecté"
    log "WARN" ""
    log "WARN" "💡 RECOMMANDATIONS :"
    log "WARN" "   1. Corriger les tests qui échouent"
    log "WARN" "   2. Voir les détails: pnpm test"
    log "WARN" "   3. Continuer sans tests: git commit --no-verify"
    log "WARN" ""
    
    # Ne pas bloquer le commit pour les tests (warning seulement)
    rm -f "$temp_log"
    return 0
}

# Vérification de la taille des fichiers
check_file_sizes() {
    log "INFO" "📏 Vérification de la taille des fichiers..."
    
    local large_files=$(git diff --cached --name-only | xargs -I {} sh -c 'if [ -f "{}" ]; then echo "$(wc -c < "{}") {}"; fi' | awk '$1 > 1048576 {print $2 " (" int($1/1024/1024) "MB)"}')
    
    if [ -n "$large_files" ]; then
        log "WARN" "⚠️ Fichiers volumineux détectés (>1MB) :"
        echo "$large_files" | while read -r file; do
            [ -n "$file" ] && log "WARN" "   - $file"
        done
        log "WARN" ""
        log "WARN" "💡 Considérez :"
        log "WARN" "   - Compresser les images"
        log "WARN" "   - Utiliser Git LFS pour les gros fichiers"
        log "WARN" "   - Vérifier si ces fichiers doivent être versionnés"
        log "WARN" ""
    fi
    
    return 0
}

# Vérification des secrets potentiels
check_secrets() {
    log "INFO" "🔐 Vérification des secrets potentiels..."
    
    local staged_files=$(git diff --cached --name-only)
    local secrets_found=""
    
    # Patterns de secrets courants
    local patterns=(
        "password\s*=\s*['\"][^'\"]{8,}"
        "api[_-]?key\s*=\s*['\"][^'\"]{16,}"
        "secret\s*=\s*['\"][^'\"]{16,}"
        "token\s*=\s*['\"][^'\"]{16,}"
        "private[_-]?key"
        "-----BEGIN.*PRIVATE KEY-----"
    )
    
    for file in $staged_files; do
        if [ -f "$file" ]; then
            for pattern in "${patterns[@]}"; do
                if grep -iE "$pattern" "$file" >/dev/null 2>&1; then
                    secrets_found="$secrets_found\n   - $file (pattern: ${pattern%% *})"
                fi
            done
        fi
    done
    
    if [ -n "$secrets_found" ]; then
        log "ERROR" "🚨 Secrets potentiels détectés :"
        echo -e "$secrets_found"
        log "ERROR" ""
        log "ERROR" "💡 ACTIONS REQUISES :"
        log "ERROR" "   1. Vérifier que ce ne sont pas de vrais secrets"
        log "ERROR" "   2. Utiliser des variables d'environnement"
        log "ERROR" "   3. Ajouter au .gitignore si nécessaire"
        log "ERROR" "   4. Forcer le commit: git commit --no-verify"
        log "ERROR" ""
        return 1
    fi
    
    log "SUCCESS" "✅ Aucun secret détecté"
    return 0
}

# Fonction principale du pre-commit hook
main() {
    log "INFO" "🚀 Pre-commit Hook Intelligent - Vérifications automatiques"
    log "INFO" ""
    
    local exit_code=0
    
    # 1. Vérifier les fichiers stagés
    if ! check_staged_files; then
        exit_code=1
    fi
    
    # 2. Vérifier et corriger ESLint
    if ! check_and_fix_eslint; then
        exit_code=1
    fi
    
    # 3. Vérifier TypeScript
    if ! check_typescript; then
        exit_code=1
    fi
    
    # 4. Vérifier les tests (non bloquant)
    check_tests
    
    # 5. Vérifier la taille des fichiers (non bloquant)
    check_file_sizes
    
    # 6. Vérifier les secrets potentiels
    if ! check_secrets; then
        exit_code=1
    fi
    
    log "INFO" ""
    if [ $exit_code -eq 0 ]; then
        log "SUCCESS" "🎉 Toutes les vérifications sont passées !"
        log "SUCCESS" "✅ Commit autorisé"
    else
        log "ERROR" "❌ Des problèmes ont été détectés"
        log "ERROR" ""
        log "ERROR" "💡 OPTIONS :"
        log "ERROR" "   1. Corriger les problèmes listés ci-dessus"
        log "ERROR" "   2. Utiliser les scripts d'aide :"
        log "ERROR" "      - ./scripts/05-fix-eslint.sh"
        log "ERROR" "      - ./scripts/06-detect-refactor.sh"
        log "ERROR" "   3. Forcer le commit (non recommandé) :"
        log "ERROR" "      - git commit --no-verify"
        log "ERROR" ""
    fi
    
    log "INFO" "📝 Log détaillé: $LOG_FILE"
    
    exit $exit_code
}

# Exécuter le hook
main "$@"
