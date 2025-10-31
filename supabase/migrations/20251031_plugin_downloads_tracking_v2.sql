/**
 * Plugin Downloads Tracking - Version 2
 * Tracks real download/installation counts for plugins
 * Fixes API access issues
 */

-- Table pour tracker les téléchargements de plugins
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

-- Table matérialisée pour les stats (plus performante qu'une vue)
CREATE MATERIALIZED VIEW IF NOT EXISTS plugin_download_stats AS
SELECT
  "pluginId",
  COUNT(*) as total_downloads,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips,
  MAX(created_at) as last_download
FROM plugin_downloads
GROUP BY "pluginId";

-- Index unique sur pluginId pour refresh concurrent
CREATE UNIQUE INDEX IF NOT EXISTS idx_plugin_download_stats_plugin_id
ON plugin_download_stats("pluginId");

-- Fonction pour rafraîchir les stats
CREATE OR REPLACE FUNCTION refresh_plugin_download_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY plugin_download_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les stats d'un plugin
CREATE OR REPLACE FUNCTION get_plugin_download_stats(p_plugin_id TEXT)
RETURNS TABLE (
  "pluginId" TEXT,
  total_downloads BIGINT,
  unique_users BIGINT,
  unique_ips BIGINT,
  last_download TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s."pluginId",
    s.total_downloads,
    s.unique_users,
    s.unique_ips,
    s.last_download
  FROM plugin_download_stats s
  WHERE s."pluginId" = p_plugin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir toutes les stats
CREATE OR REPLACE FUNCTION get_all_plugin_download_stats()
RETURNS TABLE (
  "pluginId" TEXT,
  total_downloads BIGINT,
  unique_users BIGINT,
  unique_ips BIGINT,
  last_download TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s."pluginId",
    s.total_downloads,
    s.unique_users,
    s.unique_ips,
    s.last_download
  FROM plugin_download_stats s
  ORDER BY s.total_downloads DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour enregistrer un téléchargement
CREATE OR REPLACE FUNCTION record_plugin_download(
  p_plugin_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO plugin_downloads ("pluginId", user_id, ip_address, user_agent)
  VALUES (p_plugin_id, p_user_id, p_ip_address, p_user_agent);

  -- Rafraîchir les stats (asynchrone)
  PERFORM refresh_plugin_download_stats();
EXCEPTION
  WHEN OTHERS THEN
    -- Ne pas bloquer l'insertion si le refresh échoue
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE plugin_downloads ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les downloads
CREATE POLICY "Anyone can read downloads" ON plugin_downloads
  FOR SELECT USING (true);

-- Tout le monde peut enregistrer un download (via la fonction)
CREATE POLICY "Anyone can insert downloads" ON plugin_downloads
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON plugin_downloads TO anon, authenticated;
GRANT INSERT ON plugin_downloads TO anon, authenticated;
GRANT SELECT ON plugin_download_stats TO anon, authenticated;

-- Grant execute sur les fonctions
GRANT EXECUTE ON FUNCTION get_plugin_download_stats(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_all_plugin_download_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_plugin_download(TEXT, UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_plugin_download_stats() TO anon, authenticated;

-- Commentaires
COMMENT ON TABLE plugin_downloads IS 'Tracks plugin download/installation events';
COMMENT ON MATERIALIZED VIEW plugin_download_stats IS 'Aggregated download statistics per plugin';
COMMENT ON FUNCTION record_plugin_download IS 'Records a plugin download event and refreshes stats';
COMMENT ON FUNCTION get_plugin_download_stats IS 'Gets download stats for a specific plugin';
COMMENT ON FUNCTION get_all_plugin_download_stats IS 'Gets download stats for all plugins';
