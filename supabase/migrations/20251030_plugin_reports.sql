-- ============================================
-- PLUGIN REPORTS SYSTEM - SETUP
-- Système de signalement de plugins pour modération
-- ============================================

-- ============================================
-- STEP 1: Drop existing table if any
-- ============================================
DROP TABLE IF EXISTS plugin_reports CASCADE;

-- ============================================
-- STEP 2: Create plugin_reports table
-- ============================================
CREATE TABLE plugin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('malware', 'spam', 'inappropriate', 'broken', 'copyright', 'other')),
  description TEXT NOT NULL,
  reporter_email TEXT,
  reporter_ip TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================
CREATE INDEX idx_plugin_reports_pluginId ON plugin_reports("pluginId");
CREATE INDEX idx_plugin_reports_status ON plugin_reports(status);
CREATE INDEX idx_plugin_reports_category ON plugin_reports(category);
CREATE INDEX idx_plugin_reports_created_at ON plugin_reports(created_at DESC);
CREATE INDEX idx_plugin_reports_plugin_status ON plugin_reports("pluginId", status);
CREATE INDEX idx_plugin_reports_ip_created ON plugin_reports(reporter_ip, created_at DESC);

-- ============================================
-- STEP 4: Create report_submissions table (for rate limiting)
-- ============================================
CREATE TABLE IF NOT EXISTS report_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_submissions_plugin_ip ON report_submissions("pluginId", ip_address, created_at DESC);

-- ============================================
-- STEP 5: Disable RLS (use GRANTS for security)
-- ============================================
ALTER TABLE plugin_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_submissions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Grant permissions
-- ============================================

-- Anonymous users can insert and read their own reports
GRANT SELECT, INSERT ON plugin_reports TO anon;
GRANT SELECT, INSERT ON report_submissions TO anon;

-- Authenticated users (admins) can do everything
GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_reports TO authenticated;
GRANT SELECT, INSERT ON report_submissions TO authenticated;

-- ============================================
-- STEP 7: Create function to count pending reports per plugin
-- ============================================
CREATE OR REPLACE FUNCTION get_plugin_report_count(plugin_id TEXT)
RETURNS TABLE(
  total_count BIGINT,
  pending_count BIGINT,
  reviewing_count BIGINT,
  resolved_count BIGINT,
  rejected_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'reviewing') as reviewing_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
  FROM plugin_reports
  WHERE "pluginId" = plugin_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 8: Create trigger to update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_plugin_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_plugin_reports_updated_at
BEFORE UPDATE ON plugin_reports
FOR EACH ROW
EXECUTE FUNCTION update_plugin_reports_updated_at();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plugin_reports'
ORDER BY ordinal_position;

-- Verify indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'plugin_reports';

-- Verify permissions
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'plugin_reports'
ORDER BY grantee, privilege_type;

-- Test function
SELECT * FROM get_plugin_report_count('com.example.test');
