#!/bin/bash

# Script de logging automatique des échanges de chat
# Usage: ./12-chat-logger.sh "USER: votre message" ou ./12-chat-logger.sh "AI: réponse de l'IA"

CHAT_LOG="/Users/moi/Nextcloud/10.Scripts/bigmind/bigmind/logs/sessions/chat_input.txt"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Créer le répertoire si nécessaire
mkdir -p "$(dirname "$CHAT_LOG")"

# Fonction pour ajouter un échange
log_exchange() {
    local message="$1"
    echo "[$TIMESTAMP] $message" >> "$CHAT_LOG"
}

# Fonction pour sauvegarder la session complète
save_session() {
    local session_file="/Users/moi/Nextcloud/10.Scripts/bigmind/bigmind/logs/sessions/session_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$session_file" << EOF
# Session de développement BigMind - $(date '+%Y-%m-%d %H:%M:%S')

## Résumé de la session
- **Sujet principal**: Refactoring Settings.tsx
- **Actions réalisées**: 
  - Extraction de composants (355→90 lignes)
  - Création de Settings.css
  - Utilitaires centralisés (colorUtils, shortcutUtils)
  - Correction erreurs ESLint

## Échanges détaillés
$(cat "$CHAT_LOG")

## Fichiers modifiés
$(git diff --name-only HEAD~1 2>/dev/null || echo "Aucun commit récent")

## Commit suggéré
\`\`\`bash
git add .
git commit -m "refactor(settings): extract components and utilities

- Split Settings.tsx into 3 dedicated components (355→90 lines)
- Create Settings.css with reusable classes
- Extract getPastelBackground() to colorUtils.ts
- Extract toAccelerator() to shortcutUtils.ts
- Fix all ESLint errors and improve accessibility"
\`\`\`
EOF

    echo "Session sauvegardée dans: $session_file"
}

# Usage
case "$1" in
    "save")
        save_session
        ;;
    *)
        if [ -n "$1" ]; then
            log_exchange "$1"
            echo "Message ajouté au log"
        else
            echo "Usage: $0 'USER: votre message' ou $0 'AI: réponse' ou $0 save"
        fi
        ;;
esac