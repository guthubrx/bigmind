#!/bin/bash

# FR: Script de diagnostic et réparation automatique ESLint pour développeurs débutants
# EN: Automatic ESLint diagnostic and repair script for beginner developers
# Usage: ./scripts/05-fix-eslint.sh [file_or_directory]

set -e

# Configuration des logs
LOG_DIR="logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/eslint_fix_$TIMESTAMP.log"
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

# Fonction de diagnostic et réparation automatique ESLint
auto_fix_eslint() {
    local target="$1"
    local temp_log=$(mktemp)
    
    log "INFO" "🔍 DIAGNOSTIC ESLINT AUTOMATIQUE"
    log "INFO" "📁 Cible: ${target:-'projet complet'}"
    log "INFO" ""
    
    # Étape 1: Diagnostic des erreurs ESLint
    log "INFO" "1️⃣ Analyse des erreurs ESLint..."
    
    local eslint_cmd="pnpm lint"
    if [ -n "$target" ]; then
        eslint_cmd="pnpm lint $target"
    fi
    
    if $eslint_cmd > "$temp_log" 2>&1; then
        log "SUCCESS" "✅ Aucune erreur ESLint détectée !"
        rm -f "$temp_log"
        return 0
    fi
    
    # Analyser les types d'erreurs ESLint
    local error_count=$(grep -c "error" "$temp_log" 2>/dev/null || echo "0")
    local warning_count=$(grep -c "warning" "$temp_log" 2>/dev/null || echo "0")
    
    log "INFO" "📊 Erreurs détectées:"
    log "INFO" "   - Erreurs: $error_count"
    log "INFO" "   - Avertissements: $warning_count"
    log "INFO" ""
    
    # Extraire les types d'erreurs spécifiques
    local unused_vars=$(grep -o "is defined but never used" "$temp_log" | wc -l | tr -d ' ')
    local missing_deps=$(grep -o "is missing in props validation\|Missing return type" "$temp_log" | wc -l | tr -d ' ')
    local import_errors=$(grep -o "Unable to resolve path\|Import.*not found" "$temp_log" | wc -l | tr -d ' ')
    local react_errors=$(grep -o "React.*is defined but never used\|jsx-" "$temp_log" | wc -l | tr -d ' ')
    
    log "INFO" "🎯 Types d'erreurs identifiés:"
    [ "$unused_vars" -gt 0 ] && log "INFO" "   - Variables non utilisées: $unused_vars"
    [ "$missing_deps" -gt 0 ] && log "INFO" "   - Props/types manquants: $missing_deps"
    [ "$import_errors" -gt 0 ] && log "INFO" "   - Erreurs d'import: $import_errors"
    [ "$react_errors" -gt 0 ] && log "INFO" "   - Erreurs React/JSX: $react_errors"
    log "INFO" ""
    
    # Étape 2: Tentative de réparation automatique
    log "INFO" "2️⃣ RÉPARATION AUTOMATIQUE EN COURS..."
    
    local fix_cmd="pnpm lint --fix"
    if [ -n "$target" ]; then
        fix_cmd="pnpm lint --fix $target"
    fi
    
    if $fix_cmd > "$temp_log.fix" 2>&1; then
        log "SUCCESS" "✅ Réparations automatiques appliquées"
        
        # Vérifier si toutes les erreurs sont résolues
        if $eslint_cmd > /dev/null 2>&1; then
            log "SUCCESS" "🎉 TOUTES LES ERREURS ESLINT RÉSOLUES !"
            log "INFO" "📝 Vous pouvez maintenant committer vos changements"
            rm -f "$temp_log" "$temp_log.fix"
            return 0
        fi
    fi
    
    # Étape 3: Analyse des erreurs restantes
    log "WARN" "⚠️ Certaines erreurs nécessitent une correction manuelle"
    log "INFO" ""
    log "INFO" "3️⃣ ANALYSE DES ERREURS RESTANTES..."
    
    # Réanalyser après les corrections automatiques
    $eslint_cmd > "$temp_log.remaining" 2>&1 || true
    
    # Extraire les fichiers avec erreurs
    local files_with_errors=$(grep -o "[^:]*\.tsx\?:" "$temp_log.remaining" | sort -u | head -10)
    
    if [ -n "$files_with_errors" ]; then
        log "ERROR" "📁 FICHIERS À CORRIGER MANUELLEMENT :"
        echo "$files_with_errors" | while read -r file; do
            [ -n "$file" ] && log "ERROR" "   - ${file%:}"
        done
        log "ERROR" ""
    fi
    
    # Analyser les erreurs par catégorie avec solutions
    log "ERROR" "🔧 GUIDE DE RÉPARATION MANUELLE :"
    log "ERROR" ""
    
    # Variables non utilisées
    if grep -q "is defined but never used" "$temp_log.remaining"; then
        log "ERROR" "1️⃣ VARIABLES NON UTILISÉES :"
        grep "is defined but never used" "$temp_log.remaining" | head -5 | while read -r line; do
            log "ERROR" "   $line"
        done
        log "ERROR" "   💡 Solutions:"
        log "ERROR" "      - Supprimer la variable si inutile"
        log "ERROR" "      - Préfixer par _ si nécessaire: _unusedVar"
        log "ERROR" "      - Ajouter // eslint-disable-next-line no-unused-vars"
        log "ERROR" ""
    fi
    
    # Erreurs de types/props
    if grep -q "Missing return type\|props validation" "$temp_log.remaining"; then
        log "ERROR" "2️⃣ TYPES ET PROPS MANQUANTS :"
        grep -E "Missing return type|props validation" "$temp_log.remaining" | head -5 | while read -r line; do
            log "ERROR" "   $line"
        done
        log "ERROR" "   💡 Solutions:"
        log "ERROR" "      - Ajouter le type de retour: ): string => {"
        log "ERROR" "      - Définir les props: interface Props { name: string }"
        log "ERROR" "      - Utiliser PropTypes si nécessaire"
        log "ERROR" ""
    fi
    
    # Erreurs d'import
    if grep -q "Unable to resolve path\|Import.*not found" "$temp_log.remaining"; then
        log "ERROR" "3️⃣ ERREURS D'IMPORT :"
        grep -E "Unable to resolve path|Import.*not found" "$temp_log.remaining" | head -5 | while read -r line; do
            log "ERROR" "   $line"
        done
        log "ERROR" "   💡 Solutions:"
        log "ERROR" "      - Vérifier le chemin: import './Component' → './components/Component'"
        log "ERROR" "      - Installer la dépendance: pnpm add <package>"
        log "ERROR" "      - Vérifier l'export du module cible"
        log "ERROR" ""
    fi
    
    # Erreurs React/JSX
    if grep -q "jsx-\|React.*is defined but never used" "$temp_log.remaining"; then
        log "ERROR" "4️⃣ ERREURS REACT/JSX :"
        grep -E "jsx-|React.*is defined but never used" "$temp_log.remaining" | head -5 | while read -r line; do
            log "ERROR" "   $line"
        done
        log "ERROR" "   💡 Solutions:"
        log "ERROR" "      - Supprimer import React si React 17+"
        log "ERROR" "      - Ajouter key aux éléments de liste: key={item.id}"
        log "ERROR" "      - Utiliser onClick au lieu de onclick"
        log "ERROR" ""
    fi
    
    # Commandes pour ouvrir les fichiers problématiques
    if [ -n "$files_with_errors" ]; then
        log "ERROR" "📝 COMMANDES POUR OUVRIR LES FICHIERS :"
        echo "$files_with_errors" | head -5 | while read -r file; do
            if [ -n "$file" ]; then
                clean_file="${file%:}"
                log "ERROR" "   code $clean_file"
            fi
        done
        log "ERROR" ""
    fi
    
    # Informations pour diagnostic IA (si nécessaire)
    log "ERROR" "🤖 INFORMATIONS POUR DIAGNOSTIC IA (si besoin) :"
    log "ERROR" "   - Commande: $eslint_cmd"
    log "ERROR" "   - Erreurs totales: $error_count"
    log "ERROR" "   - Avertissements: $warning_count"
    log "ERROR" "   - Fichiers affectés: $(echo "$files_with_errors" | wc -l | tr -d ' ')"
    log "ERROR" "   - Log complet: $temp_log.remaining"
    log "ERROR" "   - Projet: $(pwd)"
    log "ERROR" ""
    
    log "ERROR" "🔧 COMMANDES UTILES :"
    log "ERROR" "   1. Voir toutes les erreurs: $eslint_cmd"
    log "ERROR" "   2. Corriger un fichier: pnpm lint --fix <fichier>"
    log "ERROR" "   3. Ignorer temporairement: // eslint-disable-next-line <rule>"
    log "ERROR" "   4. Relancer ce script: ./scripts/05-fix-eslint.sh"
    log "ERROR" ""
    
    return 1
}

main() {
    local target="$1"
    
    log "INFO" "🚀 Assistant ESLint pour développeurs débutants"
    log "INFO" ""
    
    # Vérifier que pnpm et eslint sont disponibles
    if ! command -v pnpm &> /dev/null; then
        log "ERROR" "❌ pnpm n'est pas installé"
        log "ERROR" "💡 Installation: npm install -g pnpm"
        exit 1
    fi
    
    if ! pnpm list eslint &> /dev/null; then
        log "ERROR" "❌ ESLint n'est pas configuré dans ce projet"
        log "ERROR" "💡 Configuration: pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin"
        exit 1
    fi
    
    # Lancer le diagnostic et la réparation
    if auto_fix_eslint "$target"; then
        log "SUCCESS" "🎉 Mission accomplie ! Votre code est maintenant propre"
        log "INFO" "📝 Vous pouvez committer en toute sécurité"
    else
        log "WARN" "⚠️ Corrections manuelles nécessaires"
        log "INFO" "📖 Suivez le guide ci-dessus pour résoudre les erreurs restantes"
        log "INFO" "💡 N'hésitez pas à demander de l'aide pour les erreurs complexes"
    fi
    
    log "INFO" ""
    log "INFO" "📝 Logs sauvegardés: $LOG_FILE"
}

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
