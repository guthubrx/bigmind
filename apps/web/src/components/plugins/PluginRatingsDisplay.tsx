/**
 * Plugin Ratings Display Component
 * Shows aggregated ratings and individual reviews
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import {
  getPluginRatings,
  getPluginRatingsAggregate,
  type PluginRating,
  type PluginRatingsAggregate,
} from '../../services/supabaseClient';
import { RatingReplyForm } from './RatingReplyForm';
import { RatingRepliesList } from './RatingRepliesList';
import './PluginRatingsDisplay.css';

export interface PluginRatingsDisplayProps {
  pluginId: string;
  refreshTrigger?: number;
}

export function PluginRatingsDisplay({ pluginId, refreshTrigger }: PluginRatingsDisplayProps) {
  const [aggregate, setAggregate] = useState<PluginRatingsAggregate | null>(null);
  const [ratings, setRatings] = useState<PluginRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'recent' | 'highest'>('recent');
  const [repliesRefresh, setRepliesRefresh] = useState(0);
  const itemsPerPage = 5;

  const loadRatings = useCallback(async () => {
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
  }, [pluginId]);

  useEffect(() => {
    loadRatings();
    setCurrentPage(1); // Reset pagination when refresh triggered
  }, [pluginId, refreshTrigger, loadRatings]);

  // Sort and paginate ratings
  const sortedRatings = [...ratings].sort((a, b) => {
    if (sortOrder === 'recent') {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    return b.rating - a.rating;
  });

  const totalPages = Math.ceil(sortedRatings.length / itemsPerPage);
  const paginatedRatings = sortedRatings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h4 className="plugin-ratings-display__list-title">Les avis ({ratings.length})</h4>
          {ratings.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={sortOrder}
                onChange={e => {
                  setSortOrder(e.target.value as 'recent' | 'highest');
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--fg-primary)',
                  fontSize: '12px',
                }}
              >
                <option value="recent">Plus récents</option>
                <option value="highest">Meilleure note</option>
              </select>
            </div>
          )}
        </div>
        {paginatedRatings.map(rating => {
          const ratingId = rating.id || '';
          return (
            <div key={ratingId} className="plugin-ratings-display__rating-card">
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
              {rating.comment && (
                <p className="plugin-ratings-display__rating-comment">{rating.comment}</p>
              )}
              {ratingId && (
                <>
                  <RatingRepliesList ratingId={ratingId} refreshTrigger={repliesRefresh} />
                  <RatingReplyForm
                    ratingId={ratingId}
                    onSuccess={() => setRepliesRefresh(prev => prev + 1)}
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--fg-primary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
                fontSize: '12px',
              }}
            >
              ← Précédent
            </button>
            <span style={{ padding: '6px 12px', color: 'var(--fg-tertiary)', fontSize: '12px' }}>
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--fg-primary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
                fontSize: '12px',
              }}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PluginRatingsDisplay;
