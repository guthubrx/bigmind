#!/bin/bash

# Script de commit automatisé pour la branche actuelle
# Usage: ./commit-branch.sh "message de commit"

set -e

# Vérifier si un message est fourni
if [ $# -eq 0 ]; then
    echo "❌ Erreur: Veuillez fournir un message de commit"
    echo "Usage: $0 \"votre message de commit\""
    exit 1
fi

COMMIT_MSG="$1"
CURRENT_BRANCH=$(git branch --show-current)

# Vérifier s'il y a des changements à committer
if [ -z "$(git status --porcelain)" ]; then
    echo "❌ Aucun changement à committer"
    exit 1
fi

# Afficher le statut actuel
echo "📋 Statut actuel:"
git status --short

echo ""
echo "📝 Message de commit: $COMMIT_MSG"
echo "🌿 Branche actuelle: $CURRENT_BRANCH"
echo ""

# Demander confirmation
read -p "Voulez-vous continuer? (o/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

# Ajouter tous les fichiers modifiés
echo "📦 Ajout des fichiers modifiés..."
git add .

# Créer le commit avec le message formaté
echo "🚀 Création du commit..."
git commit -m "$(cat <<EOF
$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Afficher le commit créé
echo "✅ Commit créé avec succès!"
echo ""
echo "📊 Dernier commit:"
git log -1 --oneline --stat

echo ""
echo "💡 Pour pousser vers le dépôt distant:"
echo "   git push origin $CURRENT_BRANCH"