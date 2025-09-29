/**
 * FR: Propriétés du nœud sélectionné
 * EN: Selected node properties
 */

import React, { useState } from 'react';
import { 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  Image,
  Link,
  Settings
} from 'lucide-react';
import { useMindmap } from '../hooks/useMindmap';
import './NodeProperties.css';

const NodeProperties: React.FC = () => {
  const { mindMap, selection } = useMindmap();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

  const selectedNode = selection.primaryNode ? mindMap?.nodes[selection.primaryNode] : null;

  if (!selectedNode) {
    return (
      <div className="node-properties">
        <div className="panel-header">
          <span>Propriétés</span>
        </div>
        <div className="panel-content">
          <div className="no-selection">
            <Settings className="icon" />
            <p>Aucun nœud sélectionné</p>
            <span>Sélectionnez un nœud pour voir ses propriétés</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="node-properties">
      <div className="panel-header">
        <span>Propriétés</span>
      </div>
      
      <div className="panel-content">
        {/* FR: Onglets */}
        {/* EN: Tabs */}
        <div className="properties-tabs">
          <button
            className={`tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <Type className="icon-small" />
            Contenu
          </button>
          <button
            className={`tab ${activeTab === 'style' ? 'active' : ''}`}
            onClick={() => setActiveTab('style')}
          >
            <Palette className="icon-small" />
            Style
          </button>
          <button
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
                <label>Titre</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  className="input"
                  placeholder="Titre du nœud"
                />
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={selectedNode.notes || ''}
                  className="input textarea"
                  placeholder="Notes additionnelles..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Alignement</label>
                <div className="alignment-buttons">
                  <button className="btn" title="Gauche">
                    <AlignLeft className="icon-small" />
                  </button>
                  <button className="btn" title="Centre">
                    <AlignCenter className="icon-small" />
                  </button>
                  <button className="btn" title="Droite">
                    <AlignRight className="icon-small" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="style-tab">
              <div className="form-group">
                <label>Couleur de fond</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={selectedNode.style?.backgroundColor || '#ffffff'}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={selectedNode.style?.backgroundColor || '#ffffff'}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Couleur du texte</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={selectedNode.style?.textColor || '#000000'}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={selectedNode.style?.textColor || '#000000'}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Taille de police</label>
                <input
                  type="number"
                  value={selectedNode.style?.fontSize || 14}
                  className="input"
                  min="8"
                  max="72"
                />
              </div>

              <div className="form-group">
                <label>Style de police</label>
                <div className="font-style-buttons">
                  <button className="btn" title="Gras">
                    <Bold className="icon-small" />
                  </button>
                  <button className="btn" title="Italique">
                    <Italic className="icon-small" />
                  </button>
                  <button className="btn" title="Souligné">
                    <Underline className="icon-small" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="advanced-tab">
              <div className="form-group">
                <label>ID du nœud</label>
                <input
                  type="text"
                  value={selectedNode.id}
                  className="input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Nœud parent</label>
                <input
                  type="text"
                  value={selectedNode.parentId || 'Aucun'}
                  className="input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Position</label>
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
                <label>Taille</label>
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
};

export default NodeProperties;
