/**
 * Developer Mode Toggle
 * Active/désactive le mode développeur pour les plugins
 */

import React, { useState, useEffect } from 'react';
import { Code, AlertTriangle, ExternalLink } from 'lucide-react';

const DEVELOPER_MODE_KEY = 'bigmind-developer-mode';

/**
 * Détecte si l'application tourne en mode développement (avec code source)
 * ou en mode production (app distribuée/compilée)
 */
export function isRunningInDevEnvironment(): boolean {
  // En dev : Vite dev server sur localhost
  // En prod : App compilée depuis file:// ou domaine de prod
  return (
    import.meta.env.DEV === true ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '5173' // Port Vite par défaut
  );
}

export interface DeveloperModeToggleProps {
  onChange?: (enabled: boolean) => void;
}

export function DeveloperModeToggle({ onChange }: DeveloperModeToggleProps) {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(DEVELOPER_MODE_KEY);
    return stored === 'true';
  });

  const isDevEnv = isRunningInDevEnvironment();

  useEffect(() => {
    localStorage.setItem(DEVELOPER_MODE_KEY, enabled.toString());
    onChange?.(enabled);
  }, [enabled, onChange]);

  const handleToggle = () => {
    setEnabled(!enabled);
  };

  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Code size={20} color={enabled ? 'var(--accent-color)' : 'var(--fg-secondary)'} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              Mode Développeur
            </div>
            <div style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>
              {enabled
                ? 'Clone et publiez des plugins community'
                : 'Activez pour accéder aux outils de développement'}
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <label
          htmlFor="developer-mode-toggle"
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '48px',
            height: '24px',
            cursor: 'pointer',
          }}
          aria-label="Activer/désactiver le mode développeur"
        >
          <input
            id="developer-mode-toggle"
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            style={{
              opacity: 0,
              width: 0,
              height: 0,
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: enabled ? 'var(--accent-color)' : '#D1D5DB',
              borderRadius: '24px',
              transition: 'all 0.3s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                content: '""',
                height: '18px',
                width: '18px',
                left: enabled ? '26px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'all 0.3s',
              }}
            />
          </span>
        </label>
      </div>

      {enabled && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: isDevEnv
              ? 'var(--accent-color-10)'
              : '#FEF3C7', // Jaune warning si prod
            border: `1px solid ${isDevEnv ? 'var(--accent-color)' : '#FCD34D'}`,
            borderRadius: '4px',
            fontSize: '12px',
            color: isDevEnv ? 'var(--fg-primary)' : '#92400E',
          }}
        >
          {isDevEnv ? (
            <>
              <strong>✅ Mode développeur activé</strong>
              <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
                <li>Clone des plugins community vers votre environnement local</li>
                <li>Publication de vos modifications vers GitHub</li>
                <li>Outils de build et test intégrés</li>
              </ul>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>⚠️ Application distribuée détectée</strong>
                  <p style={{ margin: '8px 0' }}>
                    Le mode développeur nécessite le code source. Pour développer des plugins :
                  </p>
                  <ol style={{ margin: '8px 0 8px 16px', paddingLeft: 0 }}>
                    <li style={{ marginBottom: '6px' }}>
                      <strong>Clonez le monorepo BigMind :</strong>
                      <br />
                      <code
                        style={{
                          display: 'block',
                          marginTop: '4px',
                          padding: '6px 8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                        }}
                      >
                        git clone https://github.com/guthubrx/bigmind.git
                      </code>
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <strong>Installez les dépendances :</strong>
                      <br />
                      <code
                        style={{
                          display: 'block',
                          marginTop: '4px',
                          padding: '6px 8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                      >
                        cd bigmind && pnpm install
                      </code>
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <strong>Lancez en mode développement :</strong>
                      <br />
                      <code
                        style={{
                          display: 'block',
                          marginTop: '4px',
                          padding: '6px 8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                        }}
                      >
                        pnpm run dev:web
                      </code>
                    </li>
                    <li>
                      <strong>Activez le mode développeur</strong> dans l&apos;app qui tourne sur{' '}
                      <code>localhost:5173</code>
                    </li>
                  </ol>
                  <a
                    href="https://github.com/guthubrx/bigmind#plugin-development"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '8px',
                      color: 'var(--accent-color)',
                      textDecoration: 'underline',
                      fontSize: '11px',
                    }}
                  >
                    📖 Guide complet de développement de plugins
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Hook pour récupérer l'état du mode développeur
 */
export function useDeveloperMode(): boolean {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(DEVELOPER_MODE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(DEVELOPER_MODE_KEY);
      setEnabled(stored === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen to custom event for same-window updates
    window.addEventListener('developer-mode-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('developer-mode-changed', handleStorageChange);
    };
  }, []);

  return enabled;
}
