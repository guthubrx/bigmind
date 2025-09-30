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
  Settings
} from 'lucide-react';
import { useMindmap } from '../hooks/useMindmap';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useSelection } from '../hooks/useSelection';
import './NodeProperties.css';

function NodeProperties() {
  const { selection } = useMindmap();
  const activeFile = useOpenFiles((state) => state.openFiles.find(f => f.isActive) || null);
  const selectedNodeId = useSelection((s) => s.selectedNodeId) || selection.primaryNode;
  const updateActiveFileNode = useOpenFiles((s) => s.updateActiveFileNode);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

  const selectedNode = selectedNodeId ? activeFile?.content?.nodes?.[selectedNodeId] : null;

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
      </div>
    </div>
  );
}

export default NodeProperties;
