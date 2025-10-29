-- ============================================
-- FIX: GRANT les permissions aux rôles anon et authenticated
-- ============================================

-- Voir les permissions actuelles
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'plugin_ratings';

-- GRANT toutes les permissions nécessaires
GRANT SELECT, INSERT ON plugin_ratings TO anon;
GRANT SELECT, INSERT ON plugin_ratings TO authenticated;
GRANT UPDATE, DELETE ON plugin_ratings TO authenticated;

-- Pareil pour plugin_rating_replies
GRANT SELECT, INSERT ON plugin_rating_replies TO anon;
GRANT SELECT, INSERT ON plugin_rating_replies TO authenticated;
GRANT UPDATE, DELETE ON plugin_rating_replies TO authenticated;

-- Pareil pour rating_submissions (rate limiting)
GRANT SELECT, INSERT ON rating_submissions TO anon;
GRANT SELECT, INSERT ON rating_submissions TO authenticated;

-- Vérifier que les GRANTS sont bien appliqués
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'plugin_ratings'
ORDER BY grantee, privilege_type;
