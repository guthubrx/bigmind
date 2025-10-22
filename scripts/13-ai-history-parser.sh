#!/bin/bash

# FR: Parseur pour les exports d'AI Chat History
# EN: Parser for AI Chat History exports
# Usage: ./scripts/13-ai-history-parser.sh <fichier_export.json>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_LOGGER="$SCRIPT_DIR/09-session-logger.sh"
CONVERSATION_LOGGER="$SCRIPT_DIR/11-conversation-auto-logger.sh"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_parser() {
    echo -e "${PURPLE}[AI-HISTORY-PARSER]${NC} $*"
}

# Parser JSON (format probable d'AI Chat History)
parse_json_export() {
    local json_file="$1"
    
    if [ ! -f "$json_file" ]; then
        log_parser "❌ Fichier non trouvé: $json_file"
        return 1
    fi
    
    log_parser "📖 Analyse du fichier JSON: $json_file"
    
    # Créer le fichier d'échanges formaté
    local chat_file="logs/sessions/chat_input.txt"
    mkdir -p "logs/sessions"
    
    # Nettoyer le fichier existant
    > "$chat_file"
    
    # Parser le JSON et extraire les échanges
    # Format attendu: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    if command -v jq >/dev/null 2>&1; then
        log_parser "🔍 Utilisation de jq pour parser le JSON..."
        
        # Extraire les messages avec jq
        jq -r '.[] | "\(.role | ascii_upcase): \(.content)"' "$json_file" >> "$chat_file"
        
    else
        log_parser "⚠️ jq non installé, tentative de parsing manuel..."
        
        # Parser manuel basique (pour JSON simple)
        grep -o '"content":"[^"]*"' "$json_file" | \
        sed 's/"content":"//g' | \
        sed 's/"$//g' | \
        while read -r content; do
            # Déterminer si c'est user ou assistant (logique basique)
            if echo "$content" | grep -qi "question\|demande\|peux\|peut"; then
                echo "USER: $content" >> "$chat_file"
            else
                echo "AI: $content" >> "$chat_file"
            fi
        done
    fi
    
    log_parser "✅ Échanges extraits dans: $chat_file"
    return 0
}

# Parser CSV (format alternatif d'AI Chat History)
parse_csv_export() {
    local csv_file="$1"
    
    if [ ! -f "$csv_file" ]; then
        log_parser "❌ Fichier non trouvé: $csv_file"
        return 1
    fi
    
    log_parser "📖 Analyse du fichier CSV: $csv_file"
    
    local chat_file="logs/sessions/chat_input.txt"
    mkdir -p "logs/sessions"
    
    # Nettoyer le fichier existant
    > "$chat_file"
    
    # Parser CSV (format attendu: role,content,timestamp)
    while IFS=',' read -r role content timestamp; do
        # Nettoyer les guillemets
        role=$(echo "$role" | sed 's/"//g')
        content=$(echo "$content" | sed 's/"//g')
        
        # Convertir en format standard
        if [ "$role" = "user" ]; then
            echo "USER: $content" >> "$chat_file"
        elif [ "$role" = "assistant" ]; then
            echo "AI: $content" >> "$chat_file"
        fi
    done < "$csv_file"
    
    log_parser "✅ Échanges extraits dans: $chat_file"
    return 0
}

# Analyser automatiquement après parsing
auto_analyze_after_parse() {
    log_parser "🔍 Lancement de l'analyse automatique..."
    
    if [ -f "$CONVERSATION_LOGGER" ]; then
        "$CONVERSATION_LOGGER" analyze
    else
        log_parser "⚠️ Script d'analyse non trouvé"
    fi
}

# Workflow complet : parser + analyser + générer commit
full_workflow() {
    local export_file="$1"
    
    if [ -z "$export_file" ]; then
        log_parser "❌ Fichier d'export requis"
        echo "Usage: $0 <fichier_export.json|csv>"
        return 1
    fi
    
    log_parser "🚀 Démarrage du workflow complet..."
    
    # Parser selon l'extension
    case "${export_file##*.}" in
        "json")
            parse_json_export "$export_file"
            ;;
        "csv")
            parse_csv_export "$export_file"
            ;;
        *)
            log_parser "❌ Format non supporté. Utilisez .json ou .csv"
            return 1
            ;;
    esac
    
    # Analyser automatiquement
    auto_analyze_after_parse
    
    # Proposer le commit
    echo ""
    log_parser "🎯 Workflow terminé ! Voulez-vous committer ?"
    read -p "Procéder au commit automatique ? [Y/n] " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        if [ -f "$SCRIPT_DIR/05-quick-commit.sh" ]; then
            "$SCRIPT_DIR/05-quick-commit.sh"
        else
            log_parser "⚠️ Script quick-commit non trouvé"
        fi
    fi
}

# Interface principale
case "$1" in
    "json")
        parse_json_export "$2"
        auto_analyze_after_parse
        ;;
    "csv")
        parse_csv_export "$2"
        auto_analyze_after_parse
        ;;
    "workflow"|"w")
        full_workflow "$2"
        ;;
    *)
        echo -e "${GREEN}🤖 AI History Parser${NC}"
        echo ""
        echo "Parse les exports d'AI Chat History et génère des commits automatiques."
        echo ""
        echo "Usage: $0 <commande> <fichier>"
        echo ""
        echo "Commandes:"
        echo "  json <fichier.json>     - Parser un export JSON"
        echo "  csv <fichier.csv>       - Parser un export CSV"
        echo "  workflow <fichier>      - Parser + analyser + committer"
        echo ""
        echo "Exemples:"
        echo "  $0 json chat_export.json"
        echo "  $0 csv conversation.csv"
        echo "  $0 workflow chat_export.json"
        echo ""
        echo "💡 Compatible avec l'extension 'AI Chat History'"
        echo "   Format attendu: [{\"role\": \"user\", \"content\": \"...\"}]"
        echo ""
        echo "🎯 Workflow recommandé:"
        echo "  1. Installer 'AI Chat History' dans Cursor/VS Code"
        echo "  2. Exporter votre conversation en JSON/CSV"
        echo "  3. Lancer: $0 workflow <fichier_export>"
        echo "  4. Le script génère automatiquement le commit !"
        ;;
esac

























