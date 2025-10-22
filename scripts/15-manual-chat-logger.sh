#!/bin/bash

# FR: Logger manuel des échanges de chat (sans extension)
# EN: Manual chat logger (without extension)
# Usage: ./scripts/15-manual-chat-logger.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAT_LOG="logs/sessions/manual_chat.log"
SESSION_LOGGER="$SCRIPT_DIR/09-session-logger.sh"
CONVERSATION_LOGGER="$SCRIPT_DIR/11-conversation-auto-logger.sh"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_manual() {
    echo -e "${BLUE}[MANUAL-LOGGER]${NC} $*"
}

# Créer le répertoire
mkdir -p "logs/sessions"

# Interface interactive pour logger les échanges
interactive_logger() {
    log_manual "🗨️ Logger manuel des échanges de chat"
    echo ""
    echo "Commandes disponibles:"
    echo "  u <message>  - Ajouter un message utilisateur"
    echo "  a <message>  - Ajouter une réponse IA"
    echo "  s           - Afficher les derniers échanges"
    echo "  c           - Nettoyer le log"
    echo "  analyze     - Analyser et générer le commit"
    echo "  quit        - Quitter"
    echo ""
    
    while true; do
        read -p "> " -r input
        
        case "$input" in
            "quit"|"q"|"exit")
                log_manual "👋 Au revoir !"
                break
                ;;
            "s"|"show")
                show_recent_exchanges
                ;;
            "c"|"clear")
                clear_log
                ;;
            "analyze"|"a")
                analyze_and_commit
                ;;
            u\ *)
                message="${input#u }"
                add_user_message "$message"
                ;;
            a\ *)
                message="${input#a }"
                add_ai_message "$message"
                ;;
            *)
                echo "Commande inconnue. Tapez 'quit' pour quitter."
                ;;
        esac
    done
}

# Ajouter un message utilisateur
add_user_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] USER: $message" >> "$CHAT_LOG"
    log_manual "👤 Message utilisateur ajouté"
}

# Ajouter une réponse IA
add_ai_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] AI: $message" >> "$CHAT_LOG"
    log_manual "🤖 Réponse IA ajoutée"
}

# Afficher les derniers échanges
show_recent_exchanges() {
    if [ -f "$CHAT_LOG" ]; then
        log_manual "📖 Derniers échanges:"
        tail -n 10 "$CHAT_LOG" | while read -r line; do
            if [[ $line == *"USER:"* ]]; then
                echo -e "  ${GREEN}$line${NC}"
            else
                echo -e "  ${PURPLE}$line${NC}"
            fi
        done
    else
        log_manual "⚠️ Aucun échange enregistré"
    fi
}

# Nettoyer le log
clear_log() {
    > "$CHAT_LOG"
    log_manual "🗑️ Log nettoyé"
}

# Convertir le log manuel en format standard
convert_to_standard_format() {
    local standard_file="logs/sessions/chat_input.txt"
    
    if [ ! -f "$CHAT_LOG" ]; then
        log_manual "❌ Aucun log manuel trouvé"
        return 1
    fi
    
    # Convertir le format avec timestamp vers le format standard
    > "$standard_file"
    
    grep -E "USER:|AI:" "$CHAT_LOG" | while read -r line; do
        # Extraire juste USER: ou AI: + message
        if [[ $line == *"USER:"* ]]; then
            message=$(echo "$line" | sed 's/.*USER: /USER: /')
            echo "$message" >> "$standard_file"
        elif [[ $line == *"AI:"* ]]; then
            message=$(echo "$line" | sed 's/.*AI: /AI: /')
            echo "$message" >> "$standard_file"
        fi
    done
    
    log_manual "✅ Converti vers le format standard: $standard_file"
    return 0
}

# Analyser et générer le commit
analyze_and_commit() {
    log_manual "🔍 Analyse des échanges manuels..."
    
    # Convertir vers le format standard
    convert_to_standard_format
    
    # Lancer l'analyse
    if [ -f "$CONVERSATION_LOGGER" ]; then
        "$CONVERSATION_LOGGER" analyze
        
        echo ""
        read -p "Procéder au commit automatique ? [Y/n] " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            if [ -f "$SCRIPT_DIR/05-quick-commit.sh" ]; then
                "$SCRIPT_DIR/05-quick-commit.sh"
            else
                log_manual "⚠️ Script quick-commit non trouvé"
            fi
        fi
    else
        log_manual "⚠️ Script d'analyse non trouvé"
    fi
}

# Mode batch : ajouter plusieurs échanges d'un coup
batch_mode() {
    log_manual "📝 Mode batch - Ajout de plusieurs échanges"
    echo ""
    echo "Collez vos échanges (format: USER: message ou AI: message)"
    echo "Tapez 'END' sur une ligne vide pour terminer"
    echo ""
    
    while IFS= read -r line; do
        if [ "$line" = "END" ]; then
            break
        fi
        
        if [[ $line == USER:* ]]; then
            message="${line#USER: }"
            add_user_message "$message"
        elif [[ $line == AI:* ]]; then
            message="${line#AI: }"
            add_ai_message "$message"
        elif [ -n "$line" ]; then
            log_manual "⚠️ Format invalide: $line (utilisez USER: ou AI:)"
        fi
    done
    
    log_manual "✅ Échanges ajoutés"
}

# Interface principale
case "$1" in
    "interactive"|"i")
        interactive_logger
        ;;
    "batch"|"b")
        batch_mode
        ;;
    "analyze"|"a")
        analyze_and_commit
        ;;
    "show"|"s")
        show_recent_exchanges
        ;;
    "clear"|"c")
        clear_log
        ;;
    "convert")
        convert_to_standard_format
        ;;
    *)
        echo -e "${GREEN}🗨️ Manual Chat Logger${NC}"
        echo ""
        echo "Logger manuel des échanges de chat (alternative aux extensions)"
        echo ""
        echo "Usage: $0 <commande>"
        echo ""
        echo "Commandes:"
        echo "  interactive|i  - Mode interactif (recommandé)"
        echo "  batch|b        - Mode batch (coller plusieurs échanges)"
        echo "  analyze|a      - Analyser et committer"
        echo "  show|s         - Afficher les derniers échanges"
        echo "  clear|c        - Nettoyer le log"
        echo "  convert        - Convertir vers format standard"
        echo ""
        echo "Exemples:"
        echo "  $0 interactive    # Mode interactif"
        echo "  $0 batch          # Mode batch"
        echo "  $0 analyze        # Analyser et committer"
        echo ""
        echo "💡 Alternative parfaite quand les extensions ne marchent pas !"
        echo ""
        echo "🎯 Workflow recommandé:"
        echo "  1. $0 interactive"
        echo "  2. Tapez 'u votre question'"
        echo "  3. Tapez 'a résumé de la réponse'"
        echo "  4. Répétez pour chaque échange"
        echo "  5. Tapez 'analyze' pour générer le commit"
        ;;
esac























