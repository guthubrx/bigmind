/**
 * FR: Propriétés du nœud sélectionné
 * EN: Selected node properties
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  Settings
} from 'lucide-react';
import { useMindmap } from '../hooks/useMindmap';
import { COLOR_PALETTES } from '../hooks/useAppSettings';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useSelection } from '../hooks/useSelection';
import './NodeProperties.css';

function NodeProperties() {
  const { selection } = useMindmap();
  const activeFile = useOpenFiles((state) => state.openFiles.find(f => f.isActive) || null);
  const selectedNodeId = useSelection((s) => s.selectedNodeId) || selection.primaryNode;
  const updateActiveFileNode = useOpenFiles((s) => s.updateActiveFileNode);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');
  const setActiveFilePalette = useOpenFiles((s) => s.setActiveFilePalette);
  const activePaletteId = activeFile?.paletteId || (activeFile?.themeColors && activeFile.themeColors.length > 0 ? 'xmind' : 'vibrant');
  
  // FR: Créer une palette XMind basée sur les couleurs du thème XMind
  // EN: Create an XMind palette based on XMind theme colors
  const createXMindPalette = () => {
    const themeColors = activeFile?.themeColors;
    if (!themeColors || themeColors.length === 0) return null;
    
    return {
      id: 'xmind',
      name: 'XMind',
      colors: themeColors,
      description: 'Palette extraite du fichier XMind'
    };
  };
  
  const xmindPalette = createXMindPalette();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!paletteRef.current) return;
      if (paletteOpen && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [paletteOpen]);

  // FR: Si aucune carte n'est ouverte, n'afficher aucune section spécifique
  // EN: If no map is open, don't show map/node sections
  if (!activeFile) {
    return (
      <div className="node-properties">
        <div className="panel-content">
          <div className="no-selection" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: '#475569',
            padding: 12,
            border: '1px dashed #e2e8f0',
            borderRadius: 8,
            background: '#f8fafc'
          }}>
            <Settings className="icon" />
            <p style={{ margin: 0, fontWeight: 600 }}>Aucune carte ouverte</p>
            <span style={{ fontSize: 12 }}>Ouvrez un fichier pour voir les paramètres de la carte</span>
          </div>
        </div>
      </div>
    );
  }

  const selectedNode = selectedNodeId ? activeFile?.content?.nodes?.[selectedNodeId] : null;

  // Afficher toujours la section "Paramètres de la carte" même sans nœud sélectionné

  return (
    <div className="node-properties">
      <div className="panel-content">
        {/* FR: Section Paramètres de la carte */}
        {/* EN: Map settings section */}
        <div className="section" style={{ marginBottom: 40 }}>
          <div className="section-header" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: '1px solid #e2e8f0'
          }}>
            <Settings className="icon-small" style={{ color: '#64748b' }} />
            <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>Paramètres de la carte</span>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Palette de couleurs</div>
              <div ref={paletteRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="input"
                  onClick={() => setPaletteOpen((o) => !o)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    background: '#fff',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={paletteOpen}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{(activePaletteId === 'xmind' ? xmindPalette : COLOR_PALETTES.find(p => p.id === activePaletteId))?.name || 'Sélectionner'}</span>
                    <span style={{ display: 'flex', gap: 4 }}>
                      {(activePaletteId === 'xmind' ? xmindPalette : COLOR_PALETTES.find(p => p.id === activePaletteId))?.colors.slice(0,5).map((c, i) => (
                        <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                      ))}
                    </span>
                  </span>
                  <span style={{ color: '#64748b' }}>▾</span>
                </button>
                {paletteOpen && (
                  <div
                    role="listbox"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 6,
                      maxHeight: 280,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      zIndex: 20,
                      padding: 6
                    }}
                  >
                    {(() => {
                      // FR: Créer la liste des palettes avec la palette XMind en premier si elle existe
                      // EN: Create palette list with XMind palette first if it exists
                      const allPalettes = [...COLOR_PALETTES];
                      if (xmindPalette) {
                        allPalettes.unshift(xmindPalette);
                      }
                      
                      // FR: Trier les palettes (sauf la XMind qui reste en premier)
                      // EN: Sort palettes (except XMind which stays first)
                      const sortedPalettes = [
                        ...(xmindPalette ? [xmindPalette] : []),
                        ...COLOR_PALETTES.slice().sort((a,b)=>a.name.localeCompare(b.name))
                      ];
                      
                      return sortedPalettes.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          role="option"
                          aria-selected={activePaletteId === p.id}
                          onClick={() => { setActiveFilePalette(p.id); setPaletteOpen(false); }}
                          className="btn"
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            padding: 8,
                            borderRadius: 6,
                            border: activePaletteId === p.id ? '2px solid var(--accent-color)' : '1px solid transparent',
                            background: activePaletteId === p.id ? 'rgba(0,0,0,0.02)' : 'transparent'
                          }}
                          title={p.name}
                        >
                          <span style={{ fontSize: 14, color: '#111827' }}>{p.name}</span>
                          <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: '60%' }}>
                            {p.colors.map((c, i) => (
                              <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                            ))}
                          </span>
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FR: Section Nœud sélectionné (affichée uniquement si un nœud est choisi) */}
        {/* EN: Selected node section (only when a node is selected) */}
        {selectedNode ? (
          <div className="section" style={{ marginTop: 16 }}>
            <div className="section-header" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid #e2e8f0'
            }}>
              <Type className="icon-small" style={{ color: '#64748b' }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>Nœud sélectionné</span>
            </div>
            
            {/* FR: Onglets */}
            {/* EN: Tabs */}
          <div className="properties-tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <Type className="icon-small" />
            Contenu
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            <Palette className="icon-small" />
            Style
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            <Settings className="icon-small" />
            Avancé
          </button>
          </div>
        </div>
        ) : null}

        {/* FR: Contenu des onglets */}
        {/* EN: Tab content */}
        <div className="properties-content">
          {selectedNode && activeTab === 'content' && (
            <div className="content-tab">
              <div className="form-group">
                <label htmlFor="np-title">Titre</label>
                <input
                  id="np-title"
                  type="text"
                  value={selectedNode.title}
                  className="input"
                  placeholder="Titre du nœud"
                  onChange={(e) => selectedNodeId && updateActiveFileNode(selectedNodeId, { title: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="np-notes">Notes</label>
                <textarea
                  id="np-notes"
                  value={selectedNode.notes || ''}
                  className="input textarea"
                  placeholder="Notes additionnelles..."
                  rows={4}
                  onChange={(e) => selectedNodeId && updateActiveFileNode(selectedNodeId, { notes: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="np-alignment">Alignement</label>
                <div className="alignment-buttons">
                  <button type="button" className="btn" title="Gauche">
                    <AlignLeft className="icon-small" />
                  </button>
                  <button type="button" className="btn" title="Centre">
                    <AlignCenter className="icon-small" />
                  </button>
                  <button type="button" className="btn" title="Droite">
                    <AlignRight className="icon-small" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedNode && activeTab === 'style' && (
            <div className="style-tab">
              <div className="form-group">
                <label htmlFor="np-bg">Couleur de fond</label>
                <div className="color-input-group">
                  <input
                    id="np-bg"
                    type="color"
                    value={selectedNode.style?.backgroundColor || '#ffffff'}
                    className="color-input"
                    onChange={(e) => selectedNodeId && updateActiveFileNode(selectedNodeId, { style: { ...selectedNode.style, backgroundColor: e.target.value } })}
                  />
                  <input
                    type="text"
                    value={selectedNode.style?.backgroundColor || '#ffffff'}
                    className="input"
                    onChange={(e) => selectedNodeId && updateActiveFileNode(selectedNodeId, { style: { ...selectedNode.style, backgroundColor: e.target.value } })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="np-fg">Couleur du texte</label>
                <div className="color-input-group">
                  <input
                    id="np-fg"
                    type="color"
                    value={selectedNode.style?.textColor || '#000000'}
                    className="color-input"
                    onChange={(e) => selectedNodeId && updateActiveFileNode(selectedNodeId, { style: { ...selectedNode.style, textColor: e.target.value } })}
                  />
                  <input
                    type="text"
                    value={selectedNode.style?.textColor || '#000000'}
                    className="input"
                    onChange={(e) => selectedNodeId && updateActiveFileNode(selectedNodeId, { style: { ...selectedNode.style, textColor: e.target.value } })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="np-fontsize">Taille de police</label>
                <input
                  id="np-fontsize"
                  type="number"
                  value={selectedNode.style?.fontSize || 14}
                  className="input"
                  min="8"
                  max="72"
                  onChange={(e) => selectedNodeId && updateActiveFileNode(selectedNodeId, { style: { ...selectedNode.style, fontSize: Number(e.target.value) } })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="np-fontstyle">Style de police</label>
                <div className="font-style-buttons">
                  <button type="button" className="btn" title="Gras">
                    <Bold className="icon-small" />
                  </button>
                  <button type="button" className="btn" title="Italique">
                    <Italic className="icon-small" />
                  </button>
                  <button type="button" className="btn" title="Souligné">
                    <Underline className="icon-small" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedNode && activeTab === 'advanced' && (
            <div className="advanced-tab">
              <div className="form-group">
                <label htmlFor="np-nodeid">ID du nœud</label>
                <input
                  type="text"
                  value={selectedNode.id}
                  className="input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="np-parent">Nœud parent</label>
                <input
                  type="text"
                  value={selectedNode.parentId || 'Aucun'}
                  className="input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="np-position">Position</label>
                <div className="position-inputs">
                  <input
                    type="number"
                    value={selectedNode.x || 0}
                    className="input"
                    placeholder="X"
                  />
                  <input
                    type="number"
                    value={selectedNode.y || 0}
                    className="input"
                    placeholder="Y"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="np-size">Taille</label>
                <div className="size-inputs">
                  <input
                    type="number"
                    value={selectedNode.width || 200}
                    className="input"
                    placeholder="Largeur"
                  />
                  <input
                    type="number"
                    value={selectedNode.height || 40}
                    className="input"
                    placeholder="Hauteur"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NodeProperties;
