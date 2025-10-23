/**
 * FR: Panneau de tagging pour les nœuds de la MindMap
 * EN: Tagging panel for MindMap nodes
 */

import React, { useState } from 'react';
import { Tag, Plus, X, Hash } from 'lucide-react';
import { useMindMapDAGSync } from '../hooks/useMindMapDAGSync';
import { useTagGraph } from '../hooks/useTagGraph';
import './NodeTagPanel.css';

interface NodeTagPanelProps {
  nodeId: string | null;
  onClose?: () => void;
  position?: { x: number; y: number };
}

export function NodeTagPanel({ nodeId, onClose, position }: NodeTagPanelProps) {
  const sync = useMindMapDAGSync();
  const tagGraph = useTagGraph();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // Obtenir les tags du nœud actuel
  const nodeTags = nodeId ? sync.getNodeTags(nodeId) : [];
  const nodeTagIds = nodeTags.map(t => t.id);

  // Filtrer les tags disponibles
  const availableTags = tagGraph.tags.filter(
    tag =>
      !nodeTagIds.includes(tag.id) && tag.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!nodeId) return null;

  const handleAddTag = (tagId: string) => {
    sync.tagNode(nodeId, tagId);
    setSearchQuery('');
  };

  const handleRemoveTag = (tagId: string) => {
    sync.untagNode(nodeId, tagId);
  };

  const handleCreateNewTag = () => {
    if (!newTagName.trim()) return;

    const newTagId = newTagName.toLowerCase().replace(/\s+/g, '-');

    // Créer le nouveau tag
    tagGraph.addTag({
      id: newTagId,
      label: newTagName,
      visible: true,
      nodeIds: [nodeId],
    });

    // L'associer au nœud
    sync.tagNode(nodeId, newTagId);

    setNewTagName('');
    setShowAddForm(false);
  };

  return (
    <div
      className="node-tag-panel"
      style={
        position
          ? {
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
            }
          : undefined
      }
    >
      {/* FR: En-tête */}
      {/* EN: Header */}
      <div className="panel-header">
        <div className="header-title">
          <Hash size={16} />
          <span>Tags du nœud</span>
        </div>
        {onClose && (
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* FR: Tags actuels */}
      {/* EN: Current tags */}
      <div className="current-tags">
        {nodeTags.length === 0 ? (
          <div className="empty-state">
            <Tag size={20} />
            <span>Aucun tag</span>
          </div>
        ) : (
          <div className="tag-list">
            {nodeTags.map(tag => (
              <div key={tag.id} className="tag-chip">
                <div className="tag-color" style={{ backgroundColor: tag.color || '#3B82F6' }} />
                <span>{tag.label}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FR: Recherche et ajout */}
      {/* EN: Search and add */}
      <div className="add-tag-section">
        <input
          type="text"
          placeholder="Rechercher un tag..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />

        {searchQuery && availableTags.length > 0 && (
          <div className="suggestions">
            {availableTags.slice(0, 5).map(tag => (
              <button
                key={tag.id}
                type="button"
                className="suggestion-item"
                onClick={() => handleAddTag(tag.id)}
              >
                <div className="tag-color" style={{ backgroundColor: tag.color || '#3B82F6' }} />
                <span>{tag.label}</span>
                {tag.nodeIds && tag.nodeIds.length > 0 && (
                  <span className="usage-badge">{tag.nodeIds.length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* FR: Créer un nouveau tag */}
        {/* EN: Create new tag */}
        {!showAddForm ? (
          <button type="button" className="create-tag-btn" onClick={() => setShowAddForm(true)}>
            <Plus size={14} />
            <span>Créer un tag</span>
          </button>
        ) : (
          <div className="new-tag-form">
            <input
              type="text"
              placeholder="Nom du tag..."
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleCreateNewTag()}
              className="tag-name-input"
            />
            <button type="button" className="btn-primary" onClick={handleCreateNewTag}>
              Créer
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowAddForm(false);
                setNewTagName('');
              }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* FR: Statistiques */}
      {/* EN: Statistics */}
      <div className="panel-footer">
        <div className="stats">
          <span className="stat-item">
            {nodeTags.length} tag{nodeTags.length > 1 ? 's' : ''}
          </span>
          <span className="stat-divider">•</span>
          <span className="stat-item">{tagGraph.tags.length} disponibles</span>
        </div>
      </div>
    </div>
  );
}

export default NodeTagPanel;
