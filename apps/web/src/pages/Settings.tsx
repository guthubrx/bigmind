import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from '../components/MenuBar';
import StatusBar from '../components/StatusBar';
import '../layouts/MainLayout.css';
import './Settings.css';
import { useShortcuts, ShortcutAction } from '../hooks/useShortcuts';
import { usePlatform } from '../hooks/usePlatform';
import { X } from 'lucide-react';
import { useAppSettings } from '../hooks/useAppSettings';
import { getAllInterfaceThemes } from '../themes/colorThemes';
import { getAllPalettes } from '../themes/colorPalettes';
import PaletteSelector from '../components/PaletteSelector';

function SettingsPage() {
  const navigate = useNavigate();
  const accentColor = useAppSettings(s => s.accentColor);
  const setAccentColor = useAppSettings(s => s.setAccentColor);
  const themeId = useAppSettings(s => s.themeId);
  const setTheme = useAppSettings(s => s.setTheme);
  const defaultNodePaletteId = useAppSettings(s => s.defaultNodePaletteId);
  const setDefaultNodePalette = useAppSettings(s => s.setDefaultNodePalette);
  const defaultTagPaletteId = useAppSettings(s => s.defaultTagPaletteId);
  const setDefaultTagPalette = useAppSettings(s => s.setDefaultTagPalette);
  const showMinimap = useAppSettings(s => s.showMinimap);
  const setShowMinimap = useAppSettings(s => s.setShowMinimap);
  const reopenFilesOnStartup = useAppSettings(s => s.reopenFilesOnStartup);
  const setReopenFilesOnStartup = useAppSettings(s => s.setReopenFilesOnStartup);
  const defaultNodeFontSize = useAppSettings(s => s.defaultNodeFontSize);
  const setDefaultNodeFontSize = useAppSettings(s => s.setDefaultNodeFontSize);
  const defaultNodeWidth = useAppSettings(s => s.defaultNodeWidth);
  const setDefaultNodeWidth = useAppSettings(s => s.setDefaultNodeWidth);
  const defaultNodeFontFamily = useAppSettings(s => s.defaultNodeFontFamily);
  const setDefaultNodeFontFamily = useAppSettings(s => s.setDefaultNodeFontFamily);
  const allInterfaceThemes = getAllInterfaceThemes();
  const allPalettes = getAllPalettes();
  const shortcuts = useShortcuts(s => s.map);
  const setShortcut = useShortcuts(s => s.setShortcut);
  const resetShortcuts = useShortcuts(s => s.resetDefaults);
  const [section, setSection] = useState<'appearance' | 'shortcuts'>('appearance');
  const platform = usePlatform();

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

                  {/* FR: Sélecteur de thème d'interface */}
                  {/* EN: Interface theme selector */}
                  <div className="settings-field">
                    <span className="settings-label">Thème d&apos;interface</span>
                    <select
                      id="theme"
                      value={themeId}
                      onChange={e => setTheme(e.target.value)}
                      className="settings-select"
                      aria-label="Sélectionner un thème d'interface"
                    >
                      {allInterfaceThemes.map(theme => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
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

                  {/* FR: Affichage de la minimap */}
                  {/* EN: Minimap display */}
                  <div className="settings-field">
                    <span className="settings-label">Afficher la minimap</span>
                    <input
                      id="showMinimap"
                      type="checkbox"
                      checked={showMinimap}
                      onChange={e => setShowMinimap(e.target.checked)}
                      aria-label="Afficher la minimap"
                      className="settings-checkbox"
                    />
                  </div>

                  {/* FR: Réouverture des fichiers au démarrage */}
                  {/* EN: Reopen files on startup */}
                  <div className="settings-field">
                    <span className="settings-label">Réouvrir les cartes au démarrage</span>
                    <input
                      id="reopenFilesOnStartup"
                      type="checkbox"
                      checked={reopenFilesOnStartup}
                      onChange={e => setReopenFilesOnStartup(e.target.checked)}
                      aria-label="Réouvrir les cartes au démarrage"
                      className="settings-checkbox"
                    />
                  </div>

                  {/* FR: Séparateur */}
                  {/* EN: Separator */}
                  <hr className="settings-separator" />

                  {/* FR: Palette par défaut pour les nœuds */}
                  {/* EN: Default palette for nodes */}
                  <div className="settings-field">
                    <span className="settings-label">Palette par défaut des nœuds</span>
                    <div style={{ flex: 1 }}>
                      <PaletteSelector
                        palettes={allPalettes}
                        value={defaultNodePaletteId}
                        onChange={setDefaultNodePalette}
                        aria-label="Sélectionner une palette pour les nœuds"
                      />
                    </div>
                  </div>

                  {/* FR: Palette par défaut pour les tags */}
                  {/* EN: Default palette for tags */}
                  <div className="settings-field">
                    <span className="settings-label">Palette par défaut des tags</span>
                    <div style={{ flex: 1 }}>
                      <PaletteSelector
                        palettes={allPalettes}
                        value={defaultTagPaletteId}
                        onChange={setDefaultTagPalette}
                        aria-label="Sélectionner une palette pour les tags"
                      />
                    </div>
                  </div>

                  {/* FR: Séparateur */}
                  {/* EN: Separator */}
                  <hr className="settings-separator" />

                  <h3 className="settings-subsection-title">Style par défaut des nœuds</h3>

                  {/* FR: Taille de police par défaut */}
                  {/* EN: Default font size */}
                  <div className="settings-field">
                    <span className="settings-label">Taille de police par défaut</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        id="defaultNodeFontSize"
                        type="number"
                        min="8"
                        max="72"
                        value={defaultNodeFontSize}
                        onChange={e => setDefaultNodeFontSize(Number(e.target.value))}
                        aria-label="Taille de police par défaut des nœuds"
                        style={{ width: '100px' }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>px</span>
                    </div>
                  </div>

                  {/* FR: Largeur par défaut */}
                  {/* EN: Default width */}
                  <div className="settings-field">
                    <span className="settings-label">Largeur par défaut des nœuds</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        id="defaultNodeWidth"
                        type="number"
                        min="100"
                        max="800"
                        step="10"
                        value={defaultNodeWidth}
                        onChange={e => setDefaultNodeWidth(Number(e.target.value))}
                        aria-label="Largeur par défaut des nœuds"
                        style={{ width: '100px' }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>px</span>
                    </div>
                  </div>

                  {/* FR: Police par défaut */}
                  {/* EN: Default font family */}
                  <div className="settings-field">
                    <span className="settings-label">Police par défaut des nœuds</span>
                    <select
                      id="defaultNodeFontFamily"
                      value={defaultNodeFontFamily}
                      onChange={e => setDefaultNodeFontFamily(e.target.value)}
                      className="settings-select"
                      aria-label="Police par défaut des nœuds"
                    >
                      <option value="inherit">Par défaut (Système)</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                      <option value="'Times New Roman', Times, serif">Times New Roman</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Courier New', Courier, monospace">Courier New</option>
                      <option value="'Monaco', 'Menlo', monospace">Monaco</option>
                    </select>
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
