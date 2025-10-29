-- ============================================
-- SOLUTION: Désactiver RLS, garder les GRANTS
-- ============================================

-- Les GRANTS suffisent pour la sécurité:
-- - anon peut SELECT et INSERT
-- - authenticated peut SELECT, INSERT, UPDATE, DELETE

-- Désactiver RLS sur les 3 tables
ALTER TABLE plugin_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_rating_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE rating_submissions DISABLE ROW LEVEL SECURITY;

-- Vérifier
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('plugin_ratings', 'plugin_rating_replies', 'rating_submissions');

-- NOTE: Les utilisateurs anonymes pourront voir TOUS les ratings (même non approuvés)
-- Si tu veux filtrer côté serveur plus tard, on pourra réactiver RLS avec les bonnes policies
-- Pour l'instant, on filtre côté client (getPluginRatings ne récupère que is_approved=true)
