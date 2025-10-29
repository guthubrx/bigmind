/**
 * PluginCard - Display a single plugin with details
 */

import React from 'react';
import type { PluginListing } from '../types';
import { InstallButton } from './InstallButton';

export interface PluginCardProps {
  plugin: PluginListing;
  installed?: boolean;
  onInstall?: (pluginId: string) => void;
  onUninstall?: (pluginId: string) => void;
  onViewDetails?: (pluginId: string) => void;
}

export function PluginCard({
  plugin,
  installed = false,
  onInstall,
  onUninstall,
  onViewDetails
}: PluginCardProps) {
  const formatDownloads = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return String(count);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Free</span>;
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Paid</span>;
      case 'freemium':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Freemium</span>;
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Icon */}
        {plugin.icon ? (
          <img
            src={plugin.icon}
            alt={plugin.name}
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded bg-gray-200 flex
              items-center justify-center flex-shrink-0`}
          >
            <span className="text-2xl">🧩</span>
          </div>
        )}

        {/* Title and metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {plugin.name}
            </h3>
            {plugin.verified && (
              <span className="text-blue-500" title="Verified plugin">
                ✓
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {typeof plugin.author === 'string' ? plugin.author : plugin.author.name}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {getPricingBadge(plugin.pricing)}
            {plugin.category && (
              <span
                className={`px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded
                  capitalize`}
              >
                {plugin.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        {plugin.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        {plugin.rating && (
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{plugin.rating.toFixed(1)}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span>⬇️</span>
          <span>{formatDownloads(plugin.downloads)}</span>
        </div>
        <div>
          <span>{formatSize(plugin.size)}</span>
        </div>
        <div>
          <span>v{plugin.version}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <InstallButton
          pluginId={plugin.id}
          installed={installed}
          onInstall={onInstall}
          onUninstall={onUninstall}
        />

        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(plugin.id)}
            className={`px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border
              border-gray-300 rounded hover:bg-gray-50 transition-colors`}
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
}
