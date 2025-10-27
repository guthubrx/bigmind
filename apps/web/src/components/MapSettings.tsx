/**
 * FR: Paramètres spécifiques à la carte mentale courante
 * EN: Settings specific to the current mind map
 */

import React from 'react';
import { Settings } from 'lucide-react';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useAppSettings } from '../hooks/useAppSettings';
import { getAllPalettes } from '../themes/colorPalettes';
import PaletteSelector from './PaletteSelector';
import './MapSettings.css';

function MapSettings() {
  const activeFile = useOpenFiles(state => state.openFiles.find(f => f.isActive) || null);
  const updateNodePalette = useOpenFiles(state => state.updateActiveFileNodePalette);
  const updateTagPalette = useOpenFiles(state => state.updateActiveFileTagPalette);
  const defaultNodePaletteId = useAppSettings(s => s.defaultNodePaletteId);
  const defaultTagPaletteId = useAppSettings(s => s.defaultTagPaletteId);
  const allPalettes = getAllPalettes();

  if (!activeFile) {
    return (
      <div className="map-settings">
        <div className="panel-content">
          <div className="no-map">
            <Settings className="icon" />
            <p>Aucune carte ouverte</p>
            <span>Ouvrez une carte pour voir ses paramètres</span>
          </div>
        </div>
      </div>
    );
  }

  // FR: Utiliser les palettes de la carte ou les palettes par défaut
  // EN: Use map palettes or default palettes
  const currentNodePaletteId = activeFile.content?.nodePaletteId || defaultNodePaletteId;
  const currentTagPaletteId = activeFile.content?.tagPaletteId || defaultTagPaletteId;

  const handleNodePaletteChange = (paletteId: string) => {
    updateNodePalette(paletteId);
  };

  const handleTagPaletteChange = (paletteId: string) => {
    updateTagPalette(paletteId);
  };

  return (
    <div className="map-settings">
      <div className="panel-content">
        <div className="map-settings-header">
          <Settings className="icon-small" />
          <h3>Paramètres de la carte</h3>
        </div>

        <div className="map-settings-section">
          <h4 className="map-settings-section-title">Palettes de couleurs</h4>

          <div className="map-settings-field">
            <div className="map-settings-label">Palette des nœuds</div>
            <PaletteSelector
              palettes={allPalettes}
              value={currentNodePaletteId}
              onChange={handleNodePaletteChange}
              aria-label="Palette des nœuds de cette carte"
            />
            {!activeFile.content?.nodePaletteId && (
              <span className="map-settings-hint">Par défaut</span>
            )}
          </div>

          <div className="map-settings-field">
            <div className="map-settings-label">Palette des tags</div>
            <PaletteSelector
              palettes={allPalettes}
              value={currentTagPaletteId}
              onChange={handleTagPaletteChange}
              aria-label="Palette des tags de cette carte"
            />
            {!activeFile.content?.tagPaletteId && (
              <span className="map-settings-hint">Par défaut</span>
            )}
          </div>
        </div>

        <div className="map-settings-section">
          <h4 className="map-settings-section-title">Informations</h4>

          <div className="map-settings-info">
            <div className="map-settings-info-row">
              <span className="map-settings-info-label">Nom</span>
              <span className="map-settings-info-value">{activeFile.name}</span>
            </div>
            <div className="map-settings-info-row">
              <span className="map-settings-info-label">Type</span>
              <span className="map-settings-info-value">{activeFile.type}</span>
            </div>
            {activeFile.content?.nodes && (
              <div className="map-settings-info-row">
                <span className="map-settings-info-label">Nœuds</span>
                <span className="map-settings-info-value">
                  {Object.keys(activeFile.content.nodes).length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapSettings;
