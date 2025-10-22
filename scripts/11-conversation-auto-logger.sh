#!/bin/bash

# FR: Auto-logger de conversation pour génération automatique de commits
# EN: Conversation auto-logger for automatic commit generation
# Usage: ./scripts/11-conversation-auto-logger.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_LOGGER="$SCRIPT_DIR/09-session-logger.sh"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_auto() {
    echo -e "${PURPLE}[AUTO-LOGGER]${NC} $*"
}

# Analyser le contenu des échanges de chat
analyze_chat_content() {
    log_auto "💬 Analyse du contenu des échanges de chat..."
    
    # Créer un fichier temporaire pour capturer les échanges
    local chat_input_file="logs/sessions/chat_input.txt"
    mkdir -p "logs/sessions"
    
    if [ -f "$chat_input_file" ]; then
        log_auto "📖 Lecture du fichier d'échanges existant: $chat_input_file"
    else
        log_auto "📝 Création du fichier d'échanges: $chat_input_file"
        cat > "$chat_input_file" << 'EOF'
# Copiez-collez ici le contenu de vos échanges avec l'IA
# Format suggéré:
# USER: votre question ou demande
# AI: réponse de l'IA
# 
# Exemple:
# USER: Comment renuméroter les scripts dans un ordre logique?
# AI: Je vais créer un ordre basé sur l'apprentissage progressif...
# USER: Peux-tu automatiser les messages de commit?
# AI: Excellente idée ! Créons un système qui...
EOF
        log_auto "💡 Fichier créé. Éditez-le avec vos échanges puis relancez l'analyse."
        return 1
    fi
    
    # Analyser le contenu du fichier
    local content=$(cat "$chat_input_file" | grep -v "^#" | grep -v "^$")
    
    if [ -z "$content" ]; then
        log_auto "⚠️ Fichier d'échanges vide ou contient seulement des commentaires"
        log_auto "💡 Ajoutez vos échanges dans: $chat_input_file"
        return 1
    fi
    
    log_auto "🔍 Analyse du contenu des échanges..."
    
    # Extraire les sujets des questions utilisateur
    local user_topics=$(echo "$content" | grep -i "^USER:" | sed 's/^USER: *//' | head -10)
    local ai_responses=$(echo "$content" | grep -i "^AI:" | sed 's/^AI: *//' | head -10)
    
    # Analyser les mots-clés dans les échanges
    local keywords_automation=$(echo "$content" | grep -ci "automat\|script\|génér\|commit" || echo "0")
    local keywords_refactor=$(echo "$content" | grep -ci "refactor\|renumérot\|ordre\|logique\|organis" || echo "0")
    local keywords_docs=$(echo "$content" | grep -ci "document\|guide\|readme\|explic" || echo "0")
    local keywords_features=$(echo "$content" | grep -ci "fonctionnalit\|feature\|nouveau\|créer\|implément" || echo "0")
    local keywords_fix=$(echo "$content" | grep -ci "corriger\|fix\|erreur\|problème\|bug" || echo "0")
    
    log_auto "📊 Analyse des mots-clés:"
    log_auto "   - Automation: $keywords_automation mentions"
    log_auto "   - Refactoring: $keywords_refactor mentions"
    log_auto "   - Documentation: $keywords_docs mentions"
    log_auto "   - Fonctionnalités: $keywords_features mentions"
    log_auto "   - Corrections: $keywords_fix mentions"
    
    # Logger les sujets basés sur l'analyse
    if [ "$keywords_automation" -gt 2 ]; then
        "$SESSION_LOGGER" topic "Automatisation des processus de développement" "automation"
        "$SESSION_LOGGER" mod "feat" "scripts" "Système d'automatisation basé sur les échanges IA"
    fi
    
    if [ "$keywords_refactor" -gt 2 ]; then
        "$SESSION_LOGGER" topic "Refactoring et réorganisation du code" "refactoring"
        "$SESSION_LOGGER" mod "refactor" "scripts" "Réorganisation logique basée sur les discussions"
    fi
    
    if [ "$keywords_docs" -gt 1 ]; then
        "$SESSION_LOGGER" topic "Amélioration de la documentation" "documentation"
        "$SESSION_LOGGER" mod "docs" "documentation" "Documentation basée sur les échanges utilisateur"
    fi
    
    if [ "$keywords_features" -gt 2 ]; then
        "$SESSION_LOGGER" topic "Développement de nouvelles fonctionnalités" "development"
        "$SESSION_LOGGER" mod "feat" "core" "Nouvelles fonctionnalités issues des discussions"
    fi
    
    if [ "$keywords_fix" -gt 1 ]; then
        "$SESSION_LOGGER" topic "Résolution de problèmes" "bugfix"
        "$SESSION_LOGGER" mod "fix" "core" "Corrections basées sur les échanges"
    fi
    
    # Analyser les sujets spécifiques mentionnés
    if echo "$content" | grep -qi "commit.*message\|message.*commit"; then
        "$SESSION_LOGGER" topic "Génération automatique de messages de commit" "automation"
    fi
    
    if echo "$content" | grep -qi "script.*ordre\|numérot.*script"; then
        "$SESSION_LOGGER" topic "Renumérotation des scripts" "organization"
    fi
    
    if echo "$content" | grep -qi "session.*log\|log.*session"; then
        "$SESSION_LOGGER" topic "Système de logging de session" "logging"
    fi
    
    # Afficher un résumé des sujets extraits
    log_auto "💡 Sujets extraits des échanges:"
    if [ -n "$user_topics" ]; then
        echo "$user_topics" | head -5 | while read -r topic; do
            [ -n "$topic" ] && log_auto "   - $topic"
        done
    fi
    
    return 0
}

# Analyser automatiquement les changements Git pour déduire la conversation
analyze_git_history() {
    log_auto "🔍 Analyse de l'historique Git pour reconstituer la conversation..."
    
    # Obtenir les derniers commits
    local recent_commits=$(git log --oneline -10 --since="1 day ago")
    
    if [ -z "$recent_commits" ]; then
        log_auto "Aucun commit récent trouvé"
        return 1
    fi
    
    log_auto "📋 Commits récents détectés:"
    echo "$recent_commits" | while read -r commit; do
        log_auto "   - $commit"
    done
    
    # Analyser les patterns dans les messages de commit
    local has_refactor=$(echo "$recent_commits" | grep -c "refactor" || echo "0")
    local has_feat=$(echo "$recent_commits" | grep -c "feat" || echo "0")
    local has_docs=$(echo "$recent_commits" | grep -c "docs" || echo "0")
    local has_scripts=$(echo "$recent_commits" | grep -c "scripts" || echo "0")
    
    log_auto "🎯 Patterns détectés:"
    log_auto "   - Refactoring: $has_refactor commits"
    log_auto "   - Features: $has_feat commits"
    log_auto "   - Documentation: $has_docs commits"
    log_auto "   - Scripts: $has_scripts commits"
    
    # Reconstituer la session basée sur les patterns
    if [ "$has_refactor" -gt 0 ]; then
        "$SESSION_LOGGER" topic "Refactoring et réorganisation du code" "refactoring"
    fi
    
    if [ "$has_scripts" -gt 2 ]; then
        "$SESSION_LOGGER" topic "Développement système de scripts d'assistance" "automation"
    fi
    
    if [ "$has_docs" -gt 0 ]; then
        "$SESSION_LOGGER" topic "Mise à jour documentation technique" "documentation"
    fi
    
    if [ "$has_feat" -gt 2 ]; then
        "$SESSION_LOGGER" topic "Implémentation nouvelles fonctionnalités" "development"
    fi
}

# Analyser les fichiers modifiés pour déduire le type de travail
analyze_file_changes() {
    log_auto "📁 Analyse des modifications de fichiers..."
    
    # Fichiers modifiés dans les dernières 24h
    local recent_files=$(find . -name "*.sh" -o -name "*.md" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" | \
                        xargs ls -lt | head -20 | awk '{print $9}' | grep -v "^\\.$")
    
    if [ -z "$recent_files" ]; then
        log_auto "Aucune modification récente détectée"
        return 1
    fi
    
    # Analyser les types de fichiers
    local script_count=$(echo "$recent_files" | grep -c "scripts/.*\.sh" || echo "0")
    local doc_count=$(echo "$recent_files" | grep -c "\.md$" || echo "0")
    local code_count=$(echo "$recent_files" | grep -c "\.(ts|tsx)$" || echo "0")
    
    log_auto "📊 Types de modifications:"
    log_auto "   - Scripts: $script_count fichiers"
    log_auto "   - Documentation: $doc_count fichiers"
    log_auto "   - Code: $code_count fichiers"
    
    # Logger les modifications déduites
    if [ "$script_count" -gt 3 ]; then
        "$SESSION_LOGGER" mod "feat" "scripts" "Développement système de scripts d'assistance"
    fi
    
    if [ "$doc_count" -gt 2 ]; then
        "$SESSION_LOGGER" mod "docs" "documentation" "Mise à jour complète de la documentation"
    fi
    
    if [ "$code_count" -gt 0 ]; then
        "$SESSION_LOGGER" mod "feat" "components" "Modifications des composants"
    fi
}

# Détecter automatiquement le contexte de développement
detect_development_context() {
    log_auto "🎯 Détection du contexte de développement..."
    
    # Analyser les noms de branches
    local current_branch=$(git branch --show-current 2>/dev/null || echo "main")
    log_auto "🌿 Branche actuelle: $current_branch"
    
    # Déduire le contexte de la branche
    case "$current_branch" in
        *feature*|*feat*)
            "$SESSION_LOGGER" topic "Développement de nouvelle fonctionnalité" "development"
            ;;
        *refactor*)
            "$SESSION_LOGGER" topic "Refactoring et amélioration du code" "refactoring"
            ;;
        *fix*|*bug*)
            "$SESSION_LOGGER" topic "Correction de bugs" "bugfix"
            ;;
        *docs*)
            "$SESSION_LOGGER" topic "Amélioration de la documentation" "documentation"
            ;;
        *)
            "$SESSION_LOGGER" topic "Développement général" "development"
            ;;
    esac
    
    # Analyser les fichiers récemment créés vs modifiés
    local new_files=$(git status --porcelain | grep "^A" | wc -l | tr -d ' ')
    local modified_files=$(git status --porcelain | grep "^M" | wc -l | tr -d ' ')
    
    if [ "$new_files" -gt "$modified_files" ]; then
        "$SESSION_LOGGER" topic "Création de nouveaux composants/scripts" "creation"
    else
        "$SESSION_LOGGER" topic "Amélioration de composants existants" "enhancement"
    fi
}

# Workflow complet d'auto-logging
auto_log_conversation() {
    log_auto "🚀 Démarrage de l'auto-logging de conversation..."
    
    # Initialiser une nouvelle session
    "$SESSION_LOGGER" init
    
    # Analyser différents aspects
    detect_development_context
    analyze_chat_content  # Nouvelle analyse des échanges de chat
    analyze_git_history
    analyze_file_changes
    
    # Générer le résumé
    log_auto "📊 Résumé de la session auto-générée:"
    "$SESSION_LOGGER" status
    
    echo ""
    log_auto "🎯 Message de commit suggéré:"
    echo -e "${GREEN}$("$SESSION_LOGGER" generate)${NC}"
}

# Générer un commit basé sur l'analyse automatique
auto_commit() {
    log_auto "🤖 Génération automatique du commit..."
    
    # Auto-logger la conversation
    auto_log_conversation
    
    echo ""
    read -p "Procéder au commit avec ce message ? [Y/n] " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        if [ -f "$SCRIPT_DIR/05-quick-commit.sh" ]; then
            "$SCRIPT_DIR/05-quick-commit.sh"
        else
            echo "Script quick-commit non trouvé"
        fi
    else
        log_auto "Commit annulé"
    fi
}

# Interface principale
case "$1" in
    "analyze")
        auto_log_conversation
        ;;
    "commit")
        auto_commit
        ;;
    "history")
        analyze_git_history
        ;;
    "files")
        analyze_file_changes
        ;;
    "context")
        detect_development_context
        ;;
    "chat")
        analyze_chat_content
        ;;
    *)
        echo -e "${GREEN}🤖 Conversation Auto-Logger${NC}"
        echo ""
        echo "Génère automatiquement des messages de commit en analysant:"
        echo "  - L'historique Git récent"
        echo "  - Les fichiers modifiés"
        echo "  - Le contexte de développement"
        echo "  - Les patterns de travail"
        echo ""
        echo "Usage: $0 <commande>"
        echo ""
        echo "Commandes:"
        echo "  analyze    - Analyser et logger automatiquement la conversation"
        echo "  commit     - Analyser + générer + committer automatiquement"
        echo "  chat       - Analyser seulement le contenu des échanges de chat"
        echo "  history    - Analyser seulement l'historique Git"
        echo "  files      - Analyser seulement les fichiers modifiés"
        echo "  context    - Détecter seulement le contexte de développement"
        echo ""
        echo "Exemples:"
        echo "  $0 analyze   # Analyser la session de travail"
        echo "  $0 commit    # Commit automatique intelligent"
        echo ""
        echo "💡 Ce script aurait pu générer automatiquement le message"
        echo "   de votre conversation sans intervention manuelle !"
        ;;
esac
