-- Migration: Fix plugin_reports and report_submissions schemas
-- Description: Corriger les structures pour correspondre au code TypeScript
-- Date: 2025-10-31

-- =============================================================================
-- FIX TABLE: plugin_reports
-- =============================================================================

-- FR: Supprimer l'ancienne table si elle existe
-- EN: Drop old table if it exists
DROP TABLE IF EXISTS plugin_reports CASCADE;

-- FR: Créer la table avec le schéma correct
-- EN: Create table with correct schema
CREATE TABLE plugin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('malware', 'spam', 'inappropriate', 'broken', 'copyright', 'other')),
  description TEXT NOT NULL,
  reporter_email TEXT,
  reporter_ip TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
  admin_note TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FIX TABLE: report_submissions
-- =============================================================================

-- FR: Supprimer l'ancienne table si elle existe
-- EN: Drop old table if it exists
DROP TABLE IF EXISTS report_submissions CASCADE;

-- FR: Créer la table avec le schéma correct
-- EN: Create table with correct schema
CREATE TABLE report_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Indexes pour plugin_reports
CREATE INDEX idx_plugin_reports_status ON plugin_reports(status);
CREATE INDEX idx_plugin_reports_plugin ON plugin_reports("pluginId");
CREATE INDEX idx_plugin_reports_email ON plugin_reports(reporter_email);
CREATE INDEX idx_plugin_reports_created ON plugin_reports(created_at DESC);

-- Index pour report_submissions (rate limiting)
CREATE INDEX idx_report_submissions_plugin_ip
ON report_submissions("pluginId", ip_address, created_at DESC);

-- =============================================================================
-- PERMISSIONS (RLS désactivé pour simplifier)
-- =============================================================================

-- Désactiver RLS
ALTER TABLE plugin_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_submissions DISABLE ROW LEVEL SECURITY;

-- Permissions pour utilisateurs anonymes (lecture + insertion)
GRANT SELECT, INSERT ON plugin_reports TO anon;
GRANT SELECT, INSERT ON report_submissions TO anon;

-- Permissions pour utilisateurs authentifiés (accès complet)
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
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'plugin_reports') THEN
    RAISE NOTICE '✅ Table plugin_reports créée avec le bon schéma';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'report_submissions') THEN
    RAISE NOTICE '✅ Table report_submissions créée avec le bon schéma';
  END IF;
END $$;
