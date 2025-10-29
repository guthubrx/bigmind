/**
 * Plugin Ratings Display Component
 * Shows aggregated ratings and individual reviews
 */

import React, { useEffect, useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import {
  getPluginRatings,
  getPluginRatingsAggregate,
  type PluginRating,
  type PluginRatingsAggregate,
} from '../../services/supabaseClient';
import './PluginRatingsDisplay.css';

export interface PluginRatingsDisplayProps {
  pluginId: string;
  refreshTrigger?: number;
}

export function PluginRatingsDisplay({ pluginId, refreshTrigger }: PluginRatingsDisplayProps) {
  const [aggregate, setAggregate] = useState<PluginRatingsAggregate | null>(null);
  const [ratings, setRatings] = useState<PluginRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRatings = async () => {
    setIsLoading(true);
    try {
      const [agg, ratingsList] = await Promise.all([
        getPluginRatingsAggregate(pluginId),
        getPluginRatings(pluginId),
      ]);
      setAggregate(agg);
      setRatings(ratingsList);
    } catch (error) {
      console.error('[PluginRatingsDisplay] Error loading ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRatings();
  }, [pluginId, refreshTrigger]);

  if (isLoading) {
    return <div className="plugin-ratings-display__loading">Chargement des avis...</div>;
  }

  if (!aggregate || aggregate.totalRatings === 0) {
    return (
      <div className="plugin-ratings-display__empty">
        <MessageCircle size={32} />
        <p>Aucun avis pour le moment. Soyez le premier à laisser un avis !</p>
      </div>
    );
  }

  return (
    <div className="plugin-ratings-display">
      {/* Aggregate Summary */}
      <div className="plugin-ratings-display__summary">
        <div className="plugin-ratings-display__score">
          <div className="plugin-ratings-display__score-value">
            {aggregate.averageRating.toFixed(1)}
          </div>
          <div className="plugin-ratings-display__score-label">/5</div>
        </div>

        <div className="plugin-ratings-display__stats">
          <div className="plugin-ratings-display__stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={`star-${i}`}
                size={20}
                className={
                  i < Math.round(aggregate.averageRating)
                    ? 'plugin-ratings-display__star--filled'
                    : 'plugin-ratings-display__star--empty'
                }
              />
            ))}
          </div>
          <div className="plugin-ratings-display__count">{aggregate.totalRatings} avis</div>
        </div>

        {/* Breakdown */}
        <div className="plugin-ratings-display__breakdown">
          {[5, 4, 3, 2, 1].map(star => {
            const count =
              aggregate.breakdown[
                `${star}star` as 'fivestar' | 'fourstar' | 'threestar' | 'twostar' | 'onestar'
              ];
            const percentage = (count / aggregate.totalRatings) * 100;

            return (
              <div key={star} className="plugin-ratings-display__breakdown-item">
                <span className="plugin-ratings-display__breakdown-label">{star}★</span>
                <div className="plugin-ratings-display__breakdown-bar">
                  <div
                    className="plugin-ratings-display__breakdown-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="plugin-ratings-display__breakdown-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Ratings */}
      <div className="plugin-ratings-display__list">
        <h4 className="plugin-ratings-display__list-title">Les avis</h4>
        {ratings.map(rating => (
          <div key={rating.id} className="plugin-ratings-display__rating-card">
            <div className="plugin-ratings-display__rating-header">
              <div className="plugin-ratings-display__rating-info">
                <span className="plugin-ratings-display__rating-name">{rating.userName}</span>
                <div className="plugin-ratings-display__rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={`rating-star-${i}`}
                      size={14}
                      className={
                        i < rating.rating
                          ? 'plugin-ratings-display__small-star--filled'
                          : 'plugin-ratings-display__small-star--empty'
                      }
                    />
                  ))}
                </div>
              </div>
              <span className="plugin-ratings-display__rating-date">
                {new Date(rating.created_at || '').toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p className="plugin-ratings-display__rating-comment">{rating.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PluginRatingsDisplay;
