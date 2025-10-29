/**
 * Plugin Card Component
 * Displays plugin information in a card format
 */

import React, { useState, useRef, useEffect } from 'react';
import type { PluginManifest } from '@bigmind/plugin-system';
import { PluginBadges } from './PluginBadges';
import { Download, Settings, ChevronDown, Trash2, Power } from 'lucide-react';
import { StarRating } from './StarRating';
import {
  getPluginRatingsAggregate,
  type PluginRatingsAggregate,
} from '../../services/supabaseClient';
import './PluginCard.css';

export interface PluginCardProps {
  manifest: PluginManifest;
  isActive: boolean;
  canDisable?: boolean;
  isInstalled?: boolean;
  onToggle?: () => void;
  onConfigure?: () => void;
  onViewDetails?: () => void;
  onUninstall?: () => void;
}

export function PluginCard({
  manifest,
  isActive,
  canDisable = true,
  isInstalled = true,
  onToggle,
  onConfigure,
  onViewDetails,
  onUninstall,
}: PluginCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ratingAggregate, setRatingAggregate] = useState<PluginRatingsAggregate | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch rating aggregate from Supabase
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const aggregate = await getPluginRatingsAggregate(manifest.id);
        setRatingAggregate(aggregate);
      } catch (error) {
        console.error('[PluginCard] Error fetching rating:', error);
      }
    };
    fetchRating();
  }, [manifest.id]);

  // Determine plugin source
  const source = manifest.source || 'community';

  // Get author name (handle both string and object formats)
  const getAuthorName = () => {
    if (!manifest.author) return 'Unknown';
    if (typeof manifest.author === 'string') return manifest.author;
    if (typeof manifest.author === 'object' && 'name' in manifest.author) {
      return manifest.author.name;
    }
    return 'Unknown';
  };

  const logoUrl = manifest.logo || manifest.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleDeactivate = () => {
    setDropdownOpen(false);
    onToggle?.();
  };

  const handleUninstall = () => {
    setDropdownOpen(false);
    onUninstall?.();
  };

  return (
    <div
      className={`plugin-card ${isActive ? 'plugin-card--active' : ''}`}
      style={{ '--plugin-color': manifest.color || '#6B7280' } as React.CSSProperties}
    >
      {/* Header avec logo et titre */}
      <div className="plugin-card__header">
        <div className="plugin-card__logo-wrapper">
          <div
            className="plugin-card__logo-container plugin-card__logo-container--clickable"
            onClick={onViewDetails}
            role="button"
            tabIndex={0}
            onKeyPress={e => e.key === 'Enter' && onViewDetails?.()}
          >
            {logoUrl && logoUrl.startsWith('/') ? (
              <img src={logoUrl} alt={manifest.name} className="plugin-card__logo" />
            ) : (
              <div className="plugin-card__logo-emoji">{manifest.icon || '🔌'}</div>
            )}
          </div>
          {manifest.featured && <span className="plugin-card__featured-tag">VEDETTE</span>}
        </div>

        <div className="plugin-card__header-content">
          <h3
            className="plugin-card__title plugin-card__title--clickable"
            onClick={onViewDetails}
            role="button"
            tabIndex={0}
            onKeyPress={e => e.key === 'Enter' && onViewDetails?.()}
          >
            {manifest.name}
          </h3>

          <div className="plugin-card__author">by {getAuthorName()}</div>
        </div>

        <div className="plugin-card__badges">
          {canDisable && (
            <div className="plugin-card__state-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className={`plugin-card__state-badge ${
                  isActive
                    ? 'plugin-card__state-badge--active'
                    : 'plugin-card__state-badge--inactive'
                }`}
                onClick={() => {
                  if (isActive && isInstalled) {
                    setDropdownOpen(!dropdownOpen);
                  } else {
                    onToggle?.();
                  }
                }}
                disabled={!canDisable}
              >
                {isActive ? 'ACTIF' : 'ACTIVER'}
                {isActive && isInstalled && <ChevronDown size={12} style={{ marginLeft: '4px' }} />}
              </button>

              {dropdownOpen && isActive && isInstalled && (
                <div className="plugin-card__dropdown-menu">
                  <button
                    type="button"
                    className="plugin-card__dropdown-item plugin-card__dropdown-item--deactivate"
                    onClick={handleDeactivate}
                  >
                    <Power size={14} />
                    <span>Désactiver</span>
                  </button>
                  <button
                    type="button"
                    className="plugin-card__dropdown-item plugin-card__dropdown-item--uninstall"
                    onClick={handleUninstall}
                  >
                    <Trash2 size={14} />
                    <span>Supprimer</span>
                  </button>
                </div>
              )}
            </div>
          )}
          {isActive && manifest.uiContributions?.settings && (
            <button type="button" className="plugin-card__config-btn" onClick={onConfigure} title="Configurer">
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="plugin-card__description">{manifest.description}</p>

      {/* Footer avec métadonnées */}
      <div className="plugin-card__footer">
        <div className="plugin-card__footer-left">
          <span className="plugin-card__version">v{manifest.version}</span>
          <PluginBadges
            source={source as 'core' | 'official' | 'community'}
            state={null}
            featured={false}
          />
        </div>
        <div className="plugin-card__footer-right">
          {manifest.downloads !== undefined && (
            <span className="plugin-card__downloads">
              <Download size={12} />
              {manifest.downloads >= 1000
                ? `${(manifest.downloads / 1000).toFixed(1)}k`
                : manifest.downloads}
            </span>
          )}
          {ratingAggregate && ratingAggregate.totalRatings > 0 && (
            <StarRating
              rating={ratingAggregate.averageRating}
              reviewCount={ratingAggregate.totalRatings}
              size="small"
              showCount
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PluginCard;
