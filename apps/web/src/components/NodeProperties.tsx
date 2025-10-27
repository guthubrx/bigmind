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
  Settings,
  Tag,
} from 'lucide-react';
import { useMindmap } from '../hooks/useMindmap';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { useSelection } from '../hooks/useSelection';
import { useTagStore } from '../hooks/useTagStore';
import NodeTagPanel from './NodeTagPanel';
import MarkdownEditor from './MarkdownEditor';
import './NodeProperties.css';

function NodeProperties() {
  const { selection } = useMindmap();
  const activeFile = useOpenFiles(state => state.openFiles.find(f => f.isActive) || null);
  const selectedNodeId = useSelection(s => s.selectedNodeId) || selection.primaryNode;
  const updateActiveFileNode = useOpenFiles(s => s.updateActiveFileNode);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'tags' | 'advanced'>('content');

  // FR: Sélecteur réactif pour le nombre de tags du nœud
  // EN: Reactive selector for node tags count
  const nodeTagsCount = useTagStore(state =>
    selectedNodeId && state.nodeTagMap[selectedNodeId]
      ? state.nodeTagMap[selectedNodeId].size
      : 0
  );

  const selectedNode = selectedNodeId ? activeFile?.content?.nodes?.[selectedNodeId] : null;

  if (!selectedNode) {
    return (
      <div className="node-properties">
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
            className={`tab ${activeTab === 'tags' ? 'active' : ''}`}
            onClick={() => setActiveTab('tags')}
          >
            <Tag className="icon-small" />
            Tags
            {nodeTagsCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  height: '16px',
                  padding: '0 4px',
                  background: 'var(--accent-color)',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'white',
                  marginLeft: '6px',
                }}
              >
                {nodeTagsCount}
              </span>
            )}
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
                <input
                  type="text"
                  value={selectedNode.title}
                  className="input input-inline"
                  placeholder="Titre du nœud..."
                  aria-label="Titre du nœud"
                  onChange={e =>
                    selectedNodeId &&
                    updateActiveFileNode(selectedNodeId, { title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <MarkdownEditor
                  value={selectedNode.notes || ''}
                  onChange={(value) =>
                    selectedNodeId &&
                    updateActiveFileNode(selectedNodeId, { notes: value })
                  }
                  placeholder="Ajouter des notes (format Markdown)..."
                  height={250}
                />
              </div>

              <div className="form-group">
                <div className="form-label">Alignement</div>
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
                <div className="form-label">Couleur de fond</div>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={selectedNode.style?.backgroundColor || '#ffffff'}
                    className="color-input"
                    aria-label="Couleur de fond"
                    onChange={e =>
                      selectedNodeId &&
                      updateActiveFileNode(selectedNodeId, {
                        style: { ...selectedNode.style, backgroundColor: e.target.value },
                      })
                    }
                  />
                  <input
                    type="text"
                    value={selectedNode.style?.backgroundColor || '#ffffff'}
                    className="input"
                    aria-label="Code couleur de fond"
                    onChange={e =>
                      selectedNodeId &&
                      updateActiveFileNode(selectedNodeId, {
                        style: { ...selectedNode.style, backgroundColor: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label">Couleur du texte</div>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={selectedNode.style?.textColor || '#000000'}
                    className="color-input"
                    aria-label="Couleur du texte"
                    onChange={e =>
                      selectedNodeId &&
                      updateActiveFileNode(selectedNodeId, {
                        style: { ...selectedNode.style, textColor: e.target.value },
                      })
                    }
                  />
                  <input
                    type="text"
                    value={selectedNode.style?.textColor || '#000000'}
                    className="input"
                    aria-label="Code couleur du texte"
                    onChange={e =>
                      selectedNodeId &&
                      updateActiveFileNode(selectedNodeId, {
                        style: { ...selectedNode.style, textColor: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label">Taille de police</div>
                <input
                  type="number"
                  value={selectedNode.style?.fontSize || 14}
                  className="input"
                  aria-label="Taille de police"
                  min="8"
                  max="72"
                  onChange={e =>
                    selectedNodeId &&
                    updateActiveFileNode(selectedNodeId, {
                      style: { ...selectedNode.style, fontSize: Number(e.target.value) },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <div className="form-label">Style de police</div>
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

          {activeTab === 'tags' && selectedNodeId && (
            <div className="tags-tab">
              <NodeTagPanel nodeId={selectedNodeId} />
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="advanced-tab">
              <div className="form-group">
                <div className="form-label">ID du nœud</div>
                <input
                  type="text"
                  value={selectedNode.id}
                  className="input"
                  aria-label="ID du nœud"
                  readOnly
                />
              </div>

              <div className="form-group">
                <div className="form-label">Nœud parent</div>
                <input
                  type="text"
                  value={selectedNode.parentId || 'Aucun'}
                  className="input"
                  aria-label="Nœud parent"
                  readOnly
                />
              </div>

              <div className="form-group">
                <div className="form-label">Position</div>
                <div className="position-inputs">
                  <input
                    type="number"
                    value={selectedNode.x || 0}
                    className="input"
                    placeholder="X"
                    aria-label="Position X"
                  />
                  <input
                    type="number"
                    value={selectedNode.y || 0}
                    className="input"
                    placeholder="Y"
                    aria-label="Position Y"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label">Taille</div>
                <div className="size-inputs">
                  <input
                    type="number"
                    value={selectedNode.width || 200}
                    className="input"
                    placeholder="Largeur"
                    aria-label="Largeur du nœud"
                  />
                  <input
                    type="number"
                    value={selectedNode.height || 40}
                    className="input"
                    placeholder="Hauteur"
                    aria-label="Hauteur du nœud"
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
