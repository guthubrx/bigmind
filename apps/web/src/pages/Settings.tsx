import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from '../components/MenuBar';
import StatusBar from '../components/StatusBar';
import '../layouts/MainLayout.css';
import './Settings.css';
import { useShortcuts, ShortcutAction } from '../hooks/useShortcuts';
import { usePlatform } from '../hooks/usePlatform';
import { X, Palette } from 'lucide-react';
import { useAppSettings } from '../hooks/useAppSettings';
import { getAllThemes } from '../themes/colorThemes';
import { useOpenFiles } from '../hooks/useOpenFiles';

function SettingsPage() {
  const navigate = useNavigate();
  const accentColor = useAppSettings(s => s.accentColor);
  const setAccentColor = useAppSettings(s => s.setAccentColor);
  const themeId = useAppSettings(s => s.themeId);
  const setTheme = useAppSettings(s => s.setTheme);
  const getCurrentTheme = useAppSettings(s => s.getCurrentTheme);
  const allThemes = getAllThemes();
  const shortcuts = useShortcuts(s => s.map);
  const setShortcut = useShortcuts(s => s.setShortcut);
  const resetShortcuts = useShortcuts(s => s.resetDefaults);
  const [section, setSection] = useState<'appearance' | 'shortcuts'>('appearance');
  const platform = usePlatform();
  const applyAutomaticColorsToAll = useOpenFiles(s => s.applyAutomaticColorsToAll);

  const toAccelerator = (e: React.KeyboardEvent<HTMLInputElement>): string => {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push(platform.isMac ? 'Cmd' : 'Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    const { key } = e;
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
          <div className="settings-container">
            <button
              type="button"
              aria-label="Fermer les paramètres"
              className="btn settings-close-btn"
              onClick={() => navigate('/')}
            >
              <X className="icon-small" />
            </button>
            {/* Sidebar */}
            <aside className="settings-sidebar">
              <div className="settings-sidebar-title">Paramètres</div>
              <nav>
                <button
                  type="button"
                  className={`btn settings-nav-btn ${section === 'appearance' ? 'active' : ''}`}
                  onClick={() => setSection('appearance')}
                >
                  Apparence
                </button>
                <button
                  type="button"
                  className={`btn settings-nav-btn ${section === 'shortcuts' ? 'active' : ''}`}
                  onClick={() => setSection('shortcuts')}
                >
                  Raccourcis clavier
                </button>
              </nav>
            </aside>

            {/* Content */}
            <section className="settings-content">
              {section === 'appearance' && (
                <div className="settings-section">
                  <h2 className="settings-section-title">Apparence</h2>

                  {/* FR: Sélecteur de thème */}
                  {/* EN: Theme selector */}
                  <div className="settings-field">
                    <span className="settings-label">Thème</span>
                    <select
                      id="theme"
                      value={themeId}
                      onChange={e => setTheme(e.target.value)}
                      className="settings-select"
                      aria-label="Sélectionner un thème"
                    >
                      {allThemes.map(theme => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* FR: Palette de 10 couleurs */}
                  {/* EN: 10-color palette */}
                  <div>
                    <div className="settings-palette-label">
                      Palette de couleurs (10 couleurs pour les nœuds)
                    </div>
                    <div className="settings-palette-container">
                      {(() => {
                        const currentTheme = allThemes.find(t => t.id === themeId);
                        if (!currentTheme || !currentTheme.palette) return null;
                        return currentTheme.palette.map(color => (
                          <div
                            key={color}
                            className="settings-palette-swatch"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ));
                      })()}
                    </div>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        const theme = getCurrentTheme();
                        applyAutomaticColorsToAll(theme);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Palette size={16} />
                      Appliquer les couleurs de la palette aux nœuds
                    </button>
                  </div>

                  {/* FR: Couleur d'accent personnalisée */}
                  {/* EN: Custom accent color */}
                  <div className="settings-field">
                    <span className="settings-label">Couleur d&apos;accent personnalisée</span>
                    <input
                      id="accentColor"
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      aria-label="Choisir une couleur d'accent"
                      className="settings-color-input"
                    />
                    <span className="settings-color-value">{accentColor}</span>
                  </div>
                </div>
              )}

              {section === 'shortcuts' && (
                <div>
                  <h2 className="settings-shortcuts-title">Raccourcis clavier</h2>
                  {(() => {
                    const groups: Record<string, Array<[string, string]>> = {};
                    Object.entries(shortcuts).forEach(([action, acc]) => {
                      const cat = action.split('.')[0] || 'autres';
                      (groups[cat] = groups[cat] || []).push([action, acc]);
                    });
                    const order = ['file', 'edit', 'view', 'insert', 'tools', 'autres'];
                    return order
                      .filter(k => groups[k] && groups[k].length)
                      .map(cat => (
                        <div key={cat} className="settings-shortcuts-group">
                          <div className="settings-shortcuts-group-title">{cat}</div>
                          <div className="settings-shortcuts-grid">
                            {groups[cat].map(([action, acc]) => {
                              const inputId = `shortcut-${action}`;
                              return (
                                <React.Fragment key={action}>
                                  <label htmlFor={inputId} className="settings-shortcuts-label">
                                    {action.split('.')[1] || action}
                                  </label>
                                  <input
                                    id={inputId}
                                    type="text"
                                    value={acc}
                                    onChange={e =>
                                      setShortcut(action as ShortcutAction, e.target.value)
                                    }
                                    onKeyDown={e => {
                                      e.preventDefault();
                                      const accel = toAccelerator(e);
                                      if (accel) setShortcut(action as ShortcutAction, accel);
                                    }}
                                    className="input settings-shortcuts-input"
                                    placeholder="Appuyez sur une combinaison…"
                                  />
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      ));
                  })()}
                  <div className="settings-shortcuts-reset">
                    <button type="button" className="btn" onClick={resetShortcuts}>
                      Réinitialiser par défaut
                    </button>
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
