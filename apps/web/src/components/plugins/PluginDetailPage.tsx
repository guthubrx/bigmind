/**
 * Plugin Detail Page - WordPress-like plugin information page
 */

import React, { useState } from 'react';
import type { PluginInfo } from '@bigmind/plugin-system';

interface PluginDetailPageProps {
  plugin: PluginInfo;
  onBack: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export const PluginDetailPage: React.FC<PluginDetailPageProps> = ({
  plugin,
  onBack,
  onActivate,
  onDeactivate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'changelog'>('overview');
  const { manifest } = plugin.plugin;

  const tabs = [
    { id: 'overview' as const, label: '📖 Overview', icon: '📖' },
    { id: 'technical' as const, label: '🔧 Technical', icon: '🔧' },
    { id: 'changelog' as const, label: '📝 Changelog', icon: '📝' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with back button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          ← Retour
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          {/* Plugin icon */}
          {manifest.icon && (
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
              }}
            >
              <img
                src={manifest.icon}
                alt={manifest.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Plugin info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
              {manifest.name}
            </h1>
            <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '16px' }}>
              {manifest.description}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '14px' }}>
              <span>
                <strong>Version:</strong> {manifest.version}
              </span>
              <span>
                <strong>Auteur:</strong>{' '}
                {typeof manifest.author === 'string' ? manifest.author : manifest.author.name}
              </span>
              {manifest.category && (
                <span
                  style={{
                    padding: '2px 8px',
                    background: '#f3f4f6',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {manifest.category}
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          <div>
            {plugin.state === 'active' ? (
              <button
                onClick={onDeactivate}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Désactiver
              </button>
            ) : (
              <button
                onClick={onActivate}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'var(--accent-color)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Activer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px',
          display: 'flex',
          gap: '8px',
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderBottom:
                activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--accent-color)' : '#6b7280',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <OverviewTab plugin={plugin} />}
        {activeTab === 'technical' && <TechnicalTab plugin={plugin} />}
        {activeTab === 'changelog' && <ChangelogTab plugin={plugin} />}
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab: React.FC<{ plugin: PluginInfo }> = ({ plugin }) => {
  const { manifest } = plugin.plugin;
  return (
    <div>
      {/* Features */}
      {manifest.features && manifest.features.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            ✨ Fonctionnalités
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {manifest.features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#f9fafb',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {feature.icon && <span style={{ fontSize: '24px' }}>{feature.icon}</span>}
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>
                      {feature.label}
                    </h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Screenshots */}
      {manifest.screenshots && manifest.screenshots.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            📸 Screenshots
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {manifest.screenshots.map((screenshot, idx) => (
              <img
                key={idx}
                src={screenshot}
                alt={`Screenshot ${idx + 1}`}
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Links */}
      <section>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>🔗 Liens</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {manifest.homepage && (
            <a
              href={manifest.homepage}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                textDecoration: 'none',
                color: 'var(--accent-color)',
              }}
            >
              🏠 Site web
            </a>
          )}
          {manifest.documentation && (
            <a
              href={manifest.documentation}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                textDecoration: 'none',
                color: 'var(--accent-color)',
              }}
            >
              📚 Documentation
            </a>
          )}
          {manifest.repository && (
            <a
              href={manifest.repository}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                textDecoration: 'none',
                color: 'var(--accent-color)',
              }}
            >
              📦 Repository
            </a>
          )}
        </div>
      </section>
    </div>
  );
};

// Technical Tab
const TechnicalTab: React.FC<{ plugin: PluginInfo }> = ({ plugin }) => {
  const { manifest } = plugin.plugin;
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Events listened */}
      {manifest.hooks?.listens && manifest.hooks.listens.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            🎧 Événements écoutés
          </h2>
          <div
            style={{
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {manifest.hooks.listens.map(hook => (
                <code
                  key={hook}
                  style={{
                    padding: '4px 8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  {hook}
                </code>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events emitted */}
      {manifest.hooks?.emits && manifest.hooks.emits.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            📡 Événements émis
          </h2>
          <div
            style={{
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {manifest.hooks.emits.map(hook => (
                <code
                  key={hook}
                  style={{
                    padding: '4px 8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  {hook}
                </code>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* UI Contributions */}
      {manifest.uiContributions && (
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            🎨 Contributions UI
          </h2>
          <div
            style={{
              padding: '16px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <dl style={{ margin: 0, display: 'grid', gap: '12px' }}>
              {manifest.uiContributions.menus && manifest.uiContributions.menus.length > 0 && (
                <>
                  <dt style={{ fontWeight: 600 }}>Menus ajoutés :</dt>
                  <dd style={{ margin: 0, paddingLeft: '16px', color: '#6b7280' }}>
                    {manifest.uiContributions.menus.join(', ')}
                  </dd>
                </>
              )}
              {manifest.uiContributions.commands &&
                manifest.uiContributions.commands.length > 0 && (
                  <>
                    <dt style={{ fontWeight: 600 }}>Commandes ajoutées :</dt>
                    <dd style={{ margin: 0, paddingLeft: '16px', color: '#6b7280' }}>
                      {manifest.uiContributions.commands.join(', ')}
                    </dd>
                  </>
                )}
              {manifest.uiContributions.panels && manifest.uiContributions.panels.length > 0 && (
                <>
                  <dt style={{ fontWeight: 600 }}>Panneaux ajoutés :</dt>
                  <dd style={{ margin: 0, paddingLeft: '16px', color: '#6b7280' }}>
                    {manifest.uiContributions.panels.join(', ')}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </section>
      )}

      {/* Permissions */}
      {manifest.permissions && manifest.permissions.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
            🔒 Permissions requises
          </h2>
          <div
            style={{
              padding: '16px',
              background: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fbbf24',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {manifest.permissions.map(perm => (
                <code
                  key={perm}
                  style={{
                    padding: '4px 8px',
                    background: '#fbbf24',
                    color: '#92400e',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                >
                  {perm}
                </code>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Metadata */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          📋 Métadonnées
        </h2>
        <div
          style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <dl style={{ margin: 0, display: 'grid', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <dt style={{ fontWeight: 600, minWidth: '120px' }}>ID:</dt>
              <dd style={{ margin: 0, color: '#6b7280', fontFamily: 'monospace' }}>
                {manifest.id}
              </dd>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <dt style={{ fontWeight: 600, minWidth: '120px' }}>Version:</dt>
              <dd style={{ margin: 0, color: '#6b7280' }}>{manifest.version}</dd>
            </div>
            {manifest.license && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <dt style={{ fontWeight: 600, minWidth: '120px' }}>Licence:</dt>
                <dd style={{ margin: 0, color: '#6b7280' }}>{manifest.license}</dd>
              </div>
            )}
            {manifest.bigmindVersion && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <dt style={{ fontWeight: 600, minWidth: '120px' }}>Compatibilité:</dt>
                <dd style={{ margin: 0, color: '#6b7280' }}>BigMind {manifest.bigmindVersion}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </div>
  );
};

// Changelog Tab
const ChangelogTab: React.FC<{ plugin: PluginInfo }> = ({ plugin }) => {
  const { manifest } = plugin.plugin;
  if (!manifest.changelog || manifest.changelog.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
        Aucun changelog disponible
      </div>
    );
  }

  const changeTypeColors: Record<string, { bg: string; text: string }> = {
    added: { bg: '#dcfce7', text: '#166534' },
    fixed: { bg: '#fef3c7', text: '#92400e' },
    changed: { bg: '#dbeafe', text: '#1e40af' },
    removed: { bg: '#fee2e2', text: '#991b1b' },
    security: { bg: '#fce7f3', text: '#831843' },
  };

  const changeTypeLabels: Record<string, string> = {
    added: 'Ajouté',
    fixed: 'Corrigé',
    changed: 'Modifié',
    removed: 'Supprimé',
    security: 'Sécurité',
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {manifest.changelog.map(entry => (
        <div
          key={entry.version}
          style={{
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#f9fafb',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              Version {entry.version}
            </h3>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>{entry.date}</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '8px' }}>
            {entry.changes.map((change, idx) => {
              const colors = changeTypeColors[change.type] || { bg: '#f3f4f6', text: '#374151' };
              return (
                <li key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      background: colors.bg,
                      color: colors.text,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      minWidth: '70px',
                      textAlign: 'center',
                    }}
                  >
                    {changeTypeLabels[change.type]}
                  </span>
                  <span style={{ color: '#374151', fontSize: '14px' }}>{change.description}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};
