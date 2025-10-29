/**
 * Top Rated Plugins Widget
 * Displays the 3 highest-rated plugins
 */

import React, { useEffect, useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { getTopRatedPlugins, type TopRatedPlugin } from '../../services/supabaseClient';
import type { PluginManifest } from '@bigmind/plugin-system';
import './TopRatedPlugins.css';

export interface TopRatedPluginsProps {
  allPlugins: PluginManifest[];
  onSelectPlugin?: (pluginId: string) => void;
}

export function TopRatedPlugins({ allPlugins, onSelectPlugin }: TopRatedPluginsProps) {
  const [topPlugins, setTopPlugins] = useState<(TopRatedPlugin & { manifest?: PluginManifest })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopPlugins = async () => {
      setIsLoading(true);
      try {
        const top = await getTopRatedPlugins(3);
        const withManifests = top
          .map(tp => ({
            ...tp,
            manifest: allPlugins.find(p => p.id === tp.pluginId),
          }))
          .filter(tp => tp.manifest); // Only include found plugins
        setTopPlugins(withManifests);
      } catch (error) {
        console.error('[TopRatedPlugins] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopPlugins();
  }, [allPlugins]);

  if (isLoading) {
    return <div className="top-rated-plugins__loading">Chargement...</div>;
  }

  if (topPlugins.length === 0) {
    return null;
  }

  return (
    <div className="top-rated-plugins">
      <div className="top-rated-plugins__header">
        <TrendingUp size={20} />
        <h3>Meilleures notations</h3>
      </div>

      <div className="top-rated-plugins__list">
        {topPlugins.map((plugin, index) => (
          <div
            key={plugin.pluginId}
            className="top-rated-plugins__card"
            onClick={() => onSelectPlugin?.(plugin.pluginId)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelectPlugin?.(plugin.pluginId)}
          >
            <div className="top-rated-plugins__badge">#{index + 1}</div>

            <div className="top-rated-plugins__content">
              <div className="top-rated-plugins__icon">
                {plugin.manifest?.icon || '🔌'}
              </div>

              <div className="top-rated-plugins__info">
                <h4 className="top-rated-plugins__name">{plugin.manifest?.name}</h4>
                <div className="top-rated-plugins__rating">
                  <Star size={14} fill="currentColor" />
                  <span className="top-rated-plugins__score">
                    {plugin.averageRating.toFixed(1)}
                  </span>
                  <span className="top-rated-plugins__count">
                    ({plugin.totalRatings})
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopRatedPlugins;
