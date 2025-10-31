#!/bin/bash

# Script de migration : BigMind → Cartae Plugin IDs
# Exécute la migration SQL sur Supabase

echo "🔄 Migration des Plugin IDs : com.bigmind.* → com.cartae.*"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si la migration existe
MIGRATION_FILE="supabase/migrations/20251031_rename_plugin_ids.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "${RED}❌ Erreur: Fichier de migration non trouvé: $MIGRATION_FILE${NC}"
    exit 1
fi

echo "${BLUE}📄 Fichier de migration trouvé: $MIGRATION_FILE${NC}"
echo ""

# Option 1 : Utiliser Supabase CLI (si installé)
if command -v supabase &> /dev/null; then
    echo "${YELLOW}Option 1: Utiliser Supabase CLI${NC}"
    echo ""
    echo "Commande à exécuter :"
    echo "  supabase db push"
    echo ""
fi

# Option 2 : Exécution manuelle via Dashboard
echo "${YELLOW}Option 2: Exécution manuelle via Supabase Dashboard${NC}"
echo ""
echo "1. Ouvrir le Supabase SQL Editor :"
echo "   ${BLUE}https://supabase.com/dashboard/project/rfnvtosfwvxoysmncrzz/sql/new${NC}"
echo ""
echo "2. Copier le contenu de : ${BLUE}$MIGRATION_FILE${NC}"
echo ""
echo "3. Coller dans l'éditeur SQL et cliquer sur 'Run'"
echo ""
echo "4. Vérifier les résultats :"
echo "   - ${GREEN}✅ cartae_count${NC} devrait être > 0"
echo "   - ${GREEN}✅ bigmind_count${NC} devrait être = 0"
echo ""

# Option 3 : Script Node.js (si souhaité)
echo "${YELLOW}Option 3: Script Node.js automatique${NC}"
echo ""
echo "Voulez-vous que je crée un script Node.js pour automatiser la migration ?"
echo "(Ce script utilisera les variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY)"
echo ""

# Afficher le contenu de la migration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${BLUE}📋 Contenu de la migration :${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$MIGRATION_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${GREEN}✅ Migration prête à être exécutée !${NC}"
echo ""
echo "📊 Tables qui seront mises à jour :"
echo "   1. plugin_ratings        (commentaires/notes)"
echo "   2. plugin_reports        (signalements)"
echo "   3. report_submissions    (rate limiting)"
echo ""
echo "${YELLOW}⚠️  IMPORTANT:${NC} Cette migration est ${GREEN}RÉVERSIBLE${NC} si nécessaire."
echo "   Commande rollback : UPDATE ... SET pluginId = REPLACE(pluginId, 'com.cartae.', 'com.bigmind.')"
echo ""
