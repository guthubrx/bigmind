/**
 * Plugin Manager Component
 * Main interface for managing plugins
 */

import React, { useState } from 'react';
import type { PluginInfo } from '@bigmind/plugin-system';
import { PluginState } from '@bigmind/plugin-system';

export interface PluginManagerProps {
  plugins: Map<string, PluginInfo>;
  onActivate: (pluginId: string) => Promise<void>;
  onDeactivate: (pluginId: string) => Promise<void>;
  onUninstall: (pluginId: string) => Promise<void>;
  onViewPermissions: (pluginId: string) => void;
  onViewDetails?: (pluginId: string) => void;
}

const getStateColor = (state: PluginState): string => {
  switch (state) {
    case PluginState.ACTIVE:
      return '#22c55e';
    case PluginState.INACTIVE:
      return '#6b7280';
    case PluginState.ERROR:
      return '#ef4444';
    default:
      return '#f59e0b';
  }
};

const getStateLabel = (state: PluginState): string => {
  switch (state) {
    case PluginState.ACTIVE:
      return 'Actif';
    case PluginState.INACTIVE:
      return 'Inactif';
    case PluginState.ERROR:
      return 'Erreur';
    case PluginState.REGISTERED:
      return 'Enregistré';
    default:
      return state;
  }
};

export function PluginManager({
  plugins,
  onActivate,
  onDeactivate,
  onUninstall,
  onViewPermissions,
  onViewDetails,
}: PluginManagerProps) {
  const [filter, setFilter] = useState<'all' | PluginState>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const pluginList = Array.from(plugins.values());
  const filteredPlugins =
    filter === 'all' ? pluginList : pluginList.filter(p => p.state === filter);

  const handleAction = async (action: () => Promise<void>, pluginId: string) => {
    setLoading(pluginId);
    try {
      await action();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
          Gestionnaire de Plugins
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Gérez vos plugins installés et leurs permissions
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { value: 'all' as const, label: 'Tous' },
          { value: PluginState.ACTIVE, label: 'Actifs' },
          { value: PluginState.INACTIVE, label: 'Inactifs' },
          { value: PluginState.ERROR, label: 'Erreurs' },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            style={{
              padding: '8px 16px',
              border: filter === value ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: filter === value ? '#eff6ff' : 'white',
              color: filter === value ? '#3b82f6' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: filter === value ? '500' : '400',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
            {pluginList.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Plugins</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
          <div
            style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px', color: '#22c55e' }}
          >
            {pluginList.filter(p => p.state === PluginState.ACTIVE).length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Actifs</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
          <div
            style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px', color: '#ef4444' }}
          >
            {pluginList.filter(p => p.state === PluginState.ERROR).length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Erreurs</div>
        </div>
      </div>

      {/* Plugin List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredPlugins.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Aucun plugin trouvé
          </div>
        ) : (
          filteredPlugins.map(info => (
            <div
              key={info.plugin.manifest.id}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}
              >
                {/* Plugin Info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                      {info.plugin.manifest.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: getStateColor(info.state),
                        color: 'white',
                        fontWeight: '500',
                      }}
                    >
                      {getStateLabel(info.state)}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                      }}
                    >
                      v{info.plugin.manifest.version}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
                    {info.plugin.manifest.description}
                  </p>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    <span>ID: {info.plugin.manifest.id}</span>
                    {info.activatedAt && (
                      <span style={{ marginLeft: '16px' }}>
                        Activé le {new Date(info.activatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {info.error && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '13px',
                      }}
                    >
                      <strong>Erreur:</strong> {info.error.message}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                  {onViewDetails && (
                    <button
                      type="button"
                      onClick={() => onViewDetails(info.plugin.manifest.id)}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid var(--accent-color)',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: 'var(--accent-color)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                      }}
                    >
                      ℹ️ Détails
                    </button>
                  )}
                  {info.state === PluginState.ACTIVE ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          () => onDeactivate(info.plugin.manifest.id),
                          info.plugin.manifest.id
                        )
                      }
                      disabled={loading === info.plugin.manifest.id}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        cursor: loading === info.plugin.manifest.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        opacity: loading === info.plugin.manifest.id ? 0.5 : 1,
                      }}
                    >
                      {loading === info.plugin.manifest.id ? 'En cours...' : 'Désactiver'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(
                          () => onActivate(info.plugin.manifest.id),
                          info.plugin.manifest.id
                        )
                      }
                      disabled={loading === info.plugin.manifest.id}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        cursor: loading === info.plugin.manifest.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: loading === info.plugin.manifest.id ? 0.5 : 1,
                      }}
                    >
                      {loading === info.plugin.manifest.id ? 'En cours...' : 'Activer'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onViewPermissions(info.plugin.manifest.id)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Permissions
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleAction(
                        () => onUninstall(info.plugin.manifest.id),
                        info.plugin.manifest.id
                      )
                    }
                    disabled={
                      loading === info.plugin.manifest.id || info.state === PluginState.ACTIVE
                    }
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #fca5a5',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      color: '#dc2626',
                      cursor:
                        loading === info.plugin.manifest.id || info.state === PluginState.ACTIVE
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: '14px',
                      opacity:
                        loading === info.plugin.manifest.id || info.state === PluginState.ACTIVE
                          ? 0.5
                          : 1,
                    }}
                  >
                    Désinstaller
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
