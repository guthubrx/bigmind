#!/bin/bash

# FR: Logger de session pour génération automatique de messages de commit
# EN: Session logger for automatic commit message generation
# Usage: ./scripts/09-session-logger.sh <action> [details]

set -e

# Configuration
SESSION_LOG_DIR="logs/sessions"
CURRENT_SESSION_FILE="$SESSION_LOG_DIR/current_session.json"
COMMIT_CONTEXT_FILE="$SESSION_LOG_DIR/commit_context.json"
mkdir -p "$SESSION_LOG_DIR"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_debug() {
    echo -e "${BLUE}[SESSION]${NC} $*"
}

# Initialiser une nouvelle session
init_session() {
    local session_id=$(date +"%Y%m%d_%H%M%S")
    cat > "$CURRENT_SESSION_FILE" << EOF
{
  "session_id": "$session_id",
  "start_time": "$(date -Iseconds)",
  "topics": [],
  "modifications": [],
  "files_changed": [],
  "commit_suggestions": []
}
EOF
    log_debug "🚀 Nouvelle session initialisée: $session_id"
}

# Logger un sujet de discussion
log_topic() {
    local topic="$1"
    local category="${2:-general}"
    
    if [ ! -f "$CURRENT_SESSION_FILE" ]; then
        init_session
    fi
    
    # Ajouter le sujet à la session
    local timestamp=$(date -Iseconds)
    local temp_file=$(mktemp)
    
    jq --arg topic "$topic" --arg category "$category" --arg timestamp "$timestamp" \
       '.topics += [{"topic": $topic, "category": $category, "timestamp": $timestamp}]' \
       "$CURRENT_SESSION_FILE" > "$temp_file" && mv "$temp_file" "$CURRENT_SESSION_FILE"
    
    log_debug "📝 Sujet loggé: [$category] $topic"
}

# Logger une modification
log_modification() {
    local type="$1"        # feat, fix, refactor, docs, style, test, chore
    local scope="$2"       # component, script, config, etc.
    local description="$3"
    local files="$4"       # fichiers modifiés (optionnel)
    
    if [ ! -f "$CURRENT_SESSION_FILE" ]; then
        init_session
    fi
    
    local timestamp=$(date -Iseconds)
    local temp_file=$(mktemp)
    
    jq --arg type "$type" --arg scope "$scope" --arg description "$description" \
       --arg files "$files" --arg timestamp "$timestamp" \
       '.modifications += [{
         "type": $type,
         "scope": $scope, 
         "description": $description,
         "files": $files,
         "timestamp": $timestamp
       }]' "$CURRENT_SESSION_FILE" > "$temp_file" && mv "$temp_file" "$CURRENT_SESSION_FILE"
    
    log_debug "🔧 Modification loggée: $type($scope): $description"
}

# Analyser les fichiers modifiés depuis le dernier commit
analyze_changes() {
    log_debug "🔍 Analyse des modifications..."
    
    # Obtenir les fichiers modifiés
    local staged_files=$(git diff --cached --name-only 2>/dev/null || echo "")
    local modified_files=$(git diff --name-only 2>/dev/null || echo "")
    local all_files="$staged_files $modified_files"
    
    if [ -z "$all_files" ]; then
        log_debug "Aucune modification détectée"
        return 0
    fi
    
    # Analyser les types de modifications
    local has_scripts=false
    local has_docs=false
    local has_components=false
    local has_config=false
    local has_tests=false
    
    for file in $all_files; do
        case "$file" in
            scripts/*.sh) has_scripts=true ;;
            *.md) has_docs=true ;;
            *components/*.tsx|*components/*.ts) has_components=true ;;
            *.json|*.config.*|*.yml|*.yaml) has_config=true ;;
            *test*|*spec*) has_tests=true ;;
        esac
    done
    
    # Logger les modifications détectées
    if [ "$has_scripts" = true ]; then
        log_modification "feat" "scripts" "Modifications des scripts d'assistance" "$(echo $all_files | grep 'scripts/' | head -3 | tr '\n' ' ')"
    fi
    
    if [ "$has_docs" = true ]; then
        log_modification "docs" "documentation" "Mise à jour de la documentation" "$(echo $all_files | grep '\.md$' | head -3 | tr '\n' ' ')"
    fi
    
    if [ "$has_components" = true ]; then
        log_modification "feat" "components" "Modifications des composants React" "$(echo $all_files | grep 'components/' | head -3 | tr '\n' ' ')"
    fi
    
    if [ "$has_config" = true ]; then
        log_modification "chore" "config" "Modifications de configuration" "$(echo $all_files | grep -E '\.(json|config|yml|yaml)$' | head -3 | tr '\n' ' ')"
    fi
    
    if [ "$has_tests" = true ]; then
        log_modification "test" "testing" "Modifications des tests" "$(echo $all_files | grep -E '(test|spec)' | head -3 | tr '\n' ' ')"
    fi
}

# Générer un message de commit intelligent
generate_commit_message() {
    if [ ! -f "$CURRENT_SESSION_FILE" ]; then
        echo "chore: modifications diverses"
        return 0
    fi
    
    # Analyser d'abord les changements actuels (silencieusement)
    analyze_changes > /dev/null 2>&1
    
    # Extraire les informations de la session
    local modifications=$(jq -r '.modifications[] | "\(.type):\(.scope):\(.description)"' "$CURRENT_SESSION_FILE" 2>/dev/null || echo "")
    local topics=$(jq -r '.topics[] | .topic' "$CURRENT_SESSION_FILE" 2>/dev/null || echo "")
    
    if [ -z "$modifications" ]; then
        echo "chore: modifications diverses"
        return 0
    fi
    
    # Analyser le type de modification le plus récent/fréquent
    local primary_type=$(echo "$modifications" | cut -d: -f1 | sort | uniq -c | sort -nr | head -1 | awk '{print $2}')
    local primary_scope=$(echo "$modifications" | grep "^$primary_type:" | cut -d: -f2 | head -1)
    
    # Générer une description basée sur les sujets récents
    local description=""
    if echo "$topics" | grep -qi "script\|automation\|assistant"; then
        description="système d'assistance développeur"
    elif echo "$topics" | grep -qi "refactor\|renumérot\|ordre"; then
        description="réorganisation et optimisation"
    elif echo "$topics" | grep -qi "eslint\|fix\|error"; then
        description="corrections automatiques"
    elif echo "$topics" | grep -qi "commit\|message\|auto"; then
        description="automatisation des commits"
    elif echo "$topics" | grep -qi "doc\|guide\|readme"; then
        description="documentation"
    else
        # Utiliser la description de la modification la plus récente
        description=$(echo "$modifications" | head -1 | cut -d: -f3 | sed 's/^[[:space:]]*//')
    fi
    
    # Construire le message final
    local commit_message=""
    if [ -n "$primary_scope" ] && [ "$primary_scope" != "general" ]; then
        commit_message="$primary_type($primary_scope): $description"
    else
        commit_message="$primary_type: $description"
    fi
    
    # Limiter à 72 caractères (bonne pratique Git)
    if [ ${#commit_message} -gt 72 ]; then
        commit_message=$(echo "$commit_message" | cut -c1-69)...
    fi
    
    echo "$commit_message"
}

# Sauvegarder le contexte pour le prochain commit
save_commit_context() {
    local message="$1"
    cat > "$COMMIT_CONTEXT_FILE" << EOF
{
  "last_commit_message": "$message",
  "timestamp": "$(date -Iseconds)",
  "session_id": "$(jq -r '.session_id' "$CURRENT_SESSION_FILE" 2>/dev/null || echo 'unknown')"
}
EOF
}

# Nettoyer la session après commit
cleanup_session() {
    if [ -f "$CURRENT_SESSION_FILE" ]; then
        # Archiver la session
        local session_id=$(jq -r '.session_id' "$CURRENT_SESSION_FILE" 2>/dev/null || date +"%Y%m%d_%H%M%S")
        cp "$CURRENT_SESSION_FILE" "$SESSION_LOG_DIR/session_${session_id}.json"
        
        # Réinitialiser pour la prochaine session
        init_session
    fi
}

# Afficher l'historique des sessions
show_history() {
    echo -e "${GREEN}📚 HISTORIQUE DES SESSIONS :${NC}"
    echo ""
    
    for session_file in "$SESSION_LOG_DIR"/session_*.json; do
        if [ -f "$session_file" ]; then
            local session_id=$(jq -r '.session_id' "$session_file" 2>/dev/null || echo "unknown")
            local start_time=$(jq -r '.start_time' "$session_file" 2>/dev/null || echo "unknown")
            local topic_count=$(jq -r '.topics | length' "$session_file" 2>/dev/null || echo "0")
            local mod_count=$(jq -r '.modifications | length' "$session_file" 2>/dev/null || echo "0")
            
            echo "🗓️  Session: $session_id"
            echo "   📅 Début: $start_time"
            echo "   💬 Sujets: $topic_count"
            echo "   🔧 Modifications: $mod_count"
            echo ""
        fi
    done
}

# Interface en ligne de commande
main() {
    local action="$1"
    shift
    
    case "$action" in
        "init")
            init_session
            ;;
        "topic")
            log_topic "$1" "$2"
            ;;
        "mod"|"modification")
            log_modification "$1" "$2" "$3" "$4"
            ;;
        "analyze")
            analyze_changes
            ;;
        "generate"|"message")
            generate_commit_message
            ;;
        "save")
            save_commit_context "$1"
            ;;
        "cleanup")
            cleanup_session
            ;;
        "history")
            show_history
            ;;
        "status")
            if [ -f "$CURRENT_SESSION_FILE" ]; then
                echo -e "${GREEN}📊 SESSION ACTUELLE :${NC}"
                echo ""
                echo "🆔 ID: $(jq -r '.session_id' "$CURRENT_SESSION_FILE")"
                echo "📅 Début: $(jq -r '.start_time' "$CURRENT_SESSION_FILE")"
                echo "💬 Sujets: $(jq -r '.topics | length' "$CURRENT_SESSION_FILE")"
                echo "🔧 Modifications: $(jq -r '.modifications | length' "$CURRENT_SESSION_FILE")"
                echo ""
                echo "🎯 Message suggéré: $(generate_commit_message)"
            else
                echo "Aucune session active"
            fi
            ;;
        *)
            echo "Usage: $0 <action> [args...]"
            echo ""
            echo "Actions disponibles:"
            echo "  init                     - Initialiser une nouvelle session"
            echo "  topic <sujet> [catégorie] - Logger un sujet de discussion"
            echo "  mod <type> <scope> <desc> - Logger une modification"
            echo "  analyze                  - Analyser les changements Git"
            echo "  generate                 - Générer un message de commit"
            echo "  save <message>           - Sauvegarder le contexte de commit"
            echo "  cleanup                  - Nettoyer la session après commit"
            echo "  history                  - Afficher l'historique des sessions"
            echo "  status                   - Afficher le statut de la session"
            echo ""
            echo "Exemples:"
            echo "  $0 topic \"Création système auto-commit\" \"automation\""
            echo "  $0 mod \"feat\" \"scripts\" \"Nouveau script de logging\""
            echo "  $0 generate"
            ;;
    esac
}

# Vérifier si jq est installé
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️ jq n'est pas installé. Installation recommandée pour le parsing JSON.${NC}"
    echo "Installation: brew install jq (macOS) ou apt install jq (Ubuntu)"
    exit 1
fi

# Exécuter la fonction principale
main "$@"
