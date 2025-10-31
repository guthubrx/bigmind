/**
 * Plugin Rating Stats Component
 * Reusable component to display rating statistics from Supabase
 * Format: ★ (4.6/300) where 4.6 is average rating and 300 is vote count
 */

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getPluginRatingsAggregate, type PluginRatingsAggregate } from '../../services/supabaseClient';
import './PluginRatingStats.css';

export interface PluginRatingStatsProps {
  pluginId: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  variant?: 'inline' | 'stat-card';
  className?: string;
}

export function PluginRatingStats({
  pluginId,
  size = 'medium',
  showIcon = true,
  variant = 'inline',
  className = '',
}: PluginRatingStatsProps) {
  const [aggregate, setAggregate] = useState<PluginRatingsAggregate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAggregate = async () => {
      setIsLoading(true);
      try {
        const data = await getPluginRatingsAggregate(pluginId);
        setAggregate(data);
      } catch (error) {
        console.error('[PluginRatingStats] Error fetching aggregate:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAggregate();
  }, [pluginId]);

  if (isLoading) {
    return null;
  }

  if (!aggregate || aggregate.totalRatings === 0) {
    return null;
  }

  const getIconSize = (): number => {
    if (size === 'small') return 12;
    if (size === 'medium') return 14;
    return 20;
  };

  const iconSize = getIconSize();

  if (variant === 'stat-card') {
    return (
      <div className={`plugin-rating-stats plugin-rating-stats--stat-card ${className}`}>
        <Star size={iconSize} fill="currentColor" />
        <div>
          <div className="plugin-rating-stats__stat-value">
            {aggregate.averageRating.toFixed(1)}/5
          </div>
          <div className="plugin-rating-stats__stat-label">Note moyenne</div>
        </div>
      </div>
    );
  }

  return (
    <span className={`plugin-rating-stats plugin-rating-stats--${size} ${className}`}>
      {showIcon && <span className="plugin-rating-stats__star">★</span>}
      <span className="plugin-rating-stats__text">
        ({aggregate.averageRating.toFixed(1)}/{aggregate.totalRatings})
      </span>
    </span>
  );
}

export default PluginRatingStats;
