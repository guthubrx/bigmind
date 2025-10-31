-- ============================================
-- MIGRATION: BigMind → Cartae Plugin IDs (SAFE VERSION)
-- Date: 31 Octobre 2025
-- Description: Mise à jour de tous les plugin IDs de com.bigmind.* vers com.cartae.*
-- Version: SAFE - Ne met à jour que les tables existantes
-- ============================================

-- ============================================
-- STEP 1: Update plugin_ratings (si elle existe)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plugin_ratings') THEN
    UPDATE plugin_ratings
    SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
    WHERE "pluginId" LIKE 'com.bigmind.%';

    RAISE NOTICE 'plugin_ratings: % ligne(s) mise(s) à jour',
      (SELECT COUNT(*) FROM plugin_ratings WHERE "pluginId" LIKE 'com.cartae.%');
  ELSE
    RAISE NOTICE 'plugin_ratings: Table non trouvée, ignorée';
  END IF;
END $$;

-- ============================================
-- STEP 2: Update plugin_reports (si elle existe)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plugin_reports') THEN
    UPDATE plugin_reports
    SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
    WHERE "pluginId" LIKE 'com.bigmind.%';

    RAISE NOTICE 'plugin_reports: % ligne(s) mise(s) à jour',
      (SELECT COUNT(*) FROM plugin_reports WHERE "pluginId" LIKE 'com.cartae.%');
  ELSE
    RAISE NOTICE 'plugin_reports: Table non trouvée, ignorée';
  END IF;
END $$;

-- ============================================
-- STEP 3: Update report_submissions (si elle existe)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_submissions') THEN
    UPDATE report_submissions
    SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
    WHERE "pluginId" LIKE 'com.bigmind.%';

    RAISE NOTICE 'report_submissions: % ligne(s) mise(s) à jour',
      (SELECT COUNT(*) FROM report_submissions WHERE "pluginId" LIKE 'com.cartae.%');
  ELSE
    RAISE NOTICE 'report_submissions: Table non trouvée, ignorée';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Lister toutes les tables qui pourraient contenir des plugin IDs
SELECT
  table_name,
  CASE
    WHEN table_name = 'plugin_ratings' THEN 'Commentaires/Notes'
    WHEN table_name = 'plugin_reports' THEN 'Signalements'
    WHEN table_name = 'report_submissions' THEN 'Rate limiting'
    ELSE 'Autre'
  END as description
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('plugin_ratings', 'plugin_reports', 'report_submissions')
ORDER BY table_name;

-- Vérifier plugin_ratings (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plugin_ratings') THEN
    RAISE NOTICE '=== VERIFICATION: plugin_ratings ===';
    PERFORM COUNT(*) FROM plugin_ratings;
  END IF;
END $$;

SELECT
  'plugin_ratings' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.cartae.%') as cartae_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') as bigmind_count
FROM plugin_ratings
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plugin_ratings');

-- Lister tous les plugin IDs uniques dans plugin_ratings
SELECT DISTINCT "pluginId"
FROM plugin_ratings
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plugin_ratings')
ORDER BY "pluginId";
