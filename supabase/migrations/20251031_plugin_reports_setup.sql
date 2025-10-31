-- Migration: Plugin Reports & Report Submissions
-- Description: Tables pour les signalements de plugins et le rate limiting
-- Date: 2025-10-31

-- =============================================================================
-- TABLE: plugin_reports
-- Description: Stocke les signalements de plugins par les utilisateurs
-- =============================================================================

CREATE TABLE IF NOT EXISTS plugin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  "reporterEmail" TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- FR: Contraintes pour éviter les doublons
  -- EN: Constraints to avoid duplicates
  CONSTRAINT unique_plugin_reporter UNIQUE ("pluginId", "reporterEmail")
);

-- =============================================================================
-- TABLE: report_submissions
-- Description: Stocke les timestamps des signalements pour rate limiting
-- Rate limit: 1 signalement par email toutes les 24h
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- FR: Index pour recherche rapide par email et timestamp
  -- EN: Index for fast lookup by email and timestamp
  CONSTRAINT idx_email_timestamp UNIQUE (email, submitted_at)
);

-- =============================================================================
-- INDEXES
-- Description: Index pour optimiser les requêtes
-- =============================================================================

-- Index pour filtrer par statut (pending, reviewing, etc.)
CREATE INDEX IF NOT EXISTS idx_plugin_reports_status
ON plugin_reports(status);

-- Index pour rechercher par plugin
CREATE INDEX IF NOT EXISTS idx_plugin_reports_plugin
ON plugin_reports("pluginId");

-- Index pour rechercher par email (reporter)
CREATE INDEX IF NOT EXISTS idx_plugin_reports_email
ON plugin_reports("reporterEmail");

-- Index pour rechercher les signalements récents
CREATE INDEX IF NOT EXISTS idx_plugin_reports_created
ON plugin_reports(created_at DESC);

-- Index pour rate limiting (recherche par email et timestamp récent)
CREATE INDEX IF NOT EXISTS idx_report_submissions_email
ON report_submissions(email, submitted_at DESC);

-- =============================================================================
-- PERMISSIONS (RLS désactivé pour simplifier)
-- Description: Même modèle que plugin_ratings
-- =============================================================================

-- Désactiver RLS pour simplifier l'accès
ALTER TABLE plugin_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_submissions DISABLE ROW LEVEL SECURITY;

-- Permissions pour les utilisateurs anonymes (lecture + insertion)
GRANT SELECT, INSERT ON plugin_reports TO anon;
GRANT SELECT, INSERT ON report_submissions TO anon;

-- Permissions pour les utilisateurs authentifiés (accès complet)
GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON report_submissions TO authenticated;

-- =============================================================================
-- FONCTION: Nettoyage automatique des report_submissions
-- Description: Supprimer les submissions de plus de 24h (pas besoin de les garder)
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_report_submissions()
RETURNS void AS $$
BEGIN
  DELETE FROM report_submissions
  WHERE submitted_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Note: Pour exécuter automatiquement, configurer un cron job dans Supabase Dashboard
-- (Database → Cron Jobs → Add new cron job → Schedule: 0 * * * * → Function: cleanup_old_report_submissions)

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

-- Vérifier que les tables sont créées
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'plugin_reports') THEN
    RAISE NOTICE '✅ Table plugin_reports créée';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'report_submissions') THEN
    RAISE NOTICE '✅ Table report_submissions créée';
  END IF;
END $$;
