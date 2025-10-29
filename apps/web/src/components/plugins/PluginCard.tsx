/**
 * Plugin Card Component
 * Displays plugin information in a card format
 */

import React from 'react';
import type { PluginManifest } from '@bigmind/plugin-system';
import { PluginBadge, type BadgeType } from './PluginBadge';
import { Download, Star, Settings, Info } from 'lucide-react';
import './PluginCard.css';

export interface PluginCardProps {
  manifest: PluginManifest;
  isActive: boolean;
  canDisable?: boolean;
  onToggle?: () => void;
  onConfigure?: () => void;
  onViewDetails?: () => void;
}

export function PluginCard({
  manifest,
  isActive,
  canDisable = true,
  onToggle,
  onConfigure,
  onViewDetails,
}: PluginCardProps) {
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
    <div
      className={`plugin-card ${isActive ? 'plugin-card--active' : ''}`}
      style={{ '--plugin-color': manifest.color || '#6B7280' } as React.CSSProperties}
    >
      {/* Header avec logo et badges */}
      <div className="plugin-card__header">
        <div className="plugin-card__logo-container">
          {logoUrl && logoUrl.startsWith('/') ? (
            <img src={logoUrl} alt={manifest.name} className="plugin-card__logo" />
          ) : (
            <div className="plugin-card__logo-emoji">{manifest.icon || '🔌'}</div>
          )}
        </div>

        <div className="plugin-card__badges">
          {getBadges().map(badge => (
            <PluginBadge key={badge} type={badge} small />
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="plugin-card__content">
        <h3 className="plugin-card__title">{manifest.name}</h3>

        {manifest.tagline && (
          <p className="plugin-card__tagline">{manifest.tagline}</p>
        )}

        <p className="plugin-card__description">{manifest.description}</p>

        {/* Métadonnées */}
        <div className="plugin-card__meta">
          <span className="plugin-card__version">v{manifest.version}</span>
          {manifest.downloads !== undefined && (
            <span className="plugin-card__downloads">
              <Download size={14} />
              {manifest.downloads >= 1000
                ? `${(manifest.downloads / 1000).toFixed(1)}k`
                : manifest.downloads}
            </span>
          )}
          {manifest.rating !== undefined && (
            <span className="plugin-card__rating">
              <Star size={14} fill="currentColor" />
              {manifest.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="plugin-card__actions">
        <button
          className="plugin-card__action-btn plugin-card__action-btn--secondary"
          onClick={onViewDetails}
          title="Voir les détails"
        >
          <Info size={16} />
          Détails
        </button>

        {isActive && manifest.uiContributions?.settings && (
          <button
            className="plugin-card__action-btn plugin-card__action-btn--secondary"
            onClick={onConfigure}
            title="Configurer"
          >
            <Settings size={16} />
          </button>
        )}

        {canDisable && (
          <button
            className={`plugin-card__action-btn plugin-card__action-btn--primary ${
              isActive ? 'plugin-card__action-btn--danger' : 'plugin-card__action-btn--success'
            }`}
            onClick={onToggle}
          >
            {isActive ? 'Désactiver' : 'Activer'}
          </button>
        )}
      </div>
    </div>
  );
}

export default PluginCard;
