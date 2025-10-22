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
  Settings,
  Paintbrush,
  Link,
  Grid3X3,
  Circle,
  Square,
  Minus,
  ChevronDown,
  ChevronRight,
  Tag,
  X,
  Image,
  Sticker
} from 'lucide-react';
import { useMindmap } from '../hooks/useMindmap';
import { COLOR_PALETTES, useAppSettings } from '../hooks/useAppSettings';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useSelection } from '../hooks/useSelection';
import { AddTagCommand, RemoveTagCommand, TagUtils } from '@bigmind/core';
import { ImageManager } from './ImageManager';
import { StickerPicker } from './StickerPicker';
import './NodeProperties.css';

function NodeProperties() {
  const { selection } = useMindmap();
  const activeFile = useOpenFiles((state) => state.openFiles.find(f => f.isActive) || null);
  const selectedNodeId = useSelection((s) => s.selectedNodeId) || selection.primaryNode;
  const updateActiveFileNode = useOpenFiles((s) => s.updateActiveFileNode);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');
  const setActiveFilePalette = useOpenFiles((s) => s.setActiveFilePalette);
  const updateActiveFileMapStyle = useOpenFiles((s) => s.updateActiveFileMapStyle);
  const activePaletteId = activeFile?.paletteId || (activeFile?.themeColors && activeFile.themeColors.length > 0 ? 'xmind' : 'vibrant');
  
  // FR: États pour gérer le collapse des sous-sections (depuis le store global)
  // EN: States to manage subsection collapse (from global store)
  const colorsCollapsed = useAppSettings((s) => s.colorsSectionCollapsed);
  const setColorsCollapsed = useAppSettings((s) => s.setColorsSectionCollapsed);
  const linksCollapsed = useAppSettings((s) => s.linksSectionCollapsed);
  const setLinksCollapsed = useAppSettings((s) => s.setLinksSectionCollapsed);

  // FR: États pour gérer le collapse des sections principales
  // EN: States to manage main sections collapse
  const [mapSettingsCollapsed, setMapSettingsCollapsed] = useState(false);
  const [selectedNodeCollapsed, setSelectedNodeCollapsed] = useState(false);

  // FR: État pour gérer le collapse de la section Assets
  // EN: State to manage Assets section collapse
  const [assetsCollapsed, setAssetsCollapsed] = useState(false);

  // FR: État pour gérer l'onglet actif des Assets
  // EN: State to manage active Assets tab
  const [activeAssetsTab, setActiveAssetsTab] = useState<'images' | 'stickers'>('images');

  // FR: État pour gérer le collapse de la section Style
  // EN: State to manage Style section collapse
  const [styleCollapsed, setStyleCollapsed] = useState(false);

  // FR: État pour la saisie du nouveau tag
  // EN: State for new tag input
  const [newTag, setNewTag] = useState('');
  
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
        <div className="panel-content" style={{ paddingRight: '8px' }}>
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
      <div className="panel-content" style={{ paddingRight: '8px' }}>
        {/* FR: Section Paramètres de la carte */}
        {/* EN: Map settings section */}
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: mapSettingsCollapsed ? 8 : 12,
          background: '#fafbfc',
          marginBottom: 16
        }}>
          <button
            type="button"
            onClick={() => setMapSettingsCollapsed(!mapSettingsCollapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: mapSettingsCollapsed ? 0 : 16,
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              padding: 0
            }}
          >
            {mapSettingsCollapsed ? (
              <ChevronRight className="icon-small" style={{ color: '#64748b' }} />
            ) : (
              <ChevronDown className="icon-small" style={{ color: '#64748b' }} />
            )}
            <Settings className="icon-small" style={{ color: '#64748b' }} />
            Paramètres de la carte
          </button>

          {!mapSettingsCollapsed && (
            <div style={{ display: 'grid', gap: 12 }}>
            {/* FR: Sous-section Couleurs */}
            {/* EN: Colors subsection */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: colorsCollapsed ? 8 : 12,
              background: '#fafbfc'
            }}>
              <button
                type="button"
                onClick={() => setColorsCollapsed(!colorsCollapsed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: colorsCollapsed ? 0 : 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  padding: 0
                }}
              >
                {colorsCollapsed ? (
                  <ChevronRight className="icon-small" style={{ color: '#64748b' }} />
                ) : (
                  <ChevronDown className="icon-small" style={{ color: '#64748b' }} />
                )}
                <Palette className="icon-small" style={{ color: '#64748b' }} />
                Couleurs
              </button>
              
              {!colorsCollapsed && (
                <div style={{ display: 'grid', gap: 12 }}>
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

                {/* FR: Couleur de fond de la carte */}
                {/* EN: Map background color */}
                <div>
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Paintbrush className="icon-small" />
                    Couleur de fond
                  </div>
                  <input
                    type="color"
                    value={activeFile?.mapStyle?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateActiveFileMapStyle({ backgroundColor: e.target.value })}
                    style={{
                      width: '100%',
                      height: 36,
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* FR: Motif de fond */}
                {/* EN: Background pattern */}
                <div>
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Grid3X3 className="icon-small" />
                    Motif de fond
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                    {[
                      { id: 'none', label: 'Aucun', icon: Minus },
                      { id: 'dots', label: 'Points', icon: Circle },
                      { id: 'grid', label: 'Grille', icon: Grid3X3 },
                      { id: 'lines', label: 'Lignes', icon: Minus }
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateActiveFileMapStyle({ backgroundPattern: id as any })}
                        style={{
                          padding: '8px 12px',
                          border: `1px solid ${activeFile?.mapStyle?.backgroundPattern === id ? 'var(--accent-color)' : '#e2e8f0'}`,
                          borderRadius: 6,
                          background: activeFile?.mapStyle?.backgroundPattern === id ? 'rgba(0,0,0,0.02)' : '#fff',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                          color: '#374151'
                        }}
                      >
                        <Icon className="icon-small" />
                        {label}
                      </button>
                    ))}
                  </div>
                  
                  {/* FR: Transparence du motif */}
                  {/* EN: Pattern transparency */}
                  {activeFile?.mapStyle?.backgroundPattern && activeFile?.mapStyle?.backgroundPattern !== 'none' && (
                    <div>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Transparence</div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={activeFile?.mapStyle?.backgroundPatternOpacity || 0.3}
                        onChange={(e) => updateActiveFileMapStyle({ backgroundPatternOpacity: parseFloat(e.target.value) })}
                        style={{
                          width: '100%',
                          height: 4,
                          background: '#e2e8f0',
                          borderRadius: 2,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ fontSize: 10, color: '#64748b', textAlign: 'center', marginTop: 2 }}>
                        {Math.round((activeFile?.mapStyle?.backgroundPatternOpacity || 0.3) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>

            {/* FR: Sous-section Liens */}
            {/* EN: Links subsection */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: linksCollapsed ? 8 : 12,
              background: '#fafbfc'
            }}>
              <button
                type="button"
                onClick={() => setLinksCollapsed(!linksCollapsed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: linksCollapsed ? 0 : 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  padding: 0
                }}
              >
                {linksCollapsed ? (
                  <ChevronRight className="icon-small" style={{ color: '#64748b' }} />
                ) : (
                  <ChevronDown className="icon-small" style={{ color: '#64748b' }} />
                )}
                <Link className="icon-small" style={{ color: '#64748b' }} />
                Liens
              </button>
              
              {!linksCollapsed && (
                <div>
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Style des liens</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    { id: 'straight', label: 'Droits', icon: Minus },
                    { id: 'curved', label: 'Courbés', icon: Circle },
                    { id: 'rounded', label: 'Arrondis', icon: Square },
                    { id: 'orthogonal', label: 'Orthogonaux', icon: Grid3X3 }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => updateActiveFileMapStyle({ linkStyle: id as any })}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${activeFile?.mapStyle?.linkStyle === id ? 'var(--accent-color)' : '#e2e8f0'}`,
                        borderRadius: 6,
                        background: activeFile?.mapStyle?.linkStyle === id ? 'rgba(0,0,0,0.02)' : '#fff',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        color: '#374151'
                      }}
                    >
                      <Icon className="icon-small" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              )}
            </div>

            {/* FR: Sous-section Assets avec onglets */}
            {/* EN: Assets subsection with tabs */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: assetsCollapsed ? 8 : 12,
              background: '#fafbfc'
            }}>
              <button
                type="button"
                onClick={() => setAssetsCollapsed(!assetsCollapsed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: assetsCollapsed ? 0 : 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  padding: 0
                }}
              >
                {assetsCollapsed ? (
                  <ChevronRight className="icon-small" style={{ color: '#64748b' }} />
                ) : (
                  <ChevronDown className="icon-small" style={{ color: '#64748b' }} />
                )}
                <Image className="icon-small" style={{ color: '#64748b' }} />
                🎨 Assets
              </button>

              {!assetsCollapsed && activeFile && (
                <div>
                  {/* FR: Onglets Assets */}
                  {/* EN: Assets tabs */}
                  <div className="properties-tabs" style={{ marginBottom: 12 }}>
                    <button
                      type="button"
                      className={`tab ${activeAssetsTab === 'images' ? 'active' : ''}`}
                      onClick={() => setActiveAssetsTab('images')}
                    >
                      <Image className="icon-small" />
                      Images
                    </button>
                    <button
                      type="button"
                      className={`tab ${activeAssetsTab === 'stickers' ? 'active' : ''}`}
                      onClick={() => setActiveAssetsTab('stickers')}
                    >
                      <Sticker className="icon-small" />
                      Stickers
                    </button>
                  </div>

                  {/* FR: Contenu des onglets Assets */}
                  {/* EN: Assets tab content */}
                  <div className="properties-content">
                    {activeAssetsTab === 'images' && (
                      <div className="content-tab">
                        <ImageManager mapId={activeFile.id} />
                      </div>
                    )}

                    {activeAssetsTab === 'stickers' && (
                      <div className="content-tab">
                        <StickerPicker mapId={activeFile.id} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FR: Sous-section Style */}
            {/* EN: Style subsection */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: styleCollapsed ? 8 : 12,
              background: '#fafbfc'
            }}>
              <button
                type="button"
                onClick={() => setStyleCollapsed(!styleCollapsed)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: styleCollapsed ? 0 : 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#374151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  padding: 0
                }}
              >
                {styleCollapsed ? (
                  <ChevronRight className="icon-small" style={{ color: '#64748b' }} />
                ) : (
                  <ChevronDown className="icon-small" style={{ color: '#64748b' }} />
                )}
                <Palette className="icon-small" style={{ color: '#64748b' }} />
                Styles
              </button>

              {!styleCollapsed && (
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Styles à implémenter
                </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* FR: Section Nœud sélectionné (affichée uniquement si un nœud est choisi) */}
        {/* EN: Selected node section (only when a node is selected) */}
        {selectedNode ? (
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: selectedNodeCollapsed ? 8 : 12,
            background: '#fafbfc',
            marginTop: 16
          }}>
            <button
              type="button"
              onClick={() => setSelectedNodeCollapsed(!selectedNodeCollapsed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: selectedNodeCollapsed ? 0 : 12,
                fontSize: 14,
                fontWeight: 600,
                color: '#374151',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                padding: 0
              }}
            >
              {selectedNodeCollapsed ? (
                <ChevronRight className="icon-small" style={{ color: '#64748b' }} />
              ) : (
                <ChevronDown className="icon-small" style={{ color: '#64748b' }} />
              )}
              <Type className="icon-small" style={{ color: '#64748b' }} />
              Nœud sélectionné
            </button>

            {!selectedNodeCollapsed && (
              <>
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

                {/* FR: Contenu des onglets */}
                {/* EN: Tab content */}
                <div className="properties-content">
                  {activeTab === 'content' && (
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

                      {/* FR: Section Tags */}
                      {/* EN: Tags section */}
                      <div className="form-group">
                        <label htmlFor="np-tags">
                          <Tag className="icon-small" style={{ width: 14, height: 14, display: 'inline', marginRight: 4 }} />
                          Tags
                        </label>

                        {/* FR: Liste des tags existants */}
                        {/* EN: Existing tags list */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                          {selectedNode.tags && selectedNode.tags.length > 0 ? (
                            selectedNode.tags.map((tag, index) => (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '4px 8px',
                                  background: '#f1f5f9',
                                  borderRadius: 4,
                                  fontSize: 12,
                                  color: '#475569'
                                }}
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!activeFile?.content || !selectedNodeId) return;
                                    const command = new RemoveTagCommand(selectedNodeId, tag);
                                    const newMap = command.execute(activeFile.content);
                                    useOpenFiles.setState((state) => ({
                                      openFiles: state.openFiles.map(f =>
                                        f.id === activeFile.id ? { ...f, content: newMap } : f
                                      )
                                    }));
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#94a3b8'
                                  }}
                                  title="Retirer ce tag"
                                >
                                  <X style={{ width: 12, height: 12 }} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                              Aucun tag
                            </div>
                          )}
                        </div>

                        {/* FR: Input pour ajouter un nouveau tag */}
                        {/* EN: Input to add new tag */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            id="np-tags"
                            type="text"
                            value={newTag}
                            className="input"
                            placeholder="Ajouter un tag..."
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newTag.trim() && activeFile?.content && selectedNodeId) {
                                const command = new AddTagCommand(selectedNodeId, newTag.trim());
                                const newMap = command.execute(activeFile.content);
                                useOpenFiles.setState((state) => ({
                                  openFiles: state.openFiles.map(f =>
                                    f.id === activeFile.id ? { ...f, content: newMap } : f
                                  )
                                }));
                                setNewTag('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              if (!newTag.trim() || !activeFile?.content || !selectedNodeId) return;
                              const command = new AddTagCommand(selectedNodeId, newTag.trim());
                              const newMap = command.execute(activeFile.content);
                              useOpenFiles.setState((state) => ({
                                openFiles: state.openFiles.map(f =>
                                  f.id === activeFile.id ? { ...f, content: newMap } : f
                                )
                              }));
                              setNewTag('');
                            }}
                            disabled={!newTag.trim()}
                            style={{
                              padding: '8px 16px',
                              background: newTag.trim() ? 'var(--accent-color)' : '#e2e8f0',
                              color: newTag.trim() ? '#fff' : '#94a3b8',
                              border: 'none',
                              borderRadius: 6,
                              cursor: newTag.trim() ? 'pointer' : 'not-allowed',
                              fontSize: 12,
                              fontWeight: 500
                            }}
                          >
                            Ajouter
                          </button>
                        </div>
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

                  {activeTab === 'style' && (
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

                  {activeTab === 'advanced' && (
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
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default NodeProperties;
