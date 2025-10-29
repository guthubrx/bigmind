#!/bin/bash

set -e  # Exit on error

echo "🚀 Déploiement du repository bigmind-plugins"
echo "=============================================="
echo ""

# Configuration
GITHUB_REPO="https://github.com/guthubrx/bigmind-plugins.git"
SOURCE_DIR="/tmp/bigmind-plugins"
TARGET_DIR="$HOME/bigmind-plugins-deploy"

# Vérifier que le répertoire source existe
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Erreur: Le répertoire source $SOURCE_DIR n'existe pas"
    exit 1
fi

echo "📦 Étape 1/5: Nettoyage du répertoire cible (si existant)..."
if [ -d "$TARGET_DIR" ]; then
    echo "   Suppression de $TARGET_DIR existant..."
    rm -rf "$TARGET_DIR"
fi

echo "📥 Étape 2/5: Clone du repository GitHub..."
git clone "$GITHUB_REPO" "$TARGET_DIR"
cd "$TARGET_DIR"

echo "📋 Étape 3/5: Copie des fichiers depuis $SOURCE_DIR..."

# Copier les répertoires
echo "   - Copie de .github/workflows..."
mkdir -p .github/workflows
cp -r "$SOURCE_DIR/.github/workflows/"* .github/workflows/

echo "   - Copie de tools/..."
mkdir -p tools
cp -r "$SOURCE_DIR/tools/"* tools/

echo "   - Copie de official/..."
mkdir -p official
cp -r "$SOURCE_DIR/official/"* official/

echo "   - Copie de community/..."
mkdir -p community
cp -r "$SOURCE_DIR/community/"* community/

# Copier les fichiers racine
echo "   - Copie des fichiers racine..."
cp "$SOURCE_DIR/README.md" .
cp "$SOURCE_DIR/CONTRIBUTING.md" .
cp "$SOURCE_DIR/LICENSE" .
cp "$SOURCE_DIR/package.json" .
cp "$SOURCE_DIR/.gitignore" .

echo "✅ Étape 4/5: Vérification des fichiers copiés..."
echo ""
echo "Structure du repository:"
tree -L 2 -a || ls -la
echo ""

echo "📝 Étape 5/5: Commit et push vers GitHub..."
git add .
git status

echo ""
read -p "Voulez-vous continuer avec le commit et push? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Initial commit: BigMind plugins repository

- Complete repository structure
- GitHub Actions CI/CD workflows (validate, publish)
- Plugin validation and build tools
- Hello World example plugin with full implementation
- Comprehensive documentation (README, CONTRIBUTING)
- MIT license for plugins

Ready for:
- GitHub repository creation ✅
- Cloudflare Workers deployment
- Community contributions"

    echo "⬆️  Push vers GitHub..."
    git push origin main

    echo ""
    echo "✅ ✅ ✅ Déploiement réussi! ✅ ✅ ✅"
    echo ""
    echo "🎉 Le repository bigmind-plugins est maintenant déployé sur:"
    echo "   https://github.com/guthubrx/bigmind-plugins"
    echo ""
    echo "📍 Répertoire local: $TARGET_DIR"
    echo ""
    echo "🔗 Prochaines étapes:"
    echo "   1. Configurer Cloudflare R2 (voir README.md)"
    echo "   2. Configurer les GitHub Secrets pour CI/CD"
    echo "   3. Tester le workflow de validation"
else
    echo ""
    echo "⏸️  Déploiement annulé. Les fichiers sont prêts dans:"
    echo "   $TARGET_DIR"
    echo ""
    echo "Pour continuer manuellement:"
    echo "   cd $TARGET_DIR"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git push origin main"
fi

echo ""
echo "📊 Résumé des fichiers:"
echo "   - $(find .github -type f | wc -l) fichiers de workflow GitHub Actions"
echo "   - $(find tools -type f | wc -l) outils de build/validation"
echo "   - $(find official -type f | wc -l) fichiers du plugin exemple"
echo "   - $(find . -maxdepth 1 -type f | wc -l) fichiers racine"
echo ""
