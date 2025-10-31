-- ============================================
-- MIGRATION SIMPLE: BigMind → Cartae Plugin IDs
-- Table: plugin_ratings uniquement
-- ============================================

-- Mise à jour des plugin IDs
UPDATE plugin_ratings
SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
WHERE "pluginId" LIKE 'com.bigmind.%';

-- Vérification des résultats
SELECT
  'Résultat' as status,
  COUNT(*) as total_commentaires,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.cartae.%') as avec_cartae,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') as avec_bigmind,
  CASE
    WHEN COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') = 0 THEN '✅ Migration réussie'
    ELSE '❌ Il reste des IDs BigMind'
  END as message
FROM plugin_ratings;

-- Liste de tous les plugin IDs uniques
SELECT DISTINCT "pluginId" as plugin_ids
FROM plugin_ratings
ORDER BY "pluginId";
