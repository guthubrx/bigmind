#!/bin/bash

# FR: Script de détection automatique de besoins de refactoring pour développeurs débutants
# EN: Automatic refactoring detection script for beginner developers
# Usage: ./scripts/06-detect-refactor.sh [directory]

set -e

# Configuration des logs
LOG_DIR="logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/refactor_analysis_$TIMESTAMP.log"
mkdir -p "$LOG_DIR"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "REFACTOR")
            echo -e "${PURPLE}[REFACTOR]${NC} $message"
            ;;
    esac
}

# Analyse de la complexité des fichiers
analyze_file_complexity() {
    local file="$1"
    local issues=0
    
    # Compter les lignes de code
    local lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    
    # Compter les fonctions
    local functions=$(grep -c "function\|const.*=.*=>\|=.*(" "$file" 2>/dev/null || echo "0")
    
    # Compter les imports
    local imports=$(grep -c "^import\|^const.*require" "$file" 2>/dev/null || echo "0")
    
    # Compter les conditions imbriquées
    local nested_conditions=$(grep -c "if.*if\|for.*for\|while.*while" "$file" 2>/dev/null || echo "0")
    
    # Détecter les problèmes potentiels
    if [ "$lines" -gt 300 ]; then
        log "REFACTOR" "📄 Fichier trop long: $file ($lines lignes)"
        log "REFACTOR" "   💡 Solution: Diviser en plusieurs fichiers/composants"
        issues=$((issues + 1))
    fi
    
    if [ "$functions" -gt 15 ]; then
        log "REFACTOR" "🔧 Trop de fonctions: $file ($functions fonctions)"
        log "REFACTOR" "   💡 Solution: Créer des modules séparés"
        issues=$((issues + 1))
    fi
    
    if [ "$imports" -gt 20 ]; then
        log "REFACTOR" "📦 Trop d'imports: $file ($imports imports)"
        log "REFACTOR" "   💡 Solution: Regrouper les imports ou diviser le fichier"
        issues=$((issues + 1))
    fi
    
    if [ "$nested_conditions" -gt 5 ]; then
        log "REFACTOR" "🔄 Logique trop complexe: $file ($nested_conditions conditions imbriquées)"
        log "REFACTOR" "   💡 Solution: Extraire des fonctions, utiliser early returns"
        issues=$((issues + 1))
    fi
    
    # Détecter les patterns problématiques
    if grep -q "any\|@ts-ignore\|eslint-disable" "$file" 2>/dev/null; then
        log "REFACTOR" "⚠️ Code technique debt: $file"
        log "REFACTOR" "   💡 Contient: any, @ts-ignore, ou eslint-disable"
        log "REFACTOR" "   💡 Solution: Typer correctement, corriger les erreurs"
        issues=$((issues + 1))
    fi
    
    # Détecter la duplication de code
    local duplicate_lines=$(sort "$file" | uniq -d | wc -l | tr -d ' ')
    if [ "$duplicate_lines" -gt 10 ]; then
        log "REFACTOR" "📋 Code dupliqué détecté: $file ($duplicate_lines lignes similaires)"
        log "REFACTOR" "   💡 Solution: Extraire des fonctions communes"
        issues=$((issues + 1))
    fi
    
    return $issues
}

# Analyse des patterns React spécifiques
analyze_react_patterns() {
    local file="$1"
    local issues=0
    
    # Détecter les composants trop complexes
    if grep -q "useState.*useState.*useState" "$file" 2>/dev/null; then
        log "REFACTOR" "⚛️ Trop de state dans un composant: $file"
        log "REFACTOR" "   💡 Solution: Utiliser useReducer ou diviser le composant"
        issues=$((issues + 1))
    fi
    
    # Détecter les useEffect sans dépendances
    if grep -q "useEffect.*\[\]" "$file" 2>/dev/null; then
        local empty_deps=$(grep -c "useEffect.*\[\]" "$file" 2>/dev/null || echo "0")
        if [ "$empty_deps" -gt 3 ]; then
            log "REFACTOR" "🔄 Trop d'useEffect: $file ($empty_deps useEffect)"
            log "REFACTOR" "   💡 Solution: Combiner les effets ou utiliser des hooks personnalisés"
            issues=$((issues + 1))
        fi
    fi
    
    # Détecter les props drilling
    if grep -c "props\." "$file" 2>/dev/null | awk '$1 > 10 {exit 0} {exit 1}'; then
        log "REFACTOR" "📡 Props drilling détecté: $file"
        log "REFACTOR" "   💡 Solution: Utiliser Context API ou state management"
        issues=$((issues + 1))
    fi
    
    # Détecter les composants sans memo
    if grep -q "export.*function\|export.*const.*=" "$file" && ! grep -q "memo\|React.memo" "$file" 2>/dev/null; then
        local exports=$(grep -c "export.*function\|export.*const.*=" "$file" 2>/dev/null || echo "0")
        if [ "$exports" -gt 0 ] && [ "$(wc -l < "$file")" -gt 50 ]; then
            log "REFACTOR" "🚀 Optimisation possible: $file"
            log "REFACTOR" "   💡 Solution: Considérer React.memo pour les performances"
            issues=$((issues + 1))
        fi
    fi
    
    return $issues
}

# Analyse de l'architecture du projet
analyze_project_structure() {
    local target_dir="$1"
    local issues=0
    
    log "INFO" "🏗️ ANALYSE DE L'ARCHITECTURE DU PROJET"
    log "INFO" ""
    
    # Compter les fichiers par type
    local tsx_files=$(find "$target_dir" -name "*.tsx" -type f | wc -l | tr -d ' ')
    local ts_files=$(find "$target_dir" -name "*.ts" -type f | wc -l | tr -d ' ')
    local css_files=$(find "$target_dir" -name "*.css" -type f | wc -l | tr -d ' ')
    
    log "INFO" "📊 Statistiques du projet:"
    log "INFO" "   - Fichiers TypeScript: $ts_files"
    log "INFO" "   - Fichiers React: $tsx_files"
    log "INFO" "   - Fichiers CSS: $css_files"
    log "INFO" ""
    
    # Détecter les problèmes d'organisation
    local components_in_root=$(find "$target_dir" -maxdepth 1 -name "*.tsx" -type f | wc -l | tr -d ' ')
    if [ "$components_in_root" -gt 5 ]; then
        log "REFACTOR" "📁 Trop de composants à la racine: $components_in_root fichiers"
        log "REFACTOR" "   💡 Solution: Créer des dossiers components/, pages/, hooks/"
        issues=$((issues + 1))
    fi
    
    # Vérifier la structure recommandée
    if [ ! -d "$target_dir/components" ] && [ "$tsx_files" -gt 3 ]; then
        log "REFACTOR" "📂 Structure manquante: dossier components/"
        log "REFACTOR" "   💡 Solution: mkdir components && mv *.tsx components/"
        issues=$((issues + 1))
    fi
    
    if [ ! -d "$target_dir/hooks" ] && grep -r "use[A-Z]" "$target_dir" --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
        log "REFACTOR" "🪝 Structure manquante: dossier hooks/"
        log "REFACTOR" "   💡 Solution: Créer hooks/ pour les hooks personnalisés"
        issues=$((issues + 1))
    fi
    
    if [ ! -d "$target_dir/utils" ] && [ "$ts_files" -gt 5 ]; then
        log "REFACTOR" "🔧 Structure manquante: dossier utils/"
        log "REFACTOR" "   💡 Solution: Créer utils/ pour les fonctions utilitaires"
        issues=$((issues + 1))
    fi
    
    return $issues
}

# Détection automatique des besoins de refactoring
detect_refactoring_needs() {
    local target_dir="${1:-src}"
    local total_issues=0
    
    log "INFO" "🔍 DÉTECTION AUTOMATIQUE DE REFACTORING"
    log "INFO" "📁 Analyse du répertoire: $target_dir"
    log "INFO" ""
    
    if [ ! -d "$target_dir" ]; then
        log "ERROR" "❌ Répertoire non trouvé: $target_dir"
        log "ERROR" "💡 Usage: ./scripts/06-detect-refactor.sh [directory]"
        return 1
    fi
    
    # Analyse de l'architecture globale
    analyze_project_structure "$target_dir"
    total_issues=$((total_issues + $?))
    
    log "INFO" "📝 ANALYSE DES FICHIERS INDIVIDUELS"
    log "INFO" ""
    
    # Analyser chaque fichier TypeScript/React
    local file_count=0
    find "$target_dir" -name "*.ts" -o -name "*.tsx" | while read -r file; do
        file_count=$((file_count + 1))
        
        log "DEBUG" "Analyse: $file"
        
        # Analyse de la complexité générale
        analyze_file_complexity "$file"
        local complexity_issues=$?
        
        # Analyse spécifique React (pour les fichiers .tsx)
        if [[ "$file" == *.tsx ]]; then
            analyze_react_patterns "$file"
            local react_issues=$?
            complexity_issues=$((complexity_issues + react_issues))
        fi
        
        total_issues=$((total_issues + complexity_issues))
        
        # Limiter l'analyse pour éviter un output trop long
        if [ "$file_count" -gt 20 ]; then
            log "INFO" "... (analyse limitée aux 20 premiers fichiers)"
            break
        fi
    done
    
    return $total_issues
}

# Génération de recommandations personnalisées
generate_recommendations() {
    local issues_count="$1"
    
    log "INFO" ""
    log "INFO" "📋 RÉSUMÉ ET RECOMMANDATIONS"
    log "INFO" ""
    
    if [ "$issues_count" -eq 0 ]; then
        log "SUCCESS" "🎉 Excellent ! Aucun problème de refactoring détecté"
        log "SUCCESS" "✅ Votre code suit les bonnes pratiques"
        return 0
    fi
    
    log "REFACTOR" "📊 Total des problèmes détectés: $issues_count"
    log "REFACTOR" ""
    
    # Recommandations par priorité
    log "REFACTOR" "🎯 PLAN D'ACTION RECOMMANDÉ (par priorité) :"
    log "REFACTOR" ""
    
    log "REFACTOR" "1️⃣ PRIORITÉ HAUTE - Structure du projet :"
    log "REFACTOR" "   - Créer les dossiers manquants (components/, hooks/, utils/)"
    log "REFACTOR" "   - Déplacer les fichiers dans les bons dossiers"
    log "REFACTOR" "   - Commande: mkdir -p src/{components,hooks,utils,pages}"
    log "REFACTOR" ""
    
    log "REFACTOR" "2️⃣ PRIORITÉ MOYENNE - Complexité des fichiers :"
    log "REFACTOR" "   - Diviser les fichiers > 300 lignes"
    log "REFACTOR" "   - Extraire les fonctions communes"
    log "REFACTOR" "   - Simplifier la logique complexe"
    log "REFACTOR" ""
    
    log "REFACTOR" "3️⃣ PRIORITÉ BASSE - Optimisations :"
    log "REFACTOR" "   - Ajouter React.memo si nécessaire"
    log "REFACTOR" "   - Corriger les types any et @ts-ignore"
    log "REFACTOR" "   - Optimiser les useEffect"
    log "REFACTOR" ""
    
    # Commandes utiles pour le développeur débutant
    log "REFACTOR" "🔧 COMMANDES UTILES POUR COMMENCER :"
    log "REFACTOR" ""
    log "REFACTOR" "   # Créer la structure recommandée"
    log "REFACTOR" "   mkdir -p src/{components,hooks,utils,pages,types}"
    log "REFACTOR" ""
    log "REFACTOR" "   # Analyser la complexité d'un fichier spécifique"
    log "REFACTOR" "   wc -l src/components/*.tsx"
    log "REFACTOR" ""
    log "REFACTOR" "   # Trouver les fichiers les plus complexes"
    log "REFACTOR" "   find src -name '*.tsx' -exec wc -l {} + | sort -n | tail -5"
    log "REFACTOR" ""
    log "REFACTOR" "   # Détecter les imports excessifs"
    log "REFACTOR" "   grep -c '^import' src/**/*.tsx | sort -t: -k2 -n | tail -5"
    log "REFACTOR" ""
    
    # Informations pour l'IA si nécessaire
    log "REFACTOR" "🤖 INFORMATIONS POUR DIAGNOSTIC IA (si besoin d'aide) :"
    log "REFACTOR" "   - Problèmes détectés: $issues_count"
    log "REFACTOR" "   - Projet: $(pwd)"
    log "REFACTOR" "   - Structure actuelle: $(find src -type d 2>/dev/null | head -10 | tr '\n' ', ' || echo 'N/A')"
    log "REFACTOR" "   - Fichiers analysés: $(find src -name '*.ts*' | wc -l | tr -d ' ') fichiers"
    log "REFACTOR" "   - Log détaillé: $LOG_FILE"
    log "REFACTOR" ""
    
    return 1
}

main() {
    local target_dir="${1:-src}"
    
    log "INFO" "🚀 Assistant Refactoring pour développeurs débutants"
    log "INFO" "🎯 Objectif: Détecter automatiquement les besoins d'amélioration du code"
    log "INFO" ""
    
    # Lancer la détection
    detect_refactoring_needs "$target_dir"
    local issues_count=$?
    
    # Générer les recommandations
    generate_recommendations "$issues_count"
    
    log "INFO" ""
    log "INFO" "📝 Analyse complète sauvegardée: $LOG_FILE"
    log "INFO" "💡 Relancez ce script après vos modifications pour voir les améliorations"
    
    return $issues_count
}

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
