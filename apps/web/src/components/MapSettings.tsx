/**
 * FR: Paramètres spécifiques à la carte mentale courante
 * EN: Settings specific to the current mind map
 */

import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { getMapSettingsSections, onMapSettingsRegistryChange } from '../utils/mapSettingsRegistry';
import './MapSettings.css';

function MapSettings() {
  const activeFile = useOpenFiles(state => state.openFiles.find(f => f.isActive) || null);
  const updateDefaultNodeStyle = useOpenFiles(state => state.updateActiveFileDefaultNodeStyle);
  const [settingsVersion, setSettingsVersion] = useState(0);

  // Force re-render when map settings registry changes
  useEffect(() => {
    // Force initial render to pick up any sections already registered
    setSettingsVersion(v => v + 1);

    const unsubscribe = onMapSettingsRegistryChange(() => {
      setSettingsVersion(v => v + 1);
    });

    return unsubscribe;
  }, []);

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

  const mapSections = getMapSettingsSections();

  return (
    <div className="map-settings">
      <div className="panel-content">
        <div className="map-settings-header">
          <Settings className="icon-small" />
          <h3>Paramètres de la carte</h3>
        </div>

        {/* FR: Sections dynamiques injectées par les plugins */}
        {/* EN: Dynamic sections injected by plugins */}
        {mapSections.map(section => {
          const Component = section.component;
          return <Component key={`${section.id}-${settingsVersion}`} activeFile={activeFile} />;
        })}

        <div className="map-settings-section">
          <h4 className="map-settings-section-title">Style des nœuds</h4>

          <div className="map-settings-field">
            <div className="map-settings-label">Taille de police</div>
            <input
              type="number"
              min="8"
              max="72"
              value={activeFile.content?.defaultNodeStyle?.fontSize || 14}
              onChange={e => {
                updateDefaultNodeStyle({ fontSize: Number(e.target.value) });
              }}
              className="map-settings-input"
              aria-label="Taille de police des nœuds"
            />
            <span className="map-settings-unit">px</span>
          </div>

          <div className="map-settings-field">
            <div className="map-settings-label">Largeur des nœuds</div>
            <input
              type="number"
              min="100"
              max="800"
              step="10"
              value={activeFile.content?.defaultNodeStyle?.width || 200}
              onChange={e => {
                updateDefaultNodeStyle({ width: Number(e.target.value) });
              }}
              className="map-settings-input"
              aria-label="Largeur des nœuds"
            />
            <span className="map-settings-unit">px</span>
          </div>

          <div className="map-settings-field">
            <div className="map-settings-label">Police de caractères</div>
            <select
              value={activeFile.content?.defaultNodeStyle?.fontFamily || 'inherit'}
              onChange={e => {
                updateDefaultNodeStyle({ fontFamily: e.target.value });
              }}
              className="map-settings-select"
              aria-label="Police des nœuds"
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
