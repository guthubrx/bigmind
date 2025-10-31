/**
 * Plugin Download Stats Component
 * Reusable component to display download statistics from Supabase
 */

import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { getPluginDownloadStats, type PluginDownloadStats as Stats } from '../../services/supabaseClient';
import './PluginDownloadStats.css';

export interface PluginDownloadStatsProps {
  pluginId: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showLabel?: boolean;
  variant?: 'inline' | 'stat-card';
  className?: string;
}

export function PluginDownloadStats({
  pluginId,
  size = 'medium',
  showIcon = true,
  showLabel = false,
  variant = 'inline',
  className = '',
}: PluginDownloadStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await getPluginDownloadStats(pluginId);
        setStats(data);
      } catch (error) {
        console.error('[PluginDownloadStats] Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [pluginId]);

  if (isLoading) {
    return null;
  }

  const downloads = stats?.total_downloads ?? 0;

  if (downloads === 0) {
    return null;
  }

  const formatDownloads = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getIconSize = (): number => {
    if (size === 'small') return 12;
    if (size === 'medium') return 14;
    return 20;
  };

  const iconSize = getIconSize();

  if (variant === 'stat-card') {
    return (
      <div className={`plugin-download-stats plugin-download-stats--stat-card ${className}`}>
        <Download size={iconSize} />
        <div>
          <div className="plugin-download-stats__stat-value">{formatDownloads(downloads)}</div>
          <div className="plugin-download-stats__stat-label">Téléchargements</div>
        </div>
      </div>
    );
  }

  return (
    <span className={`plugin-download-stats plugin-download-stats--${size} ${className}`}>
      {showIcon && <Download size={iconSize} />}
      <span className="plugin-download-stats__value">{formatDownloads(downloads)}</span>
      {showLabel && <span className="plugin-download-stats__label">téléchargements</span>}
    </span>
  );
}

export default PluginDownloadStats;
