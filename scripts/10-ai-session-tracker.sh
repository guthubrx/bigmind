#!/bin/bash

# FR: Tracker automatique des sessions IA pour génération de commits intelligents
# EN: Automatic AI session tracker for intelligent commit generation
# Usage: ./scripts/10-ai-session-tracker.sh <action> [details]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_LOGGER="$SCRIPT_DIR/09-session-logger.sh"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_ai() {
    echo -e "${PURPLE}[AI-TRACKER]${NC} $*"
}

# Démarrer une session de développement avec l'IA
start_ai_session() {
    local topic="$1"
    local category="${2:-development}"
    
    log_ai "🚀 Démarrage session IA: $topic"
    
    # Initialiser le session logger
    if [ -f "$SESSION_LOGGER" ]; then
        "$SESSION_LOGGER" init
        "$SESSION_LOGGER" topic "$topic" "$category"
    fi
    
    # Logger le contexte initial
    log_context "Session IA démarrée" "$topic"
}

# Logger le contexte de développement
log_context() {
    local action="$1"
    local details="$2"
    
    if [ -f "$SESSION_LOGGER" ]; then
        "$SESSION_LOGGER" topic "$action: $details" "ai-context"
    fi
    
    log_ai "📝 Contexte loggé: $action"
}

# Logger une demande/question à l'IA
log_ai_request() {
    local request="$1"
    local category="${2:-question}"
    
    log_ai "❓ Question IA: $request"
    
    if [ -f "$SESSION_LOGGER" ]; then
        "$SESSION_LOGGER" topic "Demande IA: $request" "$category"
    fi
}

# Logger une réponse/solution de l'IA
log_ai_response() {
    local response_type="$1"  # fix, feature, refactor, docs, etc.
    local scope="$2"          # scripts, components, config, etc.
    local description="$3"    # description de ce qui a été fait
    
    log_ai "✅ Réponse IA: $response_type($scope) - $description"
    
    if [ -f "$SESSION_LOGGER" ]; then
        "$SESSION_LOGGER" modification "$response_type" "$scope" "$description"
        "$SESSION_LOGGER" topic "IA a implémenté: $description" "ai-implementation"
    fi
}

# Logger automatiquement les modifications de fichiers
auto_log_file_changes() {
    log_ai "🔍 Analyse automatique des modifications..."
    
    # Obtenir les fichiers modifiés récemment (dernières 5 minutes)
    local recent_files=$(find . -name "*.sh" -o -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" | \
                        xargs ls -lt | head -10 | awk '{print $9}' | grep -v "^\\.$")
    
    if [ -n "$recent_files" ]; then
        log_ai "📁 Fichiers modifiés détectés:"
        echo "$recent_files" | while read -r file; do
            if [ -f "$file" ]; then
                log_ai "   - $file"
                
                # Déterminer le type de modification basé sur le fichier
                local mod_type="chore"
                local scope="general"
                
                case "$file" in
                    scripts/*.sh)
                        mod_type="feat"
                        scope="scripts"
                        ;;
                    *.md)
                        mod_type="docs"
                        scope="documentation"
                        ;;
                    *components/*.tsx|*components/*.ts)
                        mod_type="feat"
                        scope="components"
                        ;;
                    *.json|*.config.*)
                        mod_type="chore"
                        scope="config"
                        ;;
                esac
                
                if [ -f "$SESSION_LOGGER" ]; then
                    "$SESSION_LOGGER" modification "$mod_type" "$scope" "Modification de $file"
                fi
            fi
        done
    fi
}

# Générer un résumé de la session pour le commit
generate_session_summary() {
    log_ai "📊 Génération du résumé de session..."
    
    if [ -f "$SESSION_LOGGER" ]; then
        "$SESSION_LOGGER" status
        echo ""
        echo -e "${GREEN}🎯 Message de commit suggéré:${NC}"
        echo -e "${YELLOW}$("$SESSION_LOGGER" generate)${NC}"
    fi
}

# Workflow complet pour une session IA
ai_workflow() {
    local phase="$1"
    
    case "$phase" in
        "start")
            local topic="$2"
            start_ai_session "$topic" "development"
            ;;
        "request")
            local request="$2"
            log_ai_request "$request"
            ;;
        "implement")
            local type="$2"
            local scope="$3"
            local desc="$4"
            log_ai_response "$type" "$scope" "$desc"
            ;;
        "analyze")
            auto_log_file_changes
            ;;
        "summary")
            generate_session_summary
            ;;
        "commit")
            log_ai "🚀 Lancement du commit automatique..."
            if [ -f "$SCRIPT_DIR/05-quick-commit.sh" ]; then
                "$SCRIPT_DIR/05-quick-commit.sh"
            else
                echo "Script quick-commit non trouvé"
            fi
            ;;
        *)
            echo "Phase inconnue: $phase"
            echo "Phases disponibles: start, request, implement, analyze, summary, commit"
            ;;
    esac
}

# Raccourcis pour les cas d'usage courants
case "$1" in
    "session")
        start_ai_session "$2" "$3"
        ;;
    "ask")
        log_ai_request "$2" "$3"
        ;;
    "done")
        log_ai_response "$2" "$3" "$4"
        ;;
    "auto")
        auto_log_file_changes
        ;;
    "summary")
        generate_session_summary
        ;;
    "commit")
        ai_workflow "commit"
        ;;
    "workflow")
        ai_workflow "$2" "$3" "$4" "$5"
        ;;
    *)
        echo -e "${GREEN}🤖 AI Session Tracker - Automatisation des messages de commit${NC}"
        echo ""
        echo "Usage: $0 <commande> [arguments...]"
        echo ""
        echo "Commandes principales:"
        echo "  session <sujet> [catégorie]     - Démarrer une session IA"
        echo "  ask <question> [catégorie]      - Logger une question à l'IA"
        echo "  done <type> <scope> <desc>      - Logger une implémentation IA"
        echo "  auto                            - Analyser automatiquement les modifications"
        echo "  summary                         - Afficher le résumé et message suggéré"
        echo "  commit                          - Lancer le commit automatique"
        echo ""
        echo "Workflow complet:"
        echo "  workflow start <sujet>          - Démarrer"
        echo "  workflow request <question>     - Poser une question"
        echo "  workflow implement <type> <scope> <desc> - Logger l'implémentation"
        echo "  workflow analyze                - Analyser les changements"
        echo "  workflow summary                - Résumé"
        echo "  workflow commit                 - Commit final"
        echo ""
        echo "Exemples:"
        echo "  $0 session \"Système auto-commit\" \"automation\""
        echo "  $0 ask \"Comment automatiser les messages de commit?\""
        echo "  $0 done \"feat\" \"scripts\" \"Création du session logger\""
        echo "  $0 auto"
        echo "  $0 commit"
        ;;
esac





























