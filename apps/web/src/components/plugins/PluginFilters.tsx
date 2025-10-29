/**
 * Plugin Filters Component
 * Provides filtering and search for plugins
 */

import React from 'react';
import { Search, Filter, Grid3x3, List } from 'lucide-react';
import './PluginFilters.css';

export type PluginStatus = 'all' | 'active' | 'inactive';
export type PluginCategory = 'all' | 'productivity' | 'integration' | 'theme' | 'developer' | 'export' | 'template';

export interface PluginFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  status: PluginStatus;
  onStatusChange: (status: PluginStatus) => void;
  category: PluginCategory;
  onCategoryChange: (category: PluginCategory) => void;
  totalCount: number;
  filteredCount: number;
  gridColumns: number;
  onGridColumnsChange: (columns: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  screenSize?: 'mobile' | 'tablet' | 'desktop';
}

const STATUS_OPTIONS: { value: PluginStatus; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actifs' },
  { value: 'inactive', label: 'Inactifs' },
];

const CATEGORY_OPTIONS: { value: PluginCategory; label: string }[] = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'productivity', label: 'Productivité' },
  { value: 'theme', label: 'Thème & Couleurs' },
  { value: 'integration', label: 'Intégration' },
  { value: 'export', label: 'Export' },
  { value: 'developer', label: 'Développeur' },
  { value: 'template', label: 'Templates' },
];

export function PluginFilters({
  searchQuery,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  totalCount,
  filteredCount,
  gridColumns,
  onGridColumnsChange,
  itemsPerPage,
  onItemsPerPageChange,
  screenSize = 'desktop',
}: PluginFiltersProps) {
  const getColumnHint = () => {
    if (screenSize === 'mobile') return ' (1 col sur mobile)';
    if (screenSize === 'tablet') return ' (max 2 cols sur tablette)';
    return '';
  };
  return (
    <div className="plugin-filters">
      {/* Search */}
      <div className="plugin-filters__search">
        <Search size={18} className="plugin-filters__search-icon" />
        <input
          type="text"
          className="plugin-filters__search-input"
          placeholder="Rechercher un plugin..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="plugin-filters__search-clear"
            onClick={() => onSearchChange('')}
          >
            ×
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="plugin-filters__controls">
        <div className="plugin-filters__filter-group">
          <Filter size={16} />
          <select
            className="plugin-filters__select"
            value={status}
            onChange={e => onStatusChange(e.target.value as PluginStatus)}
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="plugin-filters__filter-group">
          <select
            className="plugin-filters__select"
            value={category}
            onChange={e => onCategoryChange(e.target.value as PluginCategory)}
          >
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {screenSize !== 'mobile' && (
          <div className="plugin-filters__filter-group">
            <Grid3x3 size={16} />
            <select
              className="plugin-filters__select"
              value={gridColumns}
              onChange={e => onGridColumnsChange(Number(e.target.value))}
              title={`Colonnes par ligne${getColumnHint()}`}
            >
              <option value="2">2 colonnes{getColumnHint()}</option>
              <option value="3">3 colonnes{getColumnHint()}</option>
              <option value="4">4 colonnes{getColumnHint()}</option>
              <option value="5">5 colonnes{getColumnHint()}</option>
            </select>
          </div>
        )}

        <div className="plugin-filters__filter-group">
          <List size={16} />
          <select
            className="plugin-filters__select"
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
            title="Éléments par page"
          >
            <option value="12">12 par page</option>
            <option value="24">24 par page</option>
            <option value="48">48 par page</option>
            <option value="999999">Tous</option>
          </select>
        </div>

        <div className="plugin-filters__count">
          {filteredCount === totalCount ? (
            <span>{totalCount} plugin{totalCount > 1 ? 's' : ''}</span>
          ) : (
            <span>
              {filteredCount} / {totalCount} plugin{totalCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PluginFilters;
