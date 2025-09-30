import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from '../components/MenuBar';
import StatusBar from '../components/StatusBar';
import '../layouts/MainLayout.css';
import { useShortcuts, ShortcutAction } from '../hooks/useShortcuts';
import { usePlatform } from '../hooks/usePlatform';
import { X } from 'lucide-react';
import { useAppSettings } from '../hooks/useAppSettings';

function SettingsPage() {
  const navigate = useNavigate();
  const accentColor = useAppSettings((s) => s.accentColor);
  const setAccentColor = useAppSettings((s) => s.setAccentColor);
  const shortcuts = useShortcuts((s) => s.map);
  const setShortcut = useShortcuts((s) => s.setShortcut);
  const resetShortcuts = useShortcuts((s) => s.resetDefaults);
  const [section, setSection] = useState<'appearance' | 'shortcuts'>('appearance');
  const platform = usePlatform();
  const pastelBg = (alpha: number = 0.06) => {
    const hex = (accentColor || '#3b82f6').replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 59;
    const g = parseInt(hex.substring(2, 4), 16) || 130;
    const b = parseInt(hex.substring(4, 6), 16) || 246;
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const toAccelerator = (e: React.KeyboardEvent<HTMLInputElement>): string => {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push(platform.isMac ? 'Cmd' : 'Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    const key = e.key;
    // ignore modifier-only
    if (key && !['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
      let main = key;
      if (key === '+') main = 'Plus';
      if (key.length === 1) main = key.toUpperCase();
      else if (key === ' ') main = 'Space';
      parts.push(main);
    }
    return parts.join('+');
  };

  return (
    <div className="main-layout">
      <div className="frameset-vertical-1">
        <div className="menu-bar-container">
          <MenuBar />
        </div>
        <div style={{ padding: 16, flex: '1 1 auto', overflow: 'hidden' }}>
          <div style={{ display: 'flex', height: '100%', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
            <button
              aria-label="Fermer les paramètres"
              className="btn"
              onClick={() => navigate('/')}
              style={{ position: 'absolute', top: 8, right: 8, padding: 6, lineHeight: 0 }}
            >
              <X className="icon-small" />
            </button>
            {/* Sidebar */}
            <aside style={{ width: 240, background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ padding: 12, borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Paramètres</div>
              <nav>
                <button
                  type="button"
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    border: 'none',
                    borderRadius: 0,
                    background: section === 'appearance' ? 'rgba(0,0,0,0.04)' : 'transparent'
                  }}
                  onClick={() => setSection('appearance')}
                >
                  Apparence
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    width: '100%', justifyContent: 'flex-start', border: 'none', borderRadius: 0,
                    background: section === 'shortcuts' ? 'rgba(0,0,0,0.04)' : 'transparent'
                  }}
                  onClick={() => setSection('shortcuts')}
                >
                  Raccourcis clavier
                </button>
              </nav>
            </aside>

            {/* Content */}
            <section style={{ flex: 1, overflow: 'auto', padding: 24 }}>
              {section === 'appearance' && (
                <div style={{ display: 'grid', gap: 16, maxWidth: 520, border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: pastelBg(0.03) }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600 }}>Apparence</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label htmlFor="accentColor" style={{ width: 220 }}>Couleur d&apos;accent</label>
                    <input
                      id="accentColor"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      style={{ width: 44, height: 28, padding: 0, border: '1px solid #e2e8f0', borderRadius: 6 }}
                    />
                    <span style={{ marginLeft: 8 }}>{accentColor}</span>
                  </div>
                </div>
              )}

              {section === 'shortcuts' && (
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Raccourcis clavier</h2>
                  {(() => {
                    const groups: Record<string, Array<[string,string]>> = {};
                    Object.entries(shortcuts).forEach(([action, acc]) => {
                      const cat = action.split('.')[0] || 'autres';
                      (groups[cat] = groups[cat] || []).push([action, acc]);
                    });
                    const order = ['file','edit','view','insert','tools','autres'];
                    return order
                      .filter((k) => groups[k] && groups[k].length)
                      .map((cat) => (
                        <div key={cat} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, background: pastelBg(0.03) }}>
                          <div style={{ fontWeight: 600, marginBottom: 8, textTransform: 'capitalize' }}>{cat}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 8, alignItems: 'center', maxWidth: 700 }}>
                            {groups[cat].map(([action, acc]) => {
                              const inputId = `shortcut-${action}`;
                              return (
                                <React.Fragment key={action}>
                                  <label htmlFor={inputId} style={{ color: '#475569' }}>
                                    {action.split('.')[1] || action}
                                  </label>
                                  <input
                                    id={inputId}
                                    type="text"
                                    value={acc}
                                    onChange={(e) => setShortcut(action as ShortcutAction, e.target.value)}
                                    onKeyDown={(e) => {
                                      e.preventDefault();
                                      const accel = toAccelerator(e);
                                      if (accel) setShortcut(action as ShortcutAction, accel);
                                    }}
                                    className="input"
                                    style={{ maxWidth: 260 }}
                                    placeholder="Appuyez sur une combinaison…"
                                  />
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      ));
                  })()}
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn" onClick={resetShortcuts}>Réinitialiser par défaut</button>
                  </div>
                </div>
              )}

            </section>
          </div>
        </div>
        <div className="status-bar-container">
          <StatusBar />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;


