/**
 * Plugin Detail Modal Component
 * Displays comprehensive plugin information in a modal
 */

import React, { useState, useEffect } from 'react';
import type { PluginManifest } from '@cartae/plugin-system';
import { PluginBadge, type BadgeType } from './PluginBadge';
import { X, Check, Star, Download, Calendar, Tag, ExternalLink } from 'lucide-react';
import { PluginRatingForm } from './PluginRatingForm';
import { PluginRatingsDisplay } from './PluginRatingsDisplay';
import {
  getPluginRatingsAggregate,
  type PluginRatingsAggregate,
  submitQuickRating,
} from '../../services/supabaseClient';
import './PluginDetailModal.css';

export interface PluginDetailModalProps {
  manifest: PluginManifest;
  isActive: boolean;
  canDisable?: boolean;
  onClose: () => void;
  onToggle?: () => void;
}

export function PluginDetailModal({
  manifest,
  isActive,
  canDisable = true,
  onClose,
  onToggle,
}: PluginDetailModalProps) {
  const [ratingsRefresh, setRatingsRefresh] = useState(0);
  const [ratingAggregate, setRatingAggregate] = useState<PluginRatingsAggregate | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [quickRatingHover, setQuickRatingHover] = useState(0); // Support for half stars: 0.5, 1, 1.5, 2, etc.

  // Fetch rating aggregate from Supabase
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const aggregate = await getPluginRatingsAggregate(manifest.id);
        setRatingAggregate(aggregate);
      } catch (error) {
        console.error('[PluginDetailModal] Error fetching rating:', error);
      }
    };
    fetchRating();
  }, [manifest.id, ratingsRefresh]);

  // FR: Gestion de la notation rapide (avec support demi-étoiles)
  // EN: Handle quick rating (with half-star support)
  const handleQuickRating = async (rating: number) => {
    try {
      const success = await submitQuickRating(manifest.id, rating);
      if (success) {
        setRatingsRefresh(prev => prev + 1);
      }
    } catch (error) {
      console.error('[PluginDetailModal] Error submitting quick rating:', error);
    }
  };

  // FR: Gestion du hover avec demi-étoiles
  // EN: Handle hover with half-stars
  const handleStarHover = (star: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const isLeftHalf = x < width / 2;

    // If hovering left half, show half star (star - 0.5)
    // If hovering right half, show full star
    setQuickRatingHover(isLeftHalf ? star - 0.5 : star);
  };

  // FR: Gestion du clic avec demi-étoiles
  // EN: Handle click with half-stars
  const handleStarClick = (star: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const isLeftHalf = x < width / 2;

    const rating = isLeftHalf ? star - 0.5 : star;
    handleQuickRating(rating);
  };

  const getBadges = (): BadgeType[] => {
    const badges: BadgeType[] = [];
    if (manifest.source === 'core') badges.push('core');
    if (isActive) badges.push('active');
    else if (!isActive && canDisable) badges.push('inactive');
    if (manifest.featured) badges.push('featured');
    if (manifest.pricing === 'paid' || manifest.pricing === 'freemium') badges.push('premium');
    if (manifest.source === 'community') badges.push('community');
    return badges;
  };

  const logoUrl = manifest.logo || manifest.icon;

  return (
    <div className="plugin-detail-modal-overlay" onClick={onClose}>
      <div className="plugin-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div
          className="plugin-detail-modal__header"
          style={{ '--plugin-color': manifest.color || '#6B7280' } as React.CSSProperties}
        >
          <button type="button" className="plugin-detail-modal__close" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="plugin-detail-modal__header-content">
            <div className="plugin-detail-modal__logo-container">
              {logoUrl && logoUrl.startsWith('/') ? (
                <img src={logoUrl} alt={manifest.name} className="plugin-detail-modal__logo" />
              ) : (
                <div className="plugin-detail-modal__logo-emoji">{manifest.icon || '🔌'}</div>
              )}
            </div>

            <div className="plugin-detail-modal__header-text">
              <div className="plugin-detail-modal__badges">
                {getBadges().map(badge => (
                  <PluginBadge key={badge} type={badge} />
                ))}
              </div>

              <h2 className="plugin-detail-modal__title">{manifest.name}</h2>

              {manifest.tagline && (
                <p className="plugin-detail-modal__tagline">{manifest.tagline}</p>
              )}

              <div className="plugin-detail-modal__meta">
                <span>v{manifest.version}</span>
                {manifest.author && (
                  <span>
                    par{' '}
                    {typeof manifest.author === 'string' ? manifest.author : manifest.author.name}
                  </span>
                )}
                {manifest.license && <span>Licence {manifest.license}</span>}
              </div>

              <div className="plugin-detail-modal__meta-stats">
                {ratingAggregate && ratingAggregate.totalRatings > 0 && (
                  <span className="plugin-detail-modal__meta-rating">
                    <Star size={14} fill="currentColor" />
                    {ratingAggregate.averageRating.toFixed(1)}/5
                    <span className="plugin-detail-modal__meta-reviews">
                      ({ratingAggregate.totalRatings} avis)
                    </span>
                  </span>
                )}
                {manifest.downloads !== undefined && (
                  <span className="plugin-detail-modal__meta-downloads">
                    <Download size={14} />
                    {manifest.downloads >= 1000
                      ? `${(manifest.downloads / 1000).toFixed(1)}k`
                      : manifest.downloads}{' '}
                    téléchargements
                  </span>
                )}
              </div>
            </div>
          </div>

          {canDisable && onToggle && (
            <button
              type="button"
              className={`plugin-detail-modal__toggle-btn ${
                isActive ? 'plugin-detail-modal__toggle-btn--active' : ''
              }`}
              onClick={onToggle}
            >
              {isActive ? 'Désactiver' : 'Activer'}
            </button>
          )}
        </div>

        {/* Rating Bar - Notez le plugin */}
        <div className="plugin-detail-modal__rating-bar">
          <div className="plugin-detail-modal__rating-bar-left">
            <span className="plugin-detail-modal__rating-bar-label">Notez le plugin</span>
            <div className="plugin-detail-modal__quick-stars">
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = star <= quickRatingHover;
                const isHalfFilled = star - 0.5 <= quickRatingHover && quickRatingHover < star;

                return (
                  <button
                    key={star}
                    type="button"
                    className={`plugin-detail-modal__quick-star ${
                      isFilled
                        ? 'plugin-detail-modal__quick-star--filled'
                        : isHalfFilled
                          ? 'plugin-detail-modal__quick-star--half'
                          : ''
                    }`}
                    onMouseMove={e => handleStarHover(star, e)}
                    onMouseLeave={() => setQuickRatingHover(0)}
                    onClick={e => handleStarClick(star, e)}
                    aria-label={`${star} étoiles`}
                  >
                    {isHalfFilled ? (
                      <div className="star-half-container">
                        <Star size={20} fill="currentColor" className="star-half-filled" />
                        <Star size={20} fill="none" className="star-half-empty" />
                      </div>
                    ) : (
                      <Star size={20} fill={isFilled ? 'currentColor' : 'none'} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            className="plugin-detail-modal__toggle-review"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            Donnez votre avis
            <span className={`chevron ${showReviewForm ? 'chevron--up' : ''}`}>▼</span>
          </button>
        </div>

        {/* Review Form - Collapsible */}
        {showReviewForm && (
          <div className="plugin-detail-modal__review-form-container">
            <PluginRatingForm
              pluginId={manifest.id}
              onSuccess={() => {
                setRatingsRefresh(prev => prev + 1);
                setShowReviewForm(false);
              }}
            />
          </div>
        )}

        {/* Body */}
        <div className="plugin-detail-modal__body">
          {/* Description */}
          {manifest.longDescription && (
            <section className="plugin-detail-modal__section">
              <div
                className="plugin-detail-modal__long-description"
                dangerouslySetInnerHTML={{
                  __html: manifest.longDescription
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                }}
              />
            </section>
          )}

          {/* Benefits */}
          {manifest.benefits && manifest.benefits.length > 0 && (
            <section className="plugin-detail-modal__section">
              <h3 className="plugin-detail-modal__section-title">
                <Check size={20} />
                Avantages
              </h3>
              <ul className="plugin-detail-modal__benefits-list">
                {manifest.benefits.map((benefit, index) => (
                  <li key={`benefit_${index}`}>
                    <Check size={16} className="plugin-detail-modal__check-icon" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Use Cases */}
          {manifest.useCases && manifest.useCases.length > 0 && (
            <section className="plugin-detail-modal__section">
              <h3 className="plugin-detail-modal__section-title">
                <Star size={20} />
                Cas d&apos;usage
              </h3>
              <ul className="plugin-detail-modal__usecases-list">
                {manifest.useCases.map((useCase, index) => (
                  <li key={`usecase_${index}`}>{useCase}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Features */}
          {manifest.features && manifest.features.length > 0 && (
            <section className="plugin-detail-modal__section">
              <h3 className="plugin-detail-modal__section-title">Fonctionnalités</h3>
              <div className="plugin-detail-modal__features-grid">
                {manifest.features.map((feature, index) => (
                  <div key={`feature_${index}`} className="plugin-detail-modal__feature-card">
                    <div className="plugin-detail-modal__feature-icon">{feature.icon || '✨'}</div>
                    <div>
                      <h4 className="plugin-detail-modal__feature-label">{feature.label}</h4>
                      <p className="plugin-detail-modal__feature-description">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stats */}
          <section className="plugin-detail-modal__section">
            <div className="plugin-detail-modal__stats">
              {manifest.downloads !== undefined && (
                <div className="plugin-detail-modal__stat">
                  <Download size={20} />
                  <div>
                    <div className="plugin-detail-modal__stat-value">
                      {manifest.downloads >= 1000
                        ? `${(manifest.downloads / 1000).toFixed(1)}k`
                        : manifest.downloads}
                    </div>
                    <div className="plugin-detail-modal__stat-label">Téléchargements</div>
                  </div>
                </div>
              )}

              {manifest.rating !== undefined && (
                <div className="plugin-detail-modal__stat">
                  <Star size={20} fill="currentColor" />
                  <div>
                    <div className="plugin-detail-modal__stat-value">
                      {manifest.rating.toFixed(1)}/5
                    </div>
                    <div className="plugin-detail-modal__stat-label">Note moyenne</div>
                  </div>
                </div>
              )}

              {manifest.changelog && manifest.changelog.length > 0 && (
                <div className="plugin-detail-modal__stat">
                  <Calendar size={20} />
                  <div>
                    <div className="plugin-detail-modal__stat-value">
                      {manifest.changelog[0].date}
                    </div>
                    <div className="plugin-detail-modal__stat-label">Dernière mise à jour</div>
                  </div>
                </div>
              )}

              {manifest.category && (
                <div className="plugin-detail-modal__stat">
                  <Tag size={20} />
                  <div>
                    <div className="plugin-detail-modal__stat-value">{manifest.category}</div>
                    <div className="plugin-detail-modal__stat-label">Catégorie</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Ratings & Reviews - Separated section */}
          <section className="plugin-detail-modal__section">
            <h3 className="plugin-detail-modal__section-title">
              <Star size={20} />
              Avis et notations
            </h3>
            <PluginRatingsDisplay pluginId={manifest.id} refreshTrigger={ratingsRefresh} />
          </section>

          {/* Links */}
          {(manifest.homepage || manifest.repository || manifest.documentation) && (
            <section className="plugin-detail-modal__section">
              <div className="plugin-detail-modal__links">
                {manifest.homepage && (
                  <a
                    href={manifest.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plugin-detail-modal__link"
                  >
                    <ExternalLink size={16} />
                    Site web
                  </a>
                )}
                {manifest.repository && (
                  <a
                    href={manifest.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plugin-detail-modal__link"
                  >
                    <ExternalLink size={16} />
                    Code source
                  </a>
                )}
                {manifest.documentation && (
                  <a
                    href={manifest.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plugin-detail-modal__link"
                  >
                    <ExternalLink size={16} />
                    Documentation
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default PluginDetailModal;
