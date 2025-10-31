/**
 * Plugin Downloads Tracking - Simple Version
 * Version simplifiée sans materialized view
 */

-- Drop existing objects if they exist
DROP FUNCTION IF EXISTS get_plugin_download_stats(TEXT);
DROP FUNCTION IF EXISTS get_all_plugin_download_stats();
DROP FUNCTION IF EXISTS record_plugin_download(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS refresh_plugin_download_stats();
DROP MATERIALIZED VIEW IF EXISTS plugin_download_stats;
DROP VIEW IF EXISTS plugin_download_stats;

-- Table pour tracker les téléchargements
CREATE TABLE IF NOT EXISTS plugin_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "pluginId" TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_plugin_downloads_plugin_id ON plugin_downloads("pluginId");
CREATE INDEX IF NOT EXISTS idx_plugin_downloads_created_at ON plugin_downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_plugin_downloads_user_id ON plugin_downloads(user_id);

-- Fonction pour obtenir les stats d'un plugin (calcul à la volée)
CREATE OR REPLACE FUNCTION get_plugin_download_stats(p_plugin_id TEXT)
RETURNS TABLE (
  "pluginId" TEXT,
  total_downloads BIGINT,
  unique_users BIGINT,
  unique_ips BIGINT,
  last_download TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_plugin_id,
    COUNT(*)::BIGINT as total_downloads,
    COUNT(DISTINCT user_id)::BIGINT as unique_users,
    COUNT(DISTINCT ip_address)::BIGINT as unique_ips,
    MAX(created_at) as last_download
  FROM plugin_downloads
  WHERE "pluginId" = p_plugin_id
  GROUP BY "pluginId"
  HAVING COUNT(*) > 0;

  -- Si pas de résultats, retourner une ligne avec des zéros
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      p_plugin_id,
      0::BIGINT,
      0::BIGINT,
      0::BIGINT,
      NOW() as last_download;
  END IF;
END;
$$;

-- Fonction pour obtenir toutes les stats
CREATE OR REPLACE FUNCTION get_all_plugin_download_stats()
RETURNS TABLE (
  "pluginId" TEXT,
  total_downloads BIGINT,
  unique_users BIGINT,
  unique_ips BIGINT,
  last_download TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d."pluginId",
    COUNT(*)::BIGINT as total_downloads,
    COUNT(DISTINCT d.user_id)::BIGINT as unique_users,
    COUNT(DISTINCT d.ip_address)::BIGINT as unique_ips,
    MAX(d.created_at) as last_download
  FROM plugin_downloads d
  GROUP BY d."pluginId"
  ORDER BY COUNT(*) DESC;
END;
$$;

-- Fonction pour enregistrer un téléchargement
CREATE OR REPLACE FUNCTION record_plugin_download(
  p_plugin_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO plugin_downloads ("pluginId", user_id, ip_address, user_agent)
  VALUES (p_plugin_id, p_user_id, p_ip_address, p_user_agent);
END;
$$;

-- RLS Policies
ALTER TABLE plugin_downloads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read downloads" ON plugin_downloads;
DROP POLICY IF EXISTS "Anyone can insert downloads" ON plugin_downloads;

-- Tout le monde peut lire les downloads
CREATE POLICY "Anyone can read downloads" ON plugin_downloads
  FOR SELECT USING (true);

-- Tout le monde peut enregistrer un download
CREATE POLICY "Anyone can insert downloads" ON plugin_downloads
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON plugin_downloads TO anon, authenticated;
GRANT INSERT ON plugin_downloads TO anon, authenticated;

-- Grant execute sur les fonctions
GRANT EXECUTE ON FUNCTION get_plugin_download_stats(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_all_plugin_download_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_plugin_download(TEXT, UUID, TEXT, TEXT) TO anon, authenticated;

-- Commentaires
COMMENT ON TABLE plugin_downloads IS 'Tracks plugin download/installation events';
COMMENT ON FUNCTION record_plugin_download IS 'Records a plugin download event';
COMMENT ON FUNCTION get_plugin_download_stats IS 'Gets download stats for a specific plugin';
COMMENT ON FUNCTION get_all_plugin_download_stats IS 'Gets download stats for all plugins';
