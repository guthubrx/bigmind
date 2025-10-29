#!/bin/bash

set -e  # Exit on error

echo "☁️  Déploiement Cloudflare Worker - BigMind Registry API"
echo "========================================================"
echo ""

# Configuration
WORKER_DIR="$HOME/bigmind-registry"
BUCKET_NAME="bigmind-plugins"

echo "📋 Étape 1/5: Vérification des prérequis..."

# Vérifier si wrangler est installé
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI n'est pas installé"
    echo ""
    echo "Installation:"
    echo "   npm install -g wrangler"
    echo ""
    read -p "Voulez-vous installer wrangler maintenant? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g wrangler
        echo "✅ Wrangler installé"
    else
        echo "❌ Installation annulée"
        exit 1
    fi
else
    echo "✅ Wrangler CLI est installé"
fi

echo ""
echo "📁 Étape 2/5: Création du dossier de projet..."

if [ -d "$WORKER_DIR" ]; then
    echo "⚠️  Le dossier $WORKER_DIR existe déjà"
    read -p "Voulez-vous le supprimer et recommencer? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$WORKER_DIR"
        echo "✅ Dossier supprimé"
    else
        echo "⏸️  Utilisation du dossier existant"
    fi
fi

mkdir -p "$WORKER_DIR"
cd "$WORKER_DIR"
echo "✅ Dossier créé: $WORKER_DIR"

echo ""
echo "📝 Étape 3/5: Copie des fichiers de configuration..."

# Copier worker.js
cp /home/user/bigmind/cloudflare-worker-template.js "$WORKER_DIR/worker.js"
echo "✅ worker.js copié"

# Créer wrangler.toml
cat > "$WORKER_DIR/wrangler.toml" << EOF
name = "bigmind-registry"
main = "worker.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "$BUCKET_NAME"

[vars]
ENVIRONMENT = "production"
EOF
echo "✅ wrangler.toml créé"

echo ""
echo "🔐 Étape 4/5: Connexion à Cloudflare..."
echo ""
echo "Une fenêtre de navigateur va s'ouvrir pour vous connecter à Cloudflare."
read -p "Appuyez sur Entrée pour continuer..."

wrangler login

echo ""
echo "✅ Connexion réussie!"

echo ""
echo "🚀 Étape 5/5: Déploiement du Worker..."
echo ""
echo "⚠️  IMPORTANT: Assurez-vous que:"
echo "   1. Le bucket R2 '$BUCKET_NAME' existe"
echo "   2. Vous avez les permissions nécessaires"
echo ""
read -p "Voulez-vous déployer maintenant? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Déploiement en cours..."
    wrangler deploy

    echo ""
    echo "✅ ✅ ✅ Worker déployé avec succès! ✅ ✅ ✅"
    echo ""
    echo "📍 Fichiers du projet: $WORKER_DIR"
    echo ""
    echo "🔗 Prochaines étapes:"
    echo ""
    echo "1. Copier l'URL du Worker (affichée ci-dessus)"
    echo "   Format: https://bigmind-registry.xxx.workers.dev"
    echo ""
    echo "2. Mettre à jour BigMind app:"
    echo "   cd /home/user/bigmind"
    echo "   echo 'VITE_MARKETPLACE_URL=https://bigmind-registry.xxx.workers.dev' >> .env"
    echo ""
    echo "3. Tester l'API:"
    echo "   curl https://bigmind-registry.xxx.workers.dev/api/health"
    echo "   curl https://bigmind-registry.xxx.workers.dev/api/plugins"
    echo ""
    echo "4. Démarrer BigMind et tester:"
    echo "   cd /home/user/bigmind"
    echo "   pnpm dev"
    echo "   # Ouvrir http://localhost:3000 → Plugins → Remote tab"
    echo ""
else
    echo ""
    echo "⏸️  Déploiement annulé"
    echo ""
    echo "Pour déployer plus tard:"
    echo "   cd $WORKER_DIR"
    echo "   wrangler deploy"
fi

echo ""
echo "📚 Documentation complète: /home/user/bigmind/DEPLOYMENT_GUIDE.md"
echo ""
