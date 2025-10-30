/**
 * Developer Mode Toggle
 * Active/désactive le mode développeur pour les plugins
 */

import React, { useState, useEffect } from 'react';
import { Code } from 'lucide-react';

const DEVELOPER_MODE_KEY = 'bigmind-developer-mode';

export interface DeveloperModeToggleProps {
  onChange?: (enabled: boolean) => void;
}

export function DeveloperModeToggle({ onChange }: DeveloperModeToggleProps) {
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(DEVELOPER_MODE_KEY);
    return stored === 'true';
  });

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
            backgroundColor: 'var(--accent-color-10)',
            border: '1px solid var(--accent-color)',
            borderRadius: '4px',
            fontSize: '12px',
            color: 'var(--fg-primary)',
          }}
        >
          <strong>Mode développeur activé</strong>
          <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
            <li>Clone des plugins community vers votre environnement local</li>
            <li>Publication de vos modifications vers GitHub</li>
            <li>Outils de build et test intégrés</li>
          </ul>
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
