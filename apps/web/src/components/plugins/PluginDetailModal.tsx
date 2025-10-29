/**
 * Plugin Detail Modal Component
 * Displays comprehensive plugin information in a modal
 */

import React, { useState } from 'react';
import type { PluginManifest } from '@bigmind/plugin-system';
import { PluginBadge, type BadgeType } from './PluginBadge';
import { X, Check, Star, Download, Calendar, Tag, ExternalLink } from 'lucide-react';
import { StarRatingInput } from './StarRatingInput';
import { PluginRatingService } from '../../services/PluginRatingService';
import { PluginReviews } from './PluginReviews';
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
  const [userRating, setUserRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleRatingSubmit = async (rating: number) => {
    setUserRating(rating);
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Check if rating service is available
    if (!PluginRatingService.isAvailable()) {
      setSubmitMessage({
        type: 'error',
        text: 'Le service de notation n\'est pas encore configuré. Contactez l\'administrateur.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await PluginRatingService.submitRating({
        pluginId: manifest.id,
        pluginName: manifest.name,
        rating,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      setSubmitMessage({ type: 'success', text: 'Merci pour votre note !' });
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Erreur lors de l\'envoi de la note. Réessayez plus tard.',
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <button className="plugin-detail-modal__close" onClick={onClose}>
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
                    par {typeof manifest.author === 'string' ? manifest.author : manifest.author.name}
                  </span>
                )}
                {manifest.license && <span>Licence {manifest.license}</span>}
              </div>

              <div className="plugin-detail-modal__meta-stats">
                {manifest.rating !== undefined && manifest.rating > 0 && (
                  <span className="plugin-detail-modal__meta-rating">
                    <Star size={14} fill="currentColor" />
                    {manifest.rating.toFixed(1)}/5
                    {manifest.reviewCount && <span className="plugin-detail-modal__meta-reviews">({manifest.reviewCount} avis)</span>}
                  </span>
                )}
                {manifest.downloads !== undefined && (
                  <span className="plugin-detail-modal__meta-downloads">
                    <Download size={14} />
                    {manifest.downloads >= 1000
                      ? `${(manifest.downloads / 1000).toFixed(1)}k`
                      : manifest.downloads} téléchargements
                  </span>
                )}
              </div>
            </div>
          </div>

          {canDisable && onToggle && (
            <button
              className={`plugin-detail-modal__toggle-btn ${
                isActive ? 'plugin-detail-modal__toggle-btn--active' : ''
              }`}
              onClick={onToggle}
            >
              {isActive ? 'Désactiver' : 'Activer'}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="plugin-detail-modal__body">
          {/* Description */}
          {manifest.longDescription && (
            <section className="plugin-detail-modal__section">
              <div
                className="plugin-detail-modal__long-description"
                dangerouslySetInnerHTML={{
                  __html: manifest.longDescription.replace(/\n\n/g, '</p><p>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
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
                  <li key={index}>
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
                Cas d'usage
              </h3>
              <ul className="plugin-detail-modal__usecases-list">
                {manifest.useCases.map((useCase, index) => (
                  <li key={index}>{useCase}</li>
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
                  <div key={index} className="plugin-detail-modal__feature-card">
                    <div className="plugin-detail-modal__feature-icon">{feature.icon || '✨'}</div>
                    <div>
                      <h4 className="plugin-detail-modal__feature-label">{feature.label}</h4>
                      <p className="plugin-detail-modal__feature-description">{feature.description}</p>
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
                    <div className="plugin-detail-modal__stat-value">{manifest.rating.toFixed(1)}/5</div>
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

          {/* User Rating */}
          <section className="plugin-detail-modal__section">
            <h3 className="plugin-detail-modal__section-title">
              <Star size={20} />
              Notez ce plugin
            </h3>
            <div className="plugin-detail-modal__rating-container">
              <p className="plugin-detail-modal__rating-description">
                Votre note aide la communauté à découvrir les meilleurs plugins
              </p>
              <div className="plugin-detail-modal__rating-input">
                <StarRatingInput
                  rating={userRating}
                  onRate={handleRatingSubmit}
                  size="large"
                  disabled={isSubmitting}
                />
              </div>
              {submitMessage && (
                <div className={`plugin-detail-modal__rating-message plugin-detail-modal__rating-message--${submitMessage.type}`}>
                  {submitMessage.text}
                </div>
              )}
            </div>
          </section>

          {/* Reviews via Giscus */}
          <PluginReviews pluginId={manifest.id} pluginName={manifest.name} />

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
