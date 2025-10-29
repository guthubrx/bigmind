/**
 * Plugin Marketplace Component
 * Displays available plugins from manifest.json files
 * Phase 3 - Sprint 4
 */

import React, { useState, useMemo } from 'react';
import { getAllAvailableManifests } from '../../core/plugins';
import { PluginCard } from './PluginCard';
import { PluginFilters, type PluginCategory } from './PluginFilters';
import { PluginDetailModal } from './PluginDetailModal';
import { TopRatedPlugins } from './TopRatedPlugins';
import { RatingFilter } from './RatingFilter';
import './PluginManager.css';

export function PluginMarketplace() {
  // Load all available manifests
  const manifests = getAllAvailableManifests();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PluginCategory>('all');
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  // Filter manifests
  const filteredManifests = useMemo(
    () =>
      manifests.filter(loaded => {
        const { manifest } = loaded;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesName = manifest.name.toLowerCase().includes(query);
          const matchesDesc = manifest.description?.toLowerCase().includes(query);
          const matchesId = manifest.id.toLowerCase().includes(query);
          const matchesTags = manifest.tags?.some(tag => tag.toLowerCase().includes(query));

          if (!matchesName && !matchesDesc && !matchesId && !matchesTags) {
            return false;
          }
        }

        // Category filter
        if (categoryFilter !== 'all') {
          if (manifest.category !== categoryFilter) return false;
        }

        return true;
      }),
    [manifests, searchQuery, categoryFilter]
  );

  // Organize plugins into sections
  const { corePlugins, featuredPlugins, communityPlugins } = useMemo(() => {
    const core = filteredManifests.filter(m => m.manifest.source === 'core');
    const featured = filteredManifests.filter(
      m => m.manifest.featured === true && m.manifest.source !== 'core'
    );
    const community = filteredManifests.filter(
      m => m.manifest.source !== 'core' && !m.manifest.featured
    );

    return {
      corePlugins: core,
      featuredPlugins: featured,
      communityPlugins: community,
    };
  }, [filteredManifests]);

  // Find selected manifest
  const selectedManifest = selectedPluginId
    ? manifests.find(m => m.manifest.id === selectedPluginId)?.manifest
    : null;

  return (
    <div className="plugin-manager">
      <div className="plugin-manager-header">
        <div className="plugin-manager-title">
          <h1>🏪 Plugin Marketplace</h1>
          <p className="plugin-manager-subtitle">
            Découvrez et installez des plugins pour étendre les capacités de BigMind
          </p>
        </div>

        <div className="plugin-manager-stats">
          <div className="stat-card">
            <div className="stat-value">{manifests.length}</div>
            <div className="stat-label">Plugins disponibles</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{corePlugins.length}</div>
            <div className="stat-label">Plugins Core</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{featuredPlugins.length}</div>
            <div className="stat-label">En vedette</div>
          </div>
        </div>
      </div>

      {/* Top Rated Plugins Widget */}
      <TopRatedPlugins
        allPlugins={manifests.map(m => m.manifest)}
        onSelectPlugin={pluginId => setSelectedPluginId(pluginId)}
      />

      <PluginFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter="all" // Marketplace shows all plugins
        onStatusChange={() => {}} // No status filter in marketplace
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        totalCount={manifests.length}
        filteredCount={filteredManifests.length}
        showStatusFilter={false} // Hide status filter in marketplace
      />

      {/* Rating Filter */}
      <div style={{ marginBottom: '16px' }}>
        <RatingFilter selectedRating={minRating} onRatingChange={setMinRating} />
      </div>

      <div className="plugin-sections">
        {/* Core Plugins */}
        {corePlugins.length > 0 && (
          <div className="plugin-section">
            <div className="plugin-section-header">
              <h2 className="plugin-section-title">
                <span className="plugin-section-icon">⚙️</span>
                Plugins Core
              </h2>
              <span className="plugin-section-count">{corePlugins.length}</span>
            </div>
            <div className="plugin-grid">
              {corePlugins.map(loaded => (
                <PluginCard
                  key={loaded.manifest.id}
                  manifest={loaded.manifest}
                  state="inactive" // Show as available for install
                  onActivate={async () => {
                    // TODO: Implement installation
                    alert(`Installation de ${loaded.manifest.name} à implémenter`);
                  }}
                  onDeactivate={async () => {}}
                  onViewDetails={() => setSelectedPluginId(loaded.manifest.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured Plugins */}
        {featuredPlugins.length > 0 && (
          <div className="plugin-section">
            <div className="plugin-section-header">
              <h2 className="plugin-section-title">
                <span className="plugin-section-icon">⭐</span>
                En vedette
              </h2>
              <span className="plugin-section-count">{featuredPlugins.length}</span>
            </div>
            <div className="plugin-grid">
              {featuredPlugins.map(loaded => (
                <PluginCard
                  key={loaded.manifest.id}
                  manifest={loaded.manifest}
                  state="inactive"
                  onActivate={async () => {
                    alert(`Installation de ${loaded.manifest.name} à implémenter`);
                  }}
                  onDeactivate={async () => {}}
                  onViewDetails={() => setSelectedPluginId(loaded.manifest.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Community Plugins */}
        {communityPlugins.length > 0 && (
          <div className="plugin-section">
            <div className="plugin-section-header">
              <h2 className="plugin-section-title">
                <span className="plugin-section-icon">🌐</span>
                Communauté
              </h2>
              <span className="plugin-section-count">{communityPlugins.length}</span>
            </div>
            <div className="plugin-grid">
              {communityPlugins.map(loaded => (
                <PluginCard
                  key={loaded.manifest.id}
                  manifest={loaded.manifest}
                  state="inactive"
                  onActivate={async () => {
                    alert(`Installation de ${loaded.manifest.name} à implémenter`);
                  }}
                  onDeactivate={async () => {}}
                  onViewDetails={() => setSelectedPluginId(loaded.manifest.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {filteredManifests.length === 0 && (
          <div className="plugin-empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Aucun plugin trouvé</div>
            <div className="empty-state-message">
              Essayez d'ajuster vos filtres ou votre recherche
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedManifest && (
        <PluginDetailModal
          manifest={selectedManifest}
          state="inactive"
          onClose={() => setSelectedPluginId(null)}
          onActivate={async () => {
            alert(`Installation de ${selectedManifest.name} à implémenter`);
          }}
          onDeactivate={async () => {}}
        />
      )}
    </div>
  );
}
