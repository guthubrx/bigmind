/**
 * Plugin Badge Component
 * Displays visual badges for plugin status and type
 */

import React from 'react';
import './PluginBadge.css';

export type BadgeType = 'core' | 'active' | 'inactive' | 'featured' | 'premium' | 'community';

export interface PluginBadgeProps {
  type: BadgeType;
  small?: boolean;
}

const BADGE_LABELS: Record<BadgeType, string> = {
  core: 'CORE',
  active: 'ACTIF',
  inactive: 'INACTIF',
  featured: 'RECOMMANDÉ',
  premium: 'PREMIUM',
  community: 'COMMUNITY',
};

export function PluginBadge({ type, small = false }: PluginBadgeProps) {
  return (
    <span className={`plugin-badge plugin-badge--${type} ${small ? 'plugin-badge--small' : ''}`}>
      {BADGE_LABELS[type]}
    </span>
  );
}

export default PluginBadge;
