/**
 * Plugin Downloads Tracking
 * Tracks real download/installation counts for plugins
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

-- Vue pour obtenir le nombre de téléchargements par plugin
CREATE OR REPLACE VIEW plugin_download_stats AS
SELECT
  "pluginId",
  COUNT(*) as total_downloads,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips,
  MAX(created_at) as last_download
FROM plugin_downloads
GROUP BY "pluginId";

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
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE plugin_downloads ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les stats
CREATE POLICY "Anyone can read download stats"
  ON plugin_downloads FOR SELECT
  USING (true);

-- Seuls les utilisateurs authentifiés peuvent ajouter des downloads
CREATE POLICY "Authenticated users can record downloads"
  ON plugin_downloads FOR INSERT
  WITH CHECK (true);

-- Grant permissions sur la vue
GRANT SELECT ON plugin_download_stats TO anon;
GRANT SELECT ON plugin_download_stats TO authenticated;

-- Commentaires
COMMENT ON TABLE plugin_downloads IS 'Tracks plugin download/installation events';
COMMENT ON VIEW plugin_download_stats IS 'Aggregated download statistics per plugin';
COMMENT ON FUNCTION record_plugin_download IS 'Records a plugin download event';
