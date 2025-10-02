import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from '../components/MenuBar';
import StatusBar from '../components/StatusBar';
import FileTabs from '../components/FileTabs';
import { ColumnSizeSettings } from '../components/ColumnSizeSettings';
import { useShortcuts, ShortcutAction } from '../hooks/useShortcuts';
import { usePlatform } from '../hooks/usePlatform';
import { useAppSettings, COLOR_PALETTES, ColorPalette } from '../hooks/useAppSettings';
import { useColumnResize } from '../hooks/useColumnResize';
import '../layouts/MainLayout.css';

function SettingsPage() {
  const navigate = useNavigate();
  const accentColor = useAppSettings((s) => s.accentColor);
  const setAccentColor = useAppSettings((s) => s.setAccentColor);
  const selectedPalette = useAppSettings((s) => s.selectedPalette);
  const setSelectedPalette = useAppSettings((s) => s.setSelectedPalette);
  const dragTolerance = useAppSettings((s) => s.dragTolerance);
  const setDragTolerance = useAppSettings((s) => s.setDragTolerance);
  const shortcuts = useShortcuts((s) => s.map);
  const setShortcut = useShortcuts((s) => s.setShortcut);
  const resetShortcuts = useShortcuts((s) => s.resetDefaults);
  const [section, setSection] = useState<'appearance' | 'interface' | 'interaction' | 'shortcuts'>('appearance');

  // Hook pour le redimensionnement des colonnes
  const {
    columnSizes,
    updateColumnSize,
    resetColumnSizes,
    COLUMN_SIZE_LIMITS
  } = useColumnResize();

  // Paramètres d'épaisseur des bordures
  const columnBorderThickness = useAppSettings((s) => s.columnBorderThickness);
  const setColumnBorderThickness = useAppSettings((s) => s.setColumnBorderThickness);
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
          <MenuBar isSettingsPage={true} onBack={() => navigate('/')} />
        </div>

        {/* FR: Barre d'onglets normale pour l'écran des paramètres */}
        {/* EN: Normal tab bar for settings screen */}
        <div className="tab-bar-container">
          <FileTabs type="tab-bar" />
        </div>

        <div style={{ padding: 16, flex: '1 1 auto', overflow: 'hidden' }}>
          <div style={{ display: 'flex', height: '100%', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
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
                    width: '100%',
                    justifyContent: 'flex-start',
                    border: 'none',
                    borderRadius: 0,
                    background: section === 'interface' ? 'rgba(0,0,0,0.04)' : 'transparent'
                  }}
                  onClick={() => setSection('interface')}
                >
                  Interface
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    border: 'none',
                    borderRadius: 0,
                    background: section === 'interaction' ? 'rgba(0,0,0,0.04)' : 'transparent'
                  }}
                  onClick={() => setSection('interaction')}
                >
                  Interaction
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
                <div style={{ display: 'grid', gap: 16, maxWidth: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: pastelBg(0.03) }}>
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
                  
                  {/* FR: Sélecteur de palette de couleurs */}
                  {/* EN: Color palette selector */}
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ fontWeight: 500, color: '#374151' }}>Palette de couleurs pour les cartes mentales</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      {COLOR_PALETTES.slice().sort((a, b) => a.name.localeCompare(b.name)).map((palette: ColorPalette) => (
                        <div
                          key={palette.id}
                          className="palette-card"
                          onClick={() => setSelectedPalette(palette.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedPalette(palette.id);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          style={{
                            border: selectedPalette === palette.id ? `2px solid ${accentColor}` : '1px solid #e2e8f0',
                            borderRadius: 12,
                            padding: 16,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: selectedPalette === palette.id ? pastelBg(0.08) : '#ffffff',
                            boxShadow: selectedPalette === palette.id ? `0 4px 12px ${accentColor}20` : '0 2px 4px rgba(0,0,0,0.05)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#1f2937' }}>
                              {palette.name}
                            </h3>
                            {selectedPalette === palette.id && (
                              <div style={{ 
                                width: 20, 
                                height: 20, 
                                borderRadius: '50%', 
                                background: accentColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 12,
                                fontWeight: 'bold'
                              }}>
                                ✓
                              </div>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                            {palette.description}
                          </p>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {palette.colors.map((color, index) => (
                              <div
                                key={`${palette.id}-color-${index}`}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 6,
                                  backgroundColor: color,
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {section === 'interface' && (
                <ColumnSizeSettings
                  columnSizes={columnSizes}
                  onSizeChange={updateColumnSize}
                  onReset={resetColumnSizes}
                  sizeLimits={COLUMN_SIZE_LIMITS}
                  accentColor={accentColor}
                  borderThickness={columnBorderThickness}
                  onBorderThicknessChange={setColumnBorderThickness}
                />
              )}

              {section === 'interaction' && (
                <div style={{ display: 'grid', gap: 16, maxWidth: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: pastelBg(0.03) }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600 }}>Interaction</h2>
                  
                  {/* FR: Paramètre de tolérance de drag and drop */}
                  {/* EN: Drag and drop tolerance parameter */}
                  <div style={{ display: 'grid', gap: 12 }}>
                    <label htmlFor="dragTolerance" style={{ fontWeight: 500, color: '#374151' }}>
                      Tolérance de glisser-déposer
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input
                        id="dragTolerance"
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={dragTolerance}
                        onChange={(e) => setDragTolerance(parseInt(e.target.value, 10))}
                        style={{ flex: 1, maxWidth: 300 }}
                      />
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        minWidth: 80,
                        justifyContent: 'flex-end'
                      }}>
                        <span style={{ 
                          fontSize: 14, 
                          fontWeight: 600, 
                          color: accentColor,
                          minWidth: 30,
                          textAlign: 'center'
                        }}>
                          {dragTolerance}px
                        </span>
                      </div>
                    </div>
                    <p style={{ 
                      fontSize: 13, 
                      color: '#6b7280', 
                      margin: 0, 
                      lineHeight: 1.4 
                    }}>
                      Zone de tolérance autour des nœuds pour faciliter le glisser-déposer. 
                      Une valeur plus élevée rend le dépôt plus facile mais moins précis.
                    </p>
                    
                    {/* FR: Indicateur visuel de la tolérance */}
                    {/* EN: Visual tolerance indicator */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      padding: 12, 
                      background: '#f8fafc', 
                      borderRadius: 8, 
                      border: '1px solid #e2e8f0' 
                    }}>
                      <div style={{ fontSize: 13, color: '#6b7280', minWidth: 100 }}>
                        Aperçu :
                      </div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: 120,
                          height: 30,
                          background: '#ffffff',
                          border: '2px solid #e2e8f0',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          color: '#6b7280',
                          position: 'relative'
                        }}>
                          Nœud cible
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: -dragTolerance,
                          left: -dragTolerance,
                          right: -dragTolerance,
                          bottom: -dragTolerance,
                          border: `2px dashed ${accentColor}`,
                          borderRadius: 6,
                          opacity: 0.6,
                          pointerEvents: 'none'
                        }} />
                      </div>
                    </div>
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


