/**
 * Plugin Filters Component
 * Provides filtering and search for plugins
 */

import React from 'react';
import { Search, Filter } from 'lucide-react';
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
}: PluginFiltersProps) {
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
