/**
 * Plugin Manager Component
 * Main interface for managing plugins - Refactored with modern marketplace UI
 */

import React, { useState, useMemo } from 'react';
import type { PluginInfo } from '@bigmind/plugin-system';
import { PluginState } from '@bigmind/plugin-system';
import { PluginCard } from './PluginCard';
import { PluginFilters, type PluginStatus, type PluginCategory } from './PluginFilters';
import { PluginDetailModal } from './PluginDetailModal';
import './PluginManager.css';

export interface PluginManagerProps {
  plugins: Map<string, PluginInfo>;
  onActivate: (pluginId: string) => Promise<void>;
  onDeactivate: (pluginId: string) => Promise<void>;
  onUninstall: (pluginId: string) => Promise<void>;
  onViewPermissions: (pluginId: string) => void;
  onViewDetails?: (pluginId: string) => void;
}

export function PluginManager({
  plugins,
  onActivate,
  onDeactivate,
  onViewPermissions,
}: PluginManagerProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PluginStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<PluginCategory>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const pluginList = Array.from(plugins.values());

  // Filter and search plugins
  const filteredPlugins = useMemo(() => {
    return pluginList.filter(info => {
      const manifest = info.plugin.manifest;

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

      // Status filter
      if (statusFilter !== 'all') {
        const isActive = info.state === PluginState.ACTIVE;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'inactive' && isActive) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (manifest.category !== categoryFilter) return false;
      }

      return true;
    });
  }, [pluginList, searchQuery, statusFilter, categoryFilter]);

  // Organize plugins into sections
  const { corePlugins, featuredPlugins, activePlugins, availablePlugins } = useMemo(() => {
    const core: PluginInfo[] = [];
    const featured: PluginInfo[] = [];
    const active: PluginInfo[] = [];
    const available: PluginInfo[] = [];

    filteredPlugins.forEach(info => {
      const isActive = info.state === PluginState.ACTIVE;
      const isCore = info.plugin.manifest.source === 'core';
      const isFeatured = info.plugin.manifest.featured === true;

      if (isCore) {
        core.push(info);
      } else if (isFeatured && !isActive) {
        featured.push(info);
      } else if (isActive) {
        active.push(info);
      } else {
        available.push(info);
      }
    });

    return {
      corePlugins: core,
      featuredPlugins: featured,
      activePlugins: active,
      availablePlugins: available,
    };
  }, [filteredPlugins]);

  // Handlers
  const handleAction = async (action: () => Promise<void>, pluginId: string) => {
    setLoading(pluginId);
    try {
      await action();
    } catch (error) {
      console.error('Plugin action failed:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleToggle = (pluginId: string, isActive: boolean) => {
    if (isActive) {
      handleAction(() => onDeactivate(pluginId), pluginId);
    } else {
      handleAction(() => onActivate(pluginId), pluginId);
    }
  };

  const handleViewDetails = (pluginId: string) => {
    setSelectedPlugin(pluginId);
  };

  const handleCloseModal = () => {
    setSelectedPlugin(null);
  };

  // Render plugin section
  const renderSection = (title: string, subtitle: string, plugins: PluginInfo[]) => {
    if (plugins.length === 0) return null;

    return (
      <section className="plugin-manager__section">
        <div className="plugin-manager__section-header">
          <h3 className="plugin-manager__section-title">{title}</h3>
          <p className="plugin-manager__section-subtitle">{subtitle}</p>
        </div>

        <div className="plugin-manager__grid">
          {plugins.map(info => {
            const isActive = info.state === PluginState.ACTIVE;
            const isCore = info.plugin.manifest.source === 'core';

            return (
              <PluginCard
                key={info.plugin.manifest.id}
                manifest={info.plugin.manifest}
                isActive={isActive}
                canDisable={!isCore}
                onToggle={() =>
                  isCore ? undefined : handleToggle(info.plugin.manifest.id, isActive)
                }
                onConfigure={() => onViewPermissions(info.plugin.manifest.id)}
                onViewDetails={() => handleViewDetails(info.plugin.manifest.id)}
              />
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="plugin-manager">
      {/* Header */}
      <div className="plugin-manager__header">
        <h2 className="plugin-manager__title">Marketplace de Plugins</h2>
        <p className="plugin-manager__description">
          Découvrez et gérez les plugins pour étendre les fonctionnalités de BigMind
        </p>
      </div>

      {/* Filters */}
      <PluginFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        totalCount={pluginList.length}
        filteredCount={filteredPlugins.length}
      />

      {/* Plugin Sections */}
      {renderSection(
        'Plugins Système',
        'Plugins essentiels qui font partie du cœur de BigMind',
        corePlugins
      )}

      {renderSection(
        'Recommandés pour vous',
        'Plugins populaires et utiles que nous vous suggérons d\'essayer',
        featuredPlugins
      )}

      {renderSection(
        'Plugins Actifs',
        'Plugins actuellement actifs dans votre installation',
        activePlugins
      )}

      {renderSection(
        'Plugins Disponibles',
        'Autres plugins que vous pouvez activer',
        availablePlugins
      )}

      {/* Empty State */}
      {filteredPlugins.length === 0 && (
        <div className="plugin-manager__empty">
          <p>Aucun plugin trouvé avec les critères de recherche actuels</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlugin && (
        <PluginDetailModal
          manifest={plugins.get(selectedPlugin)!.plugin.manifest}
          isActive={plugins.get(selectedPlugin)!.state === PluginState.ACTIVE}
          canDisable={plugins.get(selectedPlugin)!.plugin.manifest.source !== 'core'}
          onClose={handleCloseModal}
          onToggle={() => {
            const info = plugins.get(selectedPlugin)!;
            const isActive = info.state === PluginState.ACTIVE;
            const isCore = info.plugin.manifest.source === 'core';
            if (!isCore) {
              handleToggle(selectedPlugin, isActive);
              handleCloseModal();
            }
          }}
        />
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="plugin-manager__loading">
          Chargement en cours...
        </div>
      )}
    </div>
  );
}
