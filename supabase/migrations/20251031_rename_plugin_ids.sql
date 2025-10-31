-- ============================================
-- MIGRATION: BigMind → Cartae Plugin IDs
-- Date: 31 Octobre 2025
-- Description: Mise à jour de tous les plugin IDs de com.bigmind.* vers com.cartae.*
-- ============================================

-- ============================================
-- STEP 1: Update plugin_ratings table
-- ============================================
UPDATE plugin_ratings
SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
WHERE "pluginId" LIKE 'com.bigmind.%';

-- ============================================
-- STEP 2: Update plugin_reports table
-- ============================================
UPDATE plugin_reports
SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
WHERE "pluginId" LIKE 'com.bigmind.%';

-- ============================================
-- STEP 3: Update report_submissions table
-- ============================================
UPDATE report_submissions
SET "pluginId" = REPLACE("pluginId", 'com.bigmind.', 'com.cartae.')
WHERE "pluginId" LIKE 'com.bigmind.%';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count updated ratings
SELECT
  'plugin_ratings' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.cartae.%') as cartae_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') as bigmind_count
FROM plugin_ratings;

-- Count updated reports
SELECT
  'plugin_reports' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.cartae.%') as cartae_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') as bigmind_count
FROM plugin_reports;

-- Count updated submissions
SELECT
  'report_submissions' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.cartae.%') as cartae_count,
  COUNT(*) FILTER (WHERE "pluginId" LIKE 'com.bigmind.%') as bigmind_count
FROM report_submissions;

-- List all unique plugin IDs after migration
SELECT DISTINCT "pluginId"
FROM plugin_ratings
ORDER BY "pluginId";
