/**
 * Plugin Manager Component
 * Main interface for managing plugins - Refactored with modern marketplace UI
 */

import React, { useState, useMemo, useEffect } from 'react';
import type { PluginInfo } from '@bigmind/plugin-system';
import { PluginState } from '@bigmind/plugin-system';
import { PluginCard } from './PluginCard';
import { PluginFilters, type PluginStatus, type PluginCategory } from './PluginFilters';
import { PluginDetailModal } from './PluginDetailModal';
import {
  gitHubPluginRegistry,
  type PluginRegistryEntry,
} from '../../services/GitHubPluginRegistry';
import { installPlugin } from '../../services/PluginInstaller';
import type { PluginManifest } from '@bigmind/plugin-system';
import './PluginManager.css';

export interface PluginManagerProps {
  plugins: Map<string, PluginInfo>;
  onActivate: (pluginId: string) => Promise<void>;
  onDeactivate: (pluginId: string) => Promise<void>;
  onUninstall: (pluginId: string) => Promise<void>;
  onViewPermissions: (pluginId: string) => void;
  onInstall?: (pluginId: string) => Promise<void>;
}

export function PluginManager({
  plugins,
  onActivate,
  onDeactivate,
  onUninstall,
  onViewPermissions,
  onInstall,
}: PluginManagerProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PluginStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<PluginCategory>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [remotePlugins, setRemotePlugins] = useState<PluginRegistryEntry[]>([]);
  const [gridColumns, setGridColumns] = useState(3);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Detect screen size with breakpoints
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setScreenSize('mobile');
      } else if (width <= 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Calculate effective grid columns based on screen size
  const effectiveGridColumns = (() => {
    if (screenSize === 'mobile') return 1;
    if (screenSize === 'tablet') return Math.min(gridColumns, 2);
    return gridColumns;
  })();

  // Load remote plugins from GitHub
  useEffect(() => {
    const loadRemote = async () => {
      try {
        const registry = await gitHubPluginRegistry.fetchRegistry();
        setRemotePlugins(registry);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[PluginManager] Failed to load remote plugins:', error);
      }
    };

    loadRemote();
  }, []);

  const pluginList = Array.from(plugins.values());

  // Create unified plugin list (builtin + remote)
  const unifiedPlugins = useMemo(() => {
    const installed = new Set(pluginList.map(p => p.plugin.manifest.id));
    const unified: Array<{
      type: 'builtin' | 'remote';
      manifest: PluginManifest;
      isActive?: boolean;
      isInstalled: boolean;
      entry?: PluginRegistryEntry;
    }> = [];

    // Add builtin plugins
    pluginList.forEach(info => {
      unified.push({
        type: 'builtin',
        manifest: info.plugin.manifest,
        isActive: info.state === PluginState.ACTIVE,
        isInstalled: true,
      });
    });

    // Add remote plugins that are not yet installed
    remotePlugins.forEach(entry => {
      if (!installed.has(entry.id)) {
        // Convert PluginRegistryEntry to PluginManifest
        const manifest: PluginManifest = {
          id: entry.id,
          name: entry.name,
          version: entry.version,
          description: entry.description,
          author: entry.author,
          main: '',
          icon: entry.icon,
          category: entry.category as any,
          tags: entry.tags,
          source: entry.source as any,
          featured: entry.featured,
          downloads: entry.downloads,
          rating: entry.rating,
          reviewCount: entry.reviewCount,
        };

        unified.push({
          type: 'remote',
          manifest,
          isActive: false,
          isInstalled: false,
          entry,
        });
      }
    });

    return unified;
  }, [pluginList, remotePlugins]);

  // Filter and search plugins
  const filteredPlugins = useMemo(
    () =>
      unifiedPlugins.filter(item => {
        const { manifest } = item;

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
          const isActive = item.isActive ?? false;
          if (statusFilter === 'active' && !isActive) return false;
          if (statusFilter === 'inactive' && (isActive || !item.isInstalled)) return false;
        }

        // Category filter
        if (categoryFilter !== 'all') {
          if (manifest.category !== categoryFilter) return false;
        }

        return true;
      }),
    [unifiedPlugins, searchQuery, statusFilter, categoryFilter]
  );

  // Organize plugins into sections: Installés vs Disponibles
  const { installedPlugins, availablePlugins } = useMemo(() => {
    const installed: typeof filteredPlugins = [];
    const available: typeof filteredPlugins = [];

    filteredPlugins.forEach(item => {
      if (item.isInstalled) {
        installed.push(item);
      } else {
        available.push(item);
      }
    });

    return {
      installedPlugins: installed,
      availablePlugins: available,
    };
  }, [filteredPlugins]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  // Calculate pagination
  const paginateItems = <T,>(items: T[]): { items: T[]; totalPages: number; hasMore: boolean } => {
    if (itemsPerPage >= 999999) {
      return { items, totalPages: 1, hasMore: false };
    }

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalPages,
      hasMore: currentPage < totalPages,
    };
  };

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

  const handleInstall = async (pluginId: string) => {
    setLoading(pluginId);
    try {
      // eslint-disable-next-line no-console
      console.log(`[PluginManager] Installing plugin: ${pluginId}`);

      // If onInstall prop is provided, use it
      if (onInstall) {
        await onInstall(pluginId);
      } else {
        // Otherwise, use default installation logic
        await installPlugin(pluginId);
        // eslint-disable-next-line no-console
        console.log(`[PluginManager] Plugin installed successfully: ${pluginId}`);
      }

      // Refresh the remote plugins list
      const registry = await gitHubPluginRegistry.fetchRegistry();
      setRemotePlugins(registry);

      // eslint-disable-next-line no-console
      console.log(`[PluginManager] Successfully installed: ${pluginId}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[PluginManager] Failed to install plugin ${pluginId}:`, error);
      // eslint-disable-next-line no-alert
      alert(`Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  // Render plugin section
  const renderSection = (title: string, subtitle: string, items: typeof filteredPlugins) => {
    if (items.length === 0) return null;

    const { items: paginatedItems, totalPages } = paginateItems(items);

    return (
      <section className="plugin-manager__section">
        <div className="plugin-manager__section-header">
          <h3 className="plugin-manager__section-title">{title}</h3>
          <p className="plugin-manager__section-subtitle">
            {subtitle} ({items.length} plugin{items.length > 1 ? 's' : ''})
          </p>
        </div>

        <div
          className="plugin-manager__grid"
          style={{
            gridTemplateColumns: `repeat(${effectiveGridColumns}, minmax(0, 1fr))`,
          }}
        >
          {paginatedItems.map(item => {
            const isActive = item.isActive ?? false;
            const isCore = item.manifest.source === 'core';
            const { isInstalled } = item;

            return (
              <PluginCard
                key={item.manifest.id}
                manifest={item.manifest}
                isActive={isActive}
                canDisable={!isCore}
                isInstalled={isInstalled}
                onToggle={() => {
                  if (isCore) return;
                  if (!isInstalled) {
                    handleInstall(item.manifest.id);
                  } else {
                    handleToggle(item.manifest.id, isActive);
                  }
                }}
                onConfigure={() => onViewPermissions(item.manifest.id)}
                onViewDetails={() => handleViewDetails(item.manifest.id)}
                onUninstall={() =>
                  handleAction(() => onUninstall(item.manifest.id), item.manifest.id)
                }
              />
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="plugin-manager__pagination">
            <button
              type="button"
              className="plugin-manager__pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ← Précédent
            </button>
            <span className="plugin-manager__pagination-info">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="plugin-manager__pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant →
            </button>
          </div>
        )}
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
        totalCount={unifiedPlugins.length}
        filteredCount={filteredPlugins.length}
        gridColumns={gridColumns}
        onGridColumnsChange={setGridColumns}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        screenSize={screenSize}
      />

      {/* Plugin Sections */}
      {renderSection('Plugins Installés', 'Plugins installés sur votre système', installedPlugins)}

      {renderSection(
        'Plugins Disponibles',
        'Plugins disponibles pour installation',
        availablePlugins
      )}

      {/* Empty State */}
      {filteredPlugins.length === 0 && (
        <div className="plugin-manager__empty">
          <p>Aucun plugin trouvé avec les critères de recherche actuels</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlugin &&
        (() => {
          const selectedItem = unifiedPlugins.find(item => item.manifest.id === selectedPlugin);
          if (!selectedItem) return null;

          return (
            <PluginDetailModal
              manifest={selectedItem.manifest}
              isActive={selectedItem.isActive ?? false}
              canDisable={selectedItem.manifest.source !== 'core'}
              onClose={handleCloseModal}
              onToggle={() => {
                const isCore = selectedItem.manifest.source === 'core';
                if (!isCore && selectedItem.isInstalled) {
                  handleToggle(selectedPlugin, selectedItem.isActive ?? false);
                  handleCloseModal();
                }
              }}
            />
          );
        })()}

      {/* Loading indicator */}
      {loading && <div className="plugin-manager__loading">Chargement en cours...</div>}
    </div>
  );
}
